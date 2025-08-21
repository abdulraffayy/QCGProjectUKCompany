import React, { useState } from 'react';
import TiptapEditor from './TiptapEditor';

const TiptapEditorDemo: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle text selection
  const handleTextSelection = (text: string) => {
    setSelectedText(text);
    console.log('Selected text:', text);
  };

  // Handle AI explanation request
  const handleAiExplanationRequest = async (text: string, explanationType?: string) => {
    setIsLoading(true);
    setSelectedText(text);
    
    console.log('AI Explanation requested for:', text, 'Type:', explanationType);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = {
        explain: `Here's a simple explanation of "${text}": This is a basic explanation that helps understand the concept clearly.`,
        summary: `Summary of "${text}": A concise overview of the main points and key concepts.`,
        detailed: `Detailed analysis of "${text}": This is a comprehensive explanation that covers all aspects, including background, context, and implications.`,
        examples: `Examples related to "${text}": Here are some practical examples that illustrate this concept in real-world scenarios.`
      };
      
      const response = responses[explanationType as keyof typeof responses] || responses.explain;
      setAiResponse(response);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Enhanced TiptapEditor Demo
        </h1>
        <p className="text-gray-600">
          Select any text in the editor below to see the enhanced AI explanation features!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              📝 Rich Text Editor
            </h2>
            <TiptapEditor
              content={content}
              onContentChange={setContent}
              onTextSelection={handleTextSelection}
              onAiExplanationRequest={handleAiExplanationRequest}
              className="min-h-[400px] border border-gray-200 rounded-lg"
            />
          </div>

          {/* Selected Text Display */}
          {selectedText && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                🎯 Selected Text
              </h3>
              <p className="text-blue-700 bg-white p-3 rounded border">
                "{selectedText}"
              </p>
            </div>
          )}
        </div>

        {/* AI Response Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              🤖 AI Explanation
            </h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">Generating AI explanation...</span>
                </div>
              </div>
            ) : aiResponse ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ AI Response
                </h3>
                <div className="text-green-700 bg-white p-3 rounded border">
                  {aiResponse}
                </div>
                <button
                  onClick={() => setAiResponse('')}
                  className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Clear Response
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🤖</div>
                <p>Select text in the editor to get AI explanations</p>
                <p className="text-sm mt-1">Try different explanation types: Explain, Summary, Detailed, Examples</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              💡 How to Use
            </h3>
            <ul className="text-yellow-700 space-y-1 text-sm">
              <li>• Type or paste content in the editor</li>
              <li>• Select any text with your mouse</li>
              <li>• Choose explanation type: Explain, Summary, Detailed, or Examples</li>
              <li>• Click "Get AI Explanation" to generate response</li>
              <li>• Use quick action buttons for instant explanations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ✨ Enhanced Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-800">Smart Selection</h3>
            <p className="text-sm text-gray-600">Intelligent text selection with context-aware popup</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-800">AI Explanations</h3>
            <p className="text-sm text-gray-600">Multiple explanation types: Explain, Summary, Detailed, Examples</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-800">Quick Actions</h3>
            <p className="text-sm text-gray-600">Instant explanations with one-click buttons</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-semibold text-gray-800">Rich Formatting</h3>
            <p className="text-sm text-gray-600">Full rich text editor with formatting options</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiptapEditorDemo;
