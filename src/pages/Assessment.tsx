import { useQuery } from '@tanstack/react-query';
import AssessmentTool from "../components/assessment/AssessmentTool";

const AssessmentPage: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">QAQF Assessment</h2>
            <p className="text-neutral-600 mt-1">Create and analyze assessments aligned with QAQF framework standards</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <AssessmentTool contentType="assessment" qaqfLevel={1} />
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Assessment Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold mb-2">QAQF-Aligned Assessment Guidelines</h4>
            <ul className="list-disc pl-5 text-sm text-neutral-600 space-y-2">
              <li>Design assessments that measure both knowledge and application</li>
              <li>Include questions that assess all nine QAQF characteristics</li>
              <li>Balance theoretical understanding with practical skills</li>
              <li>Consider digital literacy and technological aspects in higher QAQF levels</li>
              <li>Incorporate sustainability and future-focused thinking for levels 7-9</li>
              <li>Ensure assessments are accessible and inclusive</li>
            </ul>
          </div>
          
          <div>
            <img 
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
              alt="Academic assessment process" 
              className="w-full h-auto rounded-md"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AssessmentPage;
