import React from 'react';
import { Card, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "wouter";

const VideoGeneratorSummary: React.FC = () => {
  return (
    <Card className="bg-white rounded-lg shadow overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <CardTitle className="text-lg font-bold">Video Generator</CardTitle>
            <p className="text-neutral-600 text-sm mt-1">
              Create educational videos with animation features aligned with QAQF
            </p>
          </div>
          <Link href="/video-generator">
            <Button className="mt-4 md:mt-0 flex items-center">
              <span className="material-icons mr-2">videocam</span>
              Create Video
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-md bg-neutral-50">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <span className="material-icons text-sm mr-1">auto_awesome</span>
              Animation Styles
            </h4>
            <p className="text-sm text-neutral-600">
              2D, 3D, Motion Graphics, Whiteboard animations
            </p>
          </div>
          
          <div className="p-4 border rounded-md bg-neutral-50">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <span className="material-icons text-sm mr-1">schedule</span>
              Duration Options
            </h4>
            <p className="text-sm text-neutral-600">
              Short, medium, and long-form videos
            </p>
          </div>
          
          <div className="p-4 border rounded-md bg-neutral-50">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <span className="material-icons text-sm mr-1">school</span>
              QAQF Integration
            </h4>
            <p className="text-sm text-neutral-600">
              Aligned with educational frameworks
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VideoGeneratorSummary;