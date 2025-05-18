import React from 'react';
import ContentGenerator from '@/components/content/ContentGenerator';

const ContentGeneratorPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-800 mb-6">Course Generator</h2>
      <ContentGenerator />
    </div>
  );
};

export default ContentGeneratorPage;