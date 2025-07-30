import React from 'react';
import { Card, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "wouter";

const ContentGeneratorSummary: React.FC = () => {
  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <CardTitle className="text-lg font-bold">Course Generator</CardTitle>
            <p className="text-neutral-600 text-sm mt-1">
              Create educational course content aligned with QAQF framework
            </p>
          </div>
          <Link href="/content-generator">
            <Button className="mt-4 md:mt-0 flex items-center">
              <span className="material-icons mr-2">add</span>
              Create Course
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-md bg-neutral-50">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <span className="material-icons text-sm mr-1">description</span>
              Text Content
            </h4>
            <p className="text-sm text-neutral-600">
              Generate detailed academic content with QAQF alignment
            </p>
          </div>
          
          <div className="p-4 border rounded-md bg-neutral-50">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <span className="material-icons text-sm mr-1">format_list_bulleted</span>
              Marking Criteria
            </h4>
            <p className="text-sm text-neutral-600">
              Create assessment rubrics based on learning outcomes
            </p>
          </div>
          
          <div className="p-4 border rounded-md bg-neutral-50">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <span className="material-icons text-sm mr-1">quiz</span>
              Assessment
            </h4>
            <p className="text-sm text-neutral-600">
              Generate quizzes and assessment materials
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ContentGeneratorSummary;