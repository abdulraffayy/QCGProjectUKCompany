import React, { useState, useEffect, useRef, ReactElement } from 'react';

// TypeScript interfaces
interface ExplanationAttachment {
  id: number;
  content: string;
  explanationType: string;
  isCollapsed: boolean;
  position: number; // Track position in content
}

const Dummy: React.FC = () => {
  // State variables
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [selectedLinePosition, setSelectedLinePosition] = useState<number>(-1);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentExplanationType, setCurrentExplanationType] = useState<string>('explain');
  const [aiResponse, setAiResponse] = useState<string>('');

  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [explanations, setExplanations] = useState<ExplanationAttachment[]>([]);
  
  // New state variables for AI API
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiReference, setAiReference] = useState<string>('');
  const [isAIGenerating, setIsAIGenerating] = useState<boolean>(false);
  const [responseHistory, setResponseHistory] = useState<Array<{type: string, content: string, timestamp: number}>>([]);
  
  // Refs
  const lessonContentRef = useRef<HTMLDivElement>(null);
  const explanationCounter = useRef<number>(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Parse markdown content
  const parseMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  };

 // Find the line number of selected text using DOM position (always return last line)
const findSelectedLinePosition = (selectedText: string, range: Range): number => {
  if (!lessonContentRef.current) return -1;

  const lines = lessonContent.split('\n');
  const cleanSelectedText = selectedText.trim().replace(/\s+/g, ' ').toLowerCase();

  console.log('Finding position for selected text:', selectedText);
  console.log('Clean selected text:', cleanSelectedText);

  const container = lessonContentRef.current;

  // ✅ Use the END of selection instead of the start
  let currentNode = range.endContainer;
  let targetElement: Element | null = null;

  // Walk up the DOM tree to find the closest block element (DIV or P)
  while (currentNode && currentNode !== container) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const element = currentNode as Element;
      if (element.tagName === 'DIV' || element.tagName === 'P') {
        targetElement = element;
        break;
      }
    }
    currentNode = currentNode.parentNode as Node;
  }

  // If we found a DOM element, map it to its index
  if (targetElement) {
    const allDivs = Array.from(container.querySelectorAll('div'));
    const elementIndex = allDivs.indexOf(targetElement as HTMLDivElement);

    if (elementIndex !== -1) {
      console.log('Found element at index (end of selection):', elementIndex);
      return elementIndex; // ✅ always the last line
    }
  }

  // Fallback: find the last line containing part of the selected text
  let lastMatchingLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const cleanLine = lines[i].replace(/\s+/g, ' ').toLowerCase();
    const selectedWords = cleanSelectedText.split(' ');

    const hasMatchingWord = selectedWords.some(
      (word) => word.length > 2 && cleanLine.includes(word)
    );

    if (hasMatchingWord) {
      lastMatchingLine = i;
      console.log('Found matching word in line:', i, 'Line content:', lines[i]);
    }
  }

  if (lastMatchingLine !== -1) {
    console.log('Returning last matching line:', lastMatchingLine);
    return lastMatchingLine;
  }

  // Final fallback: try exact/partial text match
  for (let i = lines.length - 1; i >= 0; i--) {
    const cleanLine = lines[i].replace(/\s+/g, ' ').toLowerCase();
    if (
      cleanLine.includes(cleanSelectedText) ||
      cleanSelectedText.includes(cleanLine)
    ) {
      console.log('Found exact match at line:', i);
      return i;
    }
  }

  console.log('No match found for selected text');
  return -1;
};


  // Handle text selection
  const handleTextSelection = (e: React.MouseEvent | React.TouchEvent) => {
    const selection = window.getSelection();
    if (!selection) return;
    
    const text = selection.toString().trim();
    if (text !== '') {
      setSelectedText(text);
      setSelectedRange(selection.getRangeAt(0));
      
      // Find the position of the selected line
      const linePosition = findSelectedLinePosition(text, selection.getRangeAt(0));
      setSelectedLinePosition(linePosition);
      
      // Position tooltip
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setTooltipPosition({ x: clientX, y: clientY - 40 });
      setShowTooltip(true);
      
      // Show popup after delay
      setTimeout(() => {
        setIsPopupOpen(true);
        setShowTooltip(false);
      }, 300);
    }
  };

  // Highlight selected text
  const highlightSelectedText = () => {
    if (!selectedRange || !lessonContentRef.current) return;
    
    const span = document.createElement('span');
    span.className = 'bg-gradient-to-r from-cyan-200 to-pink-200 p-0.5 rounded-md animate-pulse';
    
    try {
      selectedRange.surroundContents(span);
    } catch (e) {
      console.log('Complex selection detected');
    }
  };

  // Close popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setAiResponse('');
    setAiQuery('');
    setAiReference('');
    setSelectedLinePosition(-1);
    setResponseHistory([]); // Clear response history when closing popup
    
    // Clear selection highlighting
    if (lessonContentRef.current) {
      const highlighted = lessonContentRef.current.querySelectorAll('.bg-gradient-to-r');
      highlighted.forEach(el => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ''), el);
          parent.normalize();
        }
      });
    }
    
    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  // Real AI request function
  const sendExplanationRequest = async () => {
    setIsLoading(true);
    setIsAIGenerating(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('User token is missing! Please login again.');
        return;
      }

      // Map explanation types to generation types
      const generationTypeMap: { [key: string]: string } = {
        'explain': 'explanation',
        'summary': 'summary',
        'detailed': 'detailed_explanation',
        'examples': 'examples'
      };

      const generation_type = generationTypeMap[currentExplanationType] || 'explanation';
      const material = aiReference || selectedText;
      const qaqf_level = "1"; // Default QAQF level
      const subject = selectedText;
      const userquery = aiQuery || `Please ${currentExplanationType} this text: ${selectedText}`;

      const response = await fetch('http://38.29.145.85:8000/api/ai/assessment-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          generation_type,
          material,
          qaqf_level,
          subject,
          userquery,
          courseid: '', // You can add course ID if needed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      
             if (data.generated_content && data.generated_content.length > 0) {
         // ✅ Add new response to history
         const newResponse = {
           type: currentExplanationType,
           content: data.generated_content,
           timestamp: Date.now()
         };
         
         setResponseHistory(prev => [...prev, newResponse]);
         
         // Update the main AI response to show all responses
         const allResponses = [...responseHistory, newResponse];
         const formattedResponses = allResponses.map((resp,) => {
           const time = new Date(resp.timestamp).toLocaleTimeString();
           return `--- ${resp.type.toUpperCase()} (${time}) ---\n\n${resp.content}`;
         }).join('\n\n');
         
         setAiResponse(formattedResponses);
       } else {
         setAiResponse('No content generated. Please try again.');
       }
    } catch (error) {
      console.error('AI Generate error:', error);
      setAiResponse('AI generation failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      setIsAIGenerating(false);
    }
  };

  // Attach explanation to lesson at the selected line position
  const attachExplanation = () => {
    if (selectedLinePosition === -1) {
      console.log('No line position found for selected text:', selectedText);
      alert('Could not find the exact position for the selected text. Please try selecting the text again.');
      return;
    }
    
    explanationCounter.current += 1;
    
    const newExplanation: ExplanationAttachment = {
      id: Date.now(),
      content: aiResponse,
      explanationType: currentExplanationType,
      isCollapsed: false,
      position: selectedLinePosition,
    };
    
    console.log('Adding explanation at position:', selectedLinePosition, 'for text:', selectedText);
    console.log('New explanation:', newExplanation);
    console.log('Current explanations before adding:', explanations);
    
    const updatedExplanations = [...explanations, newExplanation];
    console.log('Updated explanations:', updatedExplanations);
    
    setExplanations(updatedExplanations);
    closePopup();
  };

  // Toggle explanation visibility
  const toggleExplanation = (id: number) => {
    setExplanations(explanations.map(exp => 
      exp.id === id ? { ...exp, isCollapsed: !exp.isCollapsed } : exp
    ));
  };


  const removeExplanation = (id: number) => {
    setExplanations(explanations.filter(exp => exp.id !== id));
  };

  // Render lesson content with explanations inserted at their positions
  const renderLessonContentWithExplanations = () => {
    const lines = lessonContent.split('\n');
    const sortedExplanations = [...explanations].sort((a, b) => a.position - b.position);
    
    console.log('Rendering lesson content with explanations:', sortedExplanations);
    console.log('Total explanations:', explanations.length);
    console.log('Line positions of explanations:', sortedExplanations.map(exp => exp.position));
    console.log('Total lines in content:', lines.length);
    
    let result: ReactElement[] = [];
    let explanationIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
    
      result.push(
        <div key={`line-${i}`} className="mb-2" dangerouslySetInnerHTML={{ __html: parseMarkdown(lines[i]) }}></div>
      );
      
      // Check if there are explanations to insert after this line
      while (explanationIndex < sortedExplanations.length && sortedExplanations[explanationIndex].position === i) {
        const explanation = sortedExplanations[explanationIndex];
        console.log(`Inserting explanation ${explanation.id} after line ${i} for text: "${explanation.content.substring(0, 50)}..."`);
        result.push(
          <div 
            key={`explanation-${explanation.id}`}
            className="my-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-indigo-500 p-4 rounded-lg animate-slideIn"
          >
            <div 
              className="flex justify-between items-center cursor-pointer mb-2"
              onClick={() => toggleExplanation(explanation.id)}
            >
              <div className="font-bold text-gray-800 flex items-center">
                <span className="mr-2">💡</span>
                AI Explanation ({explanation.explanationType})
              </div>
              <div className="flex gap-2">
                <button 
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newContent = prompt('Edit explanation:', explanation.content);
                    if (newContent) {
                      setExplanations(explanations.map(exp => 
                        exp.id === explanation.id ? { ...exp, content: newContent } : exp
                      ));
                    }
                  }}
                >
                  ✏️
                </button>
                <button 
                  className="text-red-500 hover:text-red-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExplanation(explanation.id);
                  }}
                >
                  🗑️
                </button>
                <span>{explanation.isCollapsed ? '➡️' : '⬇️'}</span>
              </div>
            </div>
            
            {!explanation.isCollapsed && (
              <div 
                className="mt-3 text-gray-700"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(explanation.content) }}
              ></div>
            )}
          </div>
        );
        explanationIndex++;
      }
    }
    
    return result;
  };



  useEffect(() => {
    if (selectedText && isPopupOpen) {
      highlightSelectedText();
    }
  }, [selectedText, isPopupOpen]);

  // Lesson content
  const lessonContent = `
    **Course Title:** Race Story Course - QAQF Level Beginner

    **Duration:** 1 week(s)
    
    **Module Count:** 4
    
    **Delivery Mode:** Online
    
    **Target Audience:** Kids
    
    **Learning Objectives:**
    
    * To create a compelling race story using descriptive language and imaginative techniques
    * To understand the structure and format of a typical race story
    * To develop creative writing skills through the use of metaphors, similes, and other literary devices
    * To build confidence in expressing oneself through written communication
    
    **Weekly Module Breakdown:**
    
    **Module 1: Introduction to Race Stories (Days 1-2)**
    
    * Learning Outcomes:
      + Understand the concept of a race story and its importance in literature
      + Identify key elements of a typical race story, such as setting, characters, and plot
      + Learn how to use descriptive language to create vivid imagery
    * Instructional Methods:
      + Video lectures introducing the concept of race stories
      + Guided reading exercises to familiarize students with examples of race stories
      + Interactive quizzes to assess understanding
    * Assessment Strategy: Quiz (20%) - "What is a Race Story?"
    
    **Module 2: Building a Narrative (Days 3-4)**
    
    * Learning Outcomes:
      + Learn how to create a compelling narrative structure for a race story
      + Understand the importance of pacing, tension, and resolution in a story
      + Practice writing descriptive paragraphs using sensory details
    * Instructional Methods:
      + Writing workshops where students practice building a narrative
      + Guided writing exercises to help students develop their creative writing skills
      + One-on-one feedback sessions to support student progress
    * Assessment Strategy: Assignment (40%) - "Write a descriptive paragraph about a racing event"
    
    **Module 3: Creative Writing Techniques (Days 5-6)**
    
    * Learning Outcomes:
      + Learn how to use metaphors, similes, and other literary devices to enhance writing
      + Understand the importance of figurative language in creating vivid imagery
      + Practice using sensory details to describe a racing event
    * Instructional Methods:
      + Writing workshops where students practice using creative writing techniques
      + Guided reading exercises to familiarize students with examples of metaphors and similes
      + Interactive quizzes to assess understanding
    * Assessment Strategy: Quiz (20%) - "Identify Literary Devices"
    
    **Module 4: Final Project and Review (Days 7)**
    
    * Learning Outcomes:
      + Write a complete race story using the skills learned throughout the course
      + Revise and edit work for clarity, coherence, and style
      + Present final projects to the class for peer feedback and review
    * Instructional Methods:
      + Writing workshops where students share and discuss their final projects
      + One-on-one feedback sessions to support student progress
      + Review of key concepts and strategies learned throughout the course
    * Assessment Strategy: Final Project (20%) - "Write a Complete Race Story"
    
    **Embedded Assessment Strategies:**
    
    * Quizzes to assess understanding of learning objectives
    * Assignments to evaluate application of skills and knowledge
    * Peer feedback and review to promote critical thinking and collaboration
    
    **Real-World Application Opportunities:**
    
    * Students can share their final projects with family, friends, or online communities to build confidence in creative writing
    * Students can use the skills learned throughout the course to write short stories or scripts for presentations or performances
    
    **QAQF Level Beginner Standards:**
    
    * The course is designed to meet the learning objectives and standards set by the QAQF Level Beginner framework.
    * The course outline ensures that students receive a comprehensive education in creative writing, storytelling, and narrative structure.
    
    By following this course outline, students will develop the skills and confidence needed to create engaging race stories and become proficient writers.
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto">
       

        {/* Selection Tooltip */}
        {showTooltip && (
          <div 
            ref={tooltipRef}
            className="fixed bg-gray-900 text-white py-2 px-3 rounded-lg text-sm z-50 transition-opacity"
            style={{ 
              left: `${tooltipPosition.x}px`, 
              top: `${tooltipPosition.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            Click to explain this text
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-5 border-r-5 border-t-5 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* Overlay */}
        {isPopupOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={closePopup}
          ></div>
        )}

        {/* Popup */}
        {isPopupOpen && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 animate-popupIn">
            {/* Header - Fixed */}
            <div className="border-b border-gray-200 p-5 flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold text-gray-800">🧠 AI Explanation</h3>
              <button 
                className="text-gray-500 hover:text-red-500 text-2xl transition-colors"
                onClick={closePopup}
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="p-5 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                <strong className="text-gray-700">Selected text:</strong>
                <div 
                  className="mt-2 p-3 bg-white border border-gray-200 rounded-lg"
                  contentEditable
                  suppressContentEditableWarning
                >
                  {selectedText}
                </div>
              </div>
              
              <div className="p-5 flex flex-wrap gap-2">
                {['explain', 'summary', 'detailed', 'examples'].map((type) => (
                  <button
                    key={type}
                    className={`px-4 py-2 rounded-full border-2 transition-all ${
                      currentExplanationType === type
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 transform -translate-y-0.5'
                        : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                    }`}
                    onClick={() => setCurrentExplanationType(type)}
                  >
                    {type === 'explain' && '💡 Explain'}
                    {type === 'summary' && '📝 Summary'}
                    {type === 'detailed' && '🔍 Detailed'}
                    {type === 'examples' && '📋 Examples'}
                  </button>
                ))}
              </div>
              
            
              
              <div className="p-5">
                <button
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center"
                  onClick={sendExplanationRequest}
                  disabled={isLoading || isAIGenerating}
                >
                  {isLoading || isAIGenerating ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {isAIGenerating ? 'Get AI Explanation...' : 'Get Ai Explaination...'}
                    </div>
                  ) : (
                    <>
                      🚀 Get AI Explanation
                    </>
                  )}
                </button>
                
                                 {aiResponse && (
                   <div className="mt-5 p-5 bg-gray-50 rounded-xl border border-green-200">
                                           <h4 className="text-lg font-bold text-gray-800 mb-3 flex justify-between items-center">
                        <span>🤖 AI Response ({responseHistory.length} responses)</span>
                        <button
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded border border-red-300 hover:bg-red-50 transition-colors"
                          onClick={() => {
                            setAiResponse('');
                            setResponseHistory([]);
                          }}
                          title="Clear all responses"
                        >
                          🗑️ Clear
                        </button>
                      </h4>
                     <div 
                       className="text-gray-700 max-h-60 overflow-y-auto"
                       dangerouslySetInnerHTML={{ __html: parseMarkdown(aiResponse) }}
                     ></div>
                     
                     <div className="mt-4 flex gap-2">
                       <button
                         className="flex-1 py-2 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                         onClick={attachExplanation}
                       >
                         ✅ Attach to Lesson
                       </button>
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* Lesson Header */}
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">🎓 Interactive Lesson Platform</h1>
          <p className="text-gray-600 text-lg">
            Select any text to get AI-powered explanations and enhance your learning experience
          </p>
        </div>

        {/* Lesson Content */}
        <div 
          ref={lessonContentRef}
          className="bg-white bg-opacity-98 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden"
          onMouseUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
        >
          {/* Decorative gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400"></div>
          
          {/* Lesson Content with Explanations */}
          {renderLessonContentWithExplanations()}
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes popupIn {
          from { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.9);
          }
          to { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-popupIn {
          animation: popupIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dummy;