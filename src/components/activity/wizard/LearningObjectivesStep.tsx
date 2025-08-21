import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { LearningObjectives, LearningObjective, CourseType } from '@/types/courseTypes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getDurationOptions } from '@/types/courseTypes';

interface LearningObjectivesStepProps {
  data: LearningObjectives | undefined;
  courseType: CourseType['id'];
  onUpdate: (data: LearningObjectives) => void;
}

export const LearningObjectivesStep: React.FC<LearningObjectivesStepProps> = ({
  data,
  courseType,
  onUpdate
}) => {
  const [objectives, setObjectives] = useState<LearningObjective[]>(
    data?.objectives || [{ id: '1', text: '' }]
  );
  const [duration, setDuration] = useState(data?.duration || '');

  // Load PDFs from API (same API used in UnifiedContentGenerator)
  const [materials, setMaterials] = useState<any[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState<boolean>(false);
  const [selectedPDFId, setSelectedPDFId] = useState<number | null>(null);
  const [selectedPDFName, setSelectedPDFName] = useState<string | null>(null);
  const [selectedPDFFileName, setSelectedPDFFileName] = useState<string | null>(null);
  // Removed selectedPDFContent state as it's no longer needed for course generation
  // Collections dropdown state (copied behavior)
  const [collections, setCollections] = useState<{ id: number; name: string }[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setMaterialsLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch('http://38.29.145.85:8000/api/study-materials', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error('Failed to fetch study materials');
        const json = await res.json();
        // Optionally filter only PDFs
        const pdfs = Array.isArray(json)
          ? json.filter((m: any) => (m.file_name || '').toLowerCase().endsWith('.pdf'))
          : [];
        setMaterials(pdfs);
      } catch (e) {
        setMaterials([]);
      } finally {
        setMaterialsLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  // Fetch collections (optional dropdown)
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://38.29.145.85:8000/api/collection-study-materials', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;
        const json = await res.json();
        const cols = Array.isArray(json)
          ? json.map((c: any) => ({ id: c.id, name: c.title || c.name }))
          : [];
        setCollections(cols);
      } catch (e) {
        setCollections([]);
      }
    };
    fetchCollections();
  }, []);

  useEffect(() => {
    onUpdate({
      objectives: objectives.filter(obj => obj.text.trim() !== ''),
      duration: duration as LearningObjectives['duration'],
      selectedPdfIds: selectedPDFId !== null ? [selectedPDFId] : [],
      selectedPdfNames: selectedPDFName ? [selectedPDFName] : [],
      selectedPdfTitle: selectedPDFName || undefined,
      selectedPdfFileName: selectedPDFFileName || undefined,
      // Removed selectedPdfContent to clean up the course generation flow
      selectedCollectionId: selectedCollection ? parseInt(selectedCollection) : undefined,
      selectedCollectionName:
        selectedCollection && collections.length
          ? (collections.find(c => String(c.id) === String(selectedCollection))?.name || undefined)
          : undefined,
    });
  }, [objectives, duration, selectedPDFId, selectedPDFName, selectedPDFFileName, selectedCollection, collections, onUpdate]);

  const addObjective = () => {
    const newId = (objectives.length + 1).toString();
    setObjectives(prev => [...prev, { id: newId, text: '' }]);
  };

  const removeObjective = (id: string) => {
    if (objectives.length > 1) {
      setObjectives(prev => prev.filter(obj => obj.id !== id));
    }
  };

  const updateObjective = (id: string, text: string) => {
    setObjectives(prev => 
      prev.map(obj => obj.id === id ? { ...obj, text } : obj)
    );
  };

  const durationOptions = getDurationOptions(courseType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Learning Objectives
        </h2>
        <p className="text-gray-600">
          Define what participants will achieve by completing this course
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {objectives.map((objective, index) => (
            <div key={objective.id} className="flex items-start space-x-3">
              <div className="flex-1">
                <Input
                  placeholder={`Learning objective ${index + 1}`}
                  value={objective.text}
                  onChange={(e) => updateObjective(objective.id, e.target.value)}
                />
              </div>
              {objectives.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeObjective(objective.id)}
                  className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addObjective}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Objective
          </Button>

          {/* PDF list from API (copied from UnifiedContentGenerator) */}
          <div className="mt-3">
            <strong>Uploaded PDFs:</strong>
            <ul className="space-y-2 mt-2">
            {selectedPDFId !== null && (
              <div className="mt-2 text-sm text-green-700">1 PDF selected</div>
            )}
              {materialsLoading && (
                <li className="text-sm text-gray-400">Loading PDFs...</li>
              )}
              {!materialsLoading && materials.length === 0 && (
                <li className="text-sm text-gray-400">No PDFs found.</li>
              )}
              {materials.map((pdf: any) => {
                const isSelected = selectedPDFId === pdf.id;
                return (
                  <li
                    key={pdf.id}
                    onClick={() => {
                      setSelectedPDFId((prev) => (prev === pdf.id ? null : pdf.id));
                      const pdfName = pdf.title ? pdf.title : pdf.file_name;
                      setSelectedPDFName(selectedPDFId === pdf.id ? null : pdfName);
                      setSelectedPDFFileName(selectedPDFId === pdf.id ? null : pdf.file_name);
                      // Also copy content if available in API payload (field 'content')
                      // Removed setSelectedPDFContent as it's no longer needed
                      
                      if (selectedPDFId !== pdf.id) {
                        const text = `Use PDF: ${pdf.title ? pdf.title : pdf.file_name}`;
                        const newId = (objectives.length + 1).toString();
                        setObjectives((prev) => [...prev, { id: newId, text }]);
                      }
                    }}
                    className={
                      `flex items-center gap-2 p-2 rounded border cursor-pointer ${
                        isSelected ? 'bg-green-50 border-green-400' : 'hover:bg-gray-50'
                      }`
                    }
                    style={{
                      borderWidth: isSelected ? 2 : 1,
                      borderRadius: 6,
                    }}
                    title={isSelected ? 'Click to unselect' : 'Click to select'}
                  >
                    {/* left tick when selected */}
                    {isSelected && (
                      <span className="text-green-600">✔</span>
                    )}
                    <span className="flex-1 text-blue-600">
                      {pdf.title ? pdf.title : pdf.file_name}
                    </span>
                  </li>
                );
              })}
            </ul>
           
          </div>

          {/* Material Collection (copied from StudyMaterial and placed below the PDF list) */}
          <div>
            <Label htmlFor="collection">Material Collection</Label>
            <Select
              value={selectedCollection}
              onValueChange={(value) => setSelectedCollection(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a collection (optional)" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id.toString()}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
        </div>

        <div>
          <Label>Course Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className='focus:ring-0 focus:ring-offset-0'>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

