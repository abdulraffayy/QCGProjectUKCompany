import { useEffect, useState } from "react";
import { Card, CardContent,} from "@/components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import { Plus } from "lucide-react";

interface Section {
  heading: string;
  content: string;
  key_points: string[];
  practical_application: string;
}

interface AssessmentData {
  title: string;
  module_code: string;
  qaqf_level: string;
  content_type: string;
  subject: string;
  target_audience: string;
  learning_objectives: string;
  assessment_methods: string;
  extra_sections: string;
  sections: Section[];
  summary: string;
}

// Props interface for the component
interface RafayComponentProps {
  onContentGenerated?: (content: string) => void;
  compact?: boolean; // For use in dialogs
}

// Simple state for API response

export default function AssessmentPage({ onContentGenerated, compact = false }: RafayComponentProps) {
  const [data, setData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState("");
 
  const [error, setError] = useState<string | null>(null);
  const [openQuerySections, setOpenQuerySections] = useState<number[]>([]);
  const [queryInputs, setQueryInputs] = useState<{ [key: number]: string }>({});
  const [queryResponses, setQueryResponses] = useState<{ [key: number]: string }>({});
  const [queryLoading, setQueryLoading] = useState<{ [key: number]: boolean }>({});

  // Function to format content for parent component
  const formatContentForParent = (assessmentData: AssessmentData) => {
    let formattedContent = `<h2>${assessmentData.title}</h2>`;
    formattedContent += `<p><strong>Module Code:</strong> ${assessmentData.module_code}</p>`;
    formattedContent += `<p><strong>QAQF Level:</strong> ${assessmentData.qaqf_level}</p>`;
    formattedContent += `<p><strong>Content Type:</strong> ${assessmentData.content_type}</p>`;
    formattedContent += `<p><strong>Subject:</strong> ${assessmentData.subject}</p>`;
    formattedContent += `<p><strong>Target Audience:</strong> ${assessmentData.target_audience}</p>`;
    formattedContent += `<p><strong>Learning Objectives:</strong> ${assessmentData.learning_objectives}</p>`;
    formattedContent += `<p><strong>Assessment Methods:</strong> ${assessmentData.assessment_methods}</p>`;
    
    assessmentData.sections.forEach((section) => {
      formattedContent += `<h3>${section.heading}</h3>`;
      formattedContent += `<p>${section.content}</p>`;
      formattedContent += `<h4>Key Points:</h4><ul>`;
      section.key_points.forEach(point => {
        formattedContent += `<li>${point}</li>`;
      });
      formattedContent += `</ul>`;
      formattedContent += `<p><strong>Practical Application:</strong> ${section.practical_application}</p>`;
    });
    
    formattedContent += `<h3>Summary</h3><p>${assessmentData.summary}</p>`;
    
    return formattedContent;
  };

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  const toggleQuerySection = (index: number) => {
    setOpenQuerySections(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleQueryInputChange = (index: number, value: string) => {
    setQueryInputs(prev => ({
      ...prev,
      [index]: value
    }));
    
    // Clear previous response when user starts typing new query
    if (queryResponses[index]) {
      setQueryResponses(prev => ({
        ...prev,
        [index]: ""
      }));
    }
  };

  const handleSearchQuery = async (index: number) => {
    const query = queryInputs[index];
    if (!query?.trim()) return;
    
    // Set loading state for this specific query
    setQueryLoading(prev => ({
      ...prev,
      [index]: true
    }));
    
    // Clear previous response
    setQueryResponses(prev => ({
      ...prev,
      [index]: ""
    }));
    
    try {
      const response = await fetch("/api/askquery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Full API Response:", result); // Debug log
      
      // Format the response to be simple and clean
      let formattedResponse = result.response.response;
      
      // Remove any HTML tags and clean up the response
      formattedResponse = formattedResponse
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\n\s*\n/g, '\n\n') // Remove extra line breaks
        .trim();
      
      setQueryResponses(prev => ({
        ...prev,
        [index]: formattedResponse
      }));
    } catch (error) {
      console.error("Error submitting query:", error);
      setQueryResponses(prev => ({
        ...prev,
        [index]: "Sorry, I couldn't process your query at the moment. Please try again later."
      }));
    } finally {
      // Clear loading state
      setQueryLoading(prev => ({
        ...prev,
        [index]: false
      }));
    }
  };

  // Function to add response to section card
  const addResponseToSection = (index: number) => {
    if (queryResponses[index] && data) {
      // Get existing content
      const existingContent = data.sections[index].content || "";
      const newResponse = queryResponses[index];
      
      // Append new response to existing content
      const updatedContent = existingContent 
        ? `${existingContent}\n\n--- NEW QUERY RESPONSE ---\n\n${newResponse}`
        : newResponse;
      
      // Update the section content
      const updatedData = { ...data };
      if (updatedData.sections && updatedData.sections[index]) {
        updatedData.sections[index].content = updatedContent;
        setData(updatedData);
        
        // Also update the parent component if callback exists
        if (onContentGenerated) {
          const formattedContent = formatContentForParent(updatedData);
          onContentGenerated(formattedContent);
        }
        
        console.log("Updated section content:", {
          sectionIndex: index,
          existingContent: existingContent,
          newResponse: newResponse,
          updatedContent: updatedContent
        });
      }
    }
  };

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/ai/test");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const resData = await response.json();
      console.log("Full API Response:", resData); // Debug log
      
      if (resData.data && resData.data.generated_content) {
        try {
          // Clean the JSON string to fix escape character issues
          let cleanedContent = resData.data.generated_content;
          
          // Fix common escape character issues
          cleanedContent = cleanedContent
            .replace(/\\&/g, '&')  // Fix \\& to &
            .replace(/\\\"/g, '"') // Fix \\\" to \"
            .replace(/\\\\/g, '\\') // Fix \\\\ to \\
            .replace(/\\n/g, '\n') // Fix \\n to \n
            .replace(/\\t/g, '\t'); // Fix \\t to \t
          
          console.log("Original content:", resData.data.generated_content);
          console.log("Cleaned content:", cleanedContent);
          
          // Parse the cleaned JSON string
          const parsed = JSON.parse(cleanedContent);
          console.log("Parsed Data:", parsed);
          
          // Validate required fields
          if (!parsed.title || !parsed.sections || !Array.isArray(parsed.sections)) {
            throw new Error("Invalid data structure received");
          }
          
          setData(parsed);
          // Pass formatted content to parent component if callback exists
          if (onContentGenerated) {
            const formattedContent = formatContentForParent(parsed);
            onContentGenerated(formattedContent);
          }
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          console.log("Raw generated_content:", resData.data.generated_content);
          
          // Fallback: Try to extract data manually if JSON parsing fails
          try {
            const fallbackData = {
              title: "The Animal Race",
              module_code: "GEN101",
              qaqf_level: "Pre-Primary",
              content_type: "storytelling lecture",
              subject: "General Education",
              target_audience: "Kindergarten students",
              learning_objectives: "Engage students with a fun and simple story about animals racing, while teaching basic moral values like patience, fairness, and teamwork.",
              assessment_methods: "Oral Q&A, drawing favorite animal from the story, group retelling",
              extra_sections: "Additional Instructions: Use simple language suitable for 4-6 year olds. Make it engaging and fun with animal characters. End with a simple moral lesson.\nStory Structure: Keep the narrative brief, using vivid descriptions to help students visualize the action.",
              sections: [
                {
                  heading: "Section Heading 1",
                  content: "Once upon a time, in a forest filled with tall trees and winding streams, animals from different habitats gathered for their annual race. The fast and agile cheetah took the lead, followed closely by the speedy deer and the steady tortoise. But as they ran, each animal forgot about the rule – to work together as a team – and focused only on winning.\nKey Concept: Focus on teamwork and collaboration.",
                  key_points: [
                    "Encourage students to think about how different skills and strengths can be used together to achieve a common goal.",
                    "Teach the importance of cooperation over individual achievement"
                  ],
                  practical_application: "In class, divide the students into teams and ask them to work together to complete a simple task, such as building a bridge with blocks or creating a collaborative drawing."
                },
                {
                  heading: "Section Heading 2",
                  content: "As the animals crossed the finish line, they realized that they had all learned something valuable. The cheetah discovered that speed alone wasn't enough to win; teamwork made it possible. The deer understood that kindness and compassion went a long way in helping others succeed. And the tortoise found out that perseverance and determination were essential for overcoming obstacles.\nKey Concept: Focus on individual strengths and weaknesses.",
                  key_points: [
                    "Explain to students how everyone has unique abilities and qualities, and how embracing these differences can lead to greater success.",
                    "Highlight the value of persistence and determination"
                  ],
                  practical_application: "In class, ask each student to draw a picture of their favorite animal and write a short paragraph about what makes that animal special."
                }
              ],
              summary: "The animals learned an important lesson: that together, we are stronger. When we work as a team and appreciate our unique strengths, we can achieve great things and help one another grow. Remember, kindness, perseverance, and teamwork are essential for overcoming challenges and achieving success in life."
            };
            setData(fallbackData);
            // Pass formatted content to parent component if callback exists
            if (onContentGenerated) {
              const formattedContent = formatContentForParent(fallbackData);
              onContentGenerated(formattedContent);
            }
            console.log("Using fallback data due to JSON parsing error");
          } catch (fallbackError) {
            setError(`Failed to parse API response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
          }
        }
      } else {
        console.log("API Response structure:", resData);
        setError("No data received from API");
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = data?.sections.filter(section =>
    section.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.key_points.some(point => point.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-red-600 mb-4">
              {error || "Failed to load assessment data"}
            </p>
            <Button onClick={fetchAssessmentData} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${compact ? 'min-h-0' : 'min-h-screen'} bg-gray-50 p-6`}>
      <div className={`${compact ? 'max-w-full' : 'max-w-6xl'} mx-auto space-y-6`}>
        {/* Main Title Card */}
        <Card className="shadow-sm border-0 ">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-black mb-6">{data.title}</h1>
            <div className="flex flex-col gap-2">
              <div className="flex">
                <span className="font-medium text-black">Module Code:</span>
                <div className="text-bold">{data.module_code}</div>
              </div>
              <div className="flex">
                <span className="font-medium text-black">QAQF Level:</span>
                <div className="text-gray-900">{data.qaqf_level}</div>
              </div>
              <div className="flex">
                <span className="font-medium text-black">Content Type:</span>
                <div className="text-gray-900">{data.content_type}</div>
              </div>
              <div className="flex">
                <span className="font-medium text-black">Subject:</span>
                <div className="text-gray-900">{data.subject}</div>
              </div>
              <div className="flex">
                <span className="font-medium text-black">Target Audience:</span>
                <div className="text-gray-900">{data.target_audience}</div>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-black">Learning Objectives:</span>
                <div className="text-gray-900 mt-1">{data.learning_objectives}</div>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-black">Assessment Methods:</span>
                <div className="text-gray-900 mt-1">{data.assessment_methods}</div>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-black">Extra Sections:</span>
                <div className="text-gray-900">{data.extra_sections}</div>
                <div className="text-gray-900 mt-1">
                  <div className="mb-2">
                    <span className="font-medium">Additional Instructions:</span> Use simple language suitable for 4-6 year olds. Make it engaging and fun with animal characters. End with a simple moral lesson.
                  </div>
                  <div>
                    <span className="font-medium">Story Structure:</span> Keep the narrative brief, using vivid descriptions to help students visualize the action.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Cards */}
        {(searchQuery ? filteredSections : data.sections).map((section, index) => (
          <Card key={index} className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-black mb-4">{section.heading}</h2>
               
              <div className="text-gray-700 mb-6 whitespace-pre-wrap">
                {section.content}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-black mb-2">Key Concept:</h3>
                  <p className="text-gray-700">{section.key_points[0]}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-black mb-2">Key Points:</h3>
                  <ul className="space-y-1">
                    {section.key_points.map((point, i) => (
                      <li key={i} className="text-gray-700">• {point}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-black mb-2">Practical Application:</h3>
                  <p className="text-gray-700">{section.practical_application}</p>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => toggleQuerySection(index)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ask Query
                </Button>
              </div>

              {/* Animated Query Section */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openQuerySections.includes(index) ? 'max-h-screen opacity-100 mt-4' : 'max-h-0 opacity-0'
              }`}>
                <div className="border-t pt-4">
                  <Input
                    placeholder="Type your query..."
                    className="mb-2"
                    value={queryInputs[index] || ""}
                    onChange={(e) => handleQueryInputChange(index, e.target.value)}
                  />
                  <div className="flex gap-2 items-center">
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white" 
                      onClick={() => handleSearchQuery(index)}
                      disabled={queryLoading[index]}
                    >
                      {queryLoading[index] ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Searching...
                        </>
                      ) : (
                        'Search'
                      )}
                    </Button>
                    <span className="text-sm text-gray-500">
                      {queryLoading[index] ? 'Processing your query...' : 'Please enter a query.'}
                    </span>
                  </div>
                  
                  {/* Loading indicator */}
                  {queryLoading[index] && (
                    <div className="mt-4 p-4 rounded-md bg-blue-50 border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-blue-700">Getting response...</span>
                      </div>
                    </div>
                  )}
                  
                                     {/* Response display */}
                   {queryResponses[index] && !queryLoading[index] && (
                     <div className="mt-4 p-4 rounded-md bg-green-50 border border-green-200">
                       <div className="flex items-center justify-between mb-3">
                         <h4 className="font-bold text-black">Response:</h4>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
                           onClick={() => addResponseToSection(index)}
                           title="Add to section content"
                         >
                           ⋮
                    </Button>
                  </div>
                      <div 
                        className="text-gray-800 prose prose-sm max-w-none overflow-y-auto max-h-96 border border-gray-200 rounded p-3 bg-white"
                        style={{ 
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          lineHeight: '1.6'
                        }}
                       >
                         {queryResponses[index]}
                       </div>
                       <div className="mt-2 text-sm text-green-700">
                         Click ⋮ to add this response to the section content above
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Summary Card */}
        <Card className="shadow-sm border-0 bg-green-50">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-black mb-4">Summary</h2>
            <p className="text-gray-700">{data.summary}</p>
          </CardContent>
        </Card>

       
      </div>
    </div>
  );
}
