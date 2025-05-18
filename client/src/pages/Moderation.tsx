import { useQuery } from '@tanstack/react-query';
import ContentModerator from "@/components/moderation/ContentModerator";

const ModerationPage: React.FC = () => {
  // Get content query for moderation
  const { data: contents, isLoading: isLoadingContents } = useQuery({
    queryKey: ['/api/content'],
  });

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Content Moderation</h2>
            <p className="text-neutral-600 mt-1">Moderate and ensure content adheres to British standards and QAQF framework</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <ContentModerator 
          contents={contents || []}
          isLoading={isLoadingContents}
        />
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">British Standards Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold mb-2">Key Moderation Criteria</h4>
            <ul className="list-disc pl-5 text-sm text-neutral-600 space-y-2">
              <li><span className="font-medium">Accuracy:</span> Ensure factual correctness and up-to-date information</li>
              <li><span className="font-medium">Inclusivity:</span> Content should be accessible and inclusive to all learners</li>
              <li><span className="font-medium">Ethics:</span> Adherence to ethical standards in academic publishing</li>
              <li><span className="font-medium">References:</span> Proper citation of sources following academic conventions</li>
              <li><span className="font-medium">Language:</span> Clear, professional and appropriate language standards</li>
            </ul>
          </div>
          
          <div>
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
              alt="Content moderation in education" 
              className="w-full h-auto rounded-md"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ModerationPage;
