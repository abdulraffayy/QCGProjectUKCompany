import { useQuery } from '@tanstack/react-query';
import VerificationList from "@/components/verification/VerificationList";

const VerificationPage: React.FC = () => {
  // Get content query for verification
  const { data: contents, isLoading: isLoadingContents } = useQuery({
    queryKey: ['/api/content'],
  });

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Content Verification</h2>
            <p className="text-neutral-600 mt-1">Verify academic content against QAQF framework standards</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <VerificationList 
          contents={contents || []}
          isLoading={isLoadingContents}
        />
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">QAQF Verification Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold mb-2">Verification Process</h4>
            <ol className="list-decimal pl-5 text-sm text-neutral-600 space-y-2">
              <li>Review the content against the declared QAQF level criteria</li>
              <li>Assess implementation of all nine QAQF characteristics</li>
              <li>Verify alignment with British educational standards</li>
              <li>Check for academic rigor and quality of references</li>
              <li>Evaluate educational effectiveness and clarity</li>
            </ol>
          </div>
          
          <div>
            <img 
              src="https://images.unsplash.com/photo-1512314889357-e157c22f938d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
              alt="Quality assurance in academic assessment" 
              className="w-full h-auto rounded-md"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default VerificationPage;
