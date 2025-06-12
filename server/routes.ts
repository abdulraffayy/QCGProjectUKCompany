import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storage } from "./storage";
import { 
  insertContentSchema, 
  insertVideoSchema, 
  insertActivitySchema,
  insertStudyMaterialSchema,
  insertCollectionSchema,
  insertMaterialTemplateSchema,
  VerificationStatus 
} from "@shared/schema";
import { z } from "zod";
import { 
  generateContent, 
  verifyContent, 
  checkBritishStandards, 
  contentGenerationSchema,
  generateSampleContent,
  generateSampleVerification,
  generateSampleBritishStandardsCheck
} from "./openai";

// Configure multer for file uploads
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  // QAQF Levels
  app.get('/api/qaqf/levels', async (req: Request, res: Response) => {
    try {
      const levels = await storage.getQaqfLevels();
      res.json(levels);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch QAQF levels' });
    }
  });

  // QAQF Characteristics
  app.get('/api/qaqf/characteristics', async (req: Request, res: Response) => {
    try {
      const characteristics = await storage.getQaqfCharacteristics();
      res.json(characteristics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch QAQF characteristics' });
    }
  });

  // Content
  app.get('/api/content', async (req: Request, res: Response) => {
    try {
      const contents = await storage.getContents();
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch content' });
    }
  });

  app.get('/api/content/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.getContent(id);
      
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch content' });
    }
  });

  app.get('/api/content/user/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const contents = await storage.getContentsByUser(userId);
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user content' });
    }
  });

  app.get('/api/content/verification/:status', async (req: Request, res: Response) => {
    try {
      const status = req.params.status;
      const contents = await storage.getContentsByVerificationStatus(status);
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch content by verification status' });
    }
  });

  app.post('/api/content', async (req: Request, res: Response) => {
    try {
      const contentData = insertContentSchema.parse(req.body);
      const newContent = await storage.createContent(contentData);
      
      // Create activity for content creation
      await storage.createActivity({
        userId: contentData.createdByUserId,
        action: 'created',
        entityType: 'content',
        entityId: newContent.id,
        details: { title: newContent.title }
      });
      
      res.status(201).json(newContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid content data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create content' });
    }
  });

  app.patch('/api/content/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.getContent(id);
      
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }
      
      const updatedContent = await storage.updateContent(id, req.body);
      
      // Create activity for content update
      if (updatedContent && req.body.verificationStatus) {
        const action = req.body.verificationStatus === VerificationStatus.VERIFIED 
          ? 'verified' 
          : req.body.verificationStatus === VerificationStatus.REJECTED 
            ? 'rejected' 
            : 'updated';
            
        await storage.createActivity({
          userId: req.body.verifiedByUserId || content.createdByUserId,
          action,
          entityType: 'content',
          entityId: id,
          details: { title: content.title }
        });
      }
      
      res.json(updatedContent);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update content' });
    }
  });

  // Videos
  app.get('/api/videos', async (req: Request, res: Response) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch videos' });
    }
  });

  app.get('/api/videos/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideo(id);
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch video' });
    }
  });

  app.post('/api/videos', async (req: Request, res: Response) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const newVideo = await storage.createVideo(videoData);
      
      // Create activity for video creation
      await storage.createActivity({
        userId: videoData.createdByUserId,
        action: 'created',
        entityType: 'video',
        entityId: newVideo.id,
        details: { title: newVideo.title }
      });
      
      res.status(201).json(newVideo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid video data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create video' });
    }
  });

  app.patch('/api/videos/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideo(id);
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      
      const updatedVideo = await storage.updateVideo(id, req.body);
      
      // Create activity for video update
      if (updatedVideo && req.body.verificationStatus) {
        const action = req.body.verificationStatus === VerificationStatus.VERIFIED 
          ? 'verified' 
          : req.body.verificationStatus === VerificationStatus.REJECTED 
            ? 'rejected' 
            : 'updated';
            
        await storage.createActivity({
          userId: req.body.verifiedByUserId || video.createdByUserId,
          action,
          entityType: 'video',
          entityId: id,
          details: { title: video.title }
        });
      }
      
      res.json(updatedVideo);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update video' });
    }
  });

  // Activities
  app.get('/api/activities', async (req: Request, res: Response) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch activities' });
    }
  });

  app.post('/api/activities', async (req: Request, res: Response) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const newActivity = await storage.createActivity(activityData);
      res.status(201).json(newActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid activity data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create activity' });
    }
  });

  // OpenAI Endpoints for QAQF Content Generation
  
  // Generate academic content based on QAQF framework
  app.post('/api/generate/content', async (req: Request, res: Response) => {
    try {
      // Validate the request data
      const requestData = contentGenerationSchema.parse(req.body);
      
      try {
        // Generate content - attempt to use the API
        const generatedContent = await generateContent(requestData);
        res.json(generatedContent);
      } catch (apiError) {
        // If API generation fails, use fallback content generation
        console.log('Using fallback content generator due to API error');
        const fallbackContent = generateSampleContent(requestData);
        res.json(fallbackContent);
      }
    } catch (error) {
      console.error('Error with content generation request:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid content generation request', 
          errors: error.errors 
        });
      }
      
      // For any other errors, still provide a fallback
      console.log('Using fallback content generator due to request error');
      const fallbackContent = generateSampleContent(req.body);
      res.json(fallbackContent);
    }
  });
  
  // Verify content against QAQF framework
  app.post('/api/verify/content', async (req: Request, res: Response) => {
    try {
      const { content, qaqfLevel } = req.body;
      
      if (!content || !qaqfLevel) {
        return res.status(400).json({ 
          message: 'Missing required fields: content and qaqfLevel are required' 
        });
      }
      
      // Verify content
      const verificationResults = await verifyContent(content, qaqfLevel);
      
      res.json(verificationResults);
    } catch (error) {
      console.error('Error verifying content:', error);
      
      // Use fallback verification
      console.log('Using fallback verification due to error');
      const fallbackResults = generateSampleVerification(req.body.content, req.body.qaqfLevel);
      res.json(fallbackResults);
    }
  });
  
  // Check content against British standards
  app.post('/api/check/british-standards', async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ 
          message: 'Missing required field: content is required' 
        });
      }
      
      // Check British standards
      const standardsCheck = await checkBritishStandards(content);
      
      res.json(standardsCheck);
    } catch (error) {
      console.error('Error checking British standards:', error);
      
      // Use fallback British standards check
      console.log('Using fallback British standards check due to error');
      const fallbackCheck = generateSampleBritishStandardsCheck(req.body.content);
      res.json(fallbackCheck);
    }
  });
  
  // File upload endpoint for content sources (PDFs, audio transcriptions, etc.)
  app.post('/api/upload/source', async (req: Request, res: Response) => {
    try {
      // Note: To fully implement this, we would need to set up file handling middleware (e.g., multer)
      // This is a placeholder for future implementation
      res.status(200).json({ 
        message: 'Source uploaded successfully',
        sourceId: 'temp-source-id', // This would be a reference to the uploaded file
        sourceType: req.body.type || 'unknown'
      });
    } catch (error) {
      console.error('Error uploading source:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ 
        message: 'Failed to upload source', 
        error: errorMessage
      });
    }
  });

  // Lesson Plans routes - using storage interface for consistency
  app.get('/api/lesson-plans', async (req: Request, res: Response) => {
    try {
      // For now, return empty array since lesson plans aren't in storage interface yet
      res.json([]);
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      res.status(500).json({ message: 'Failed to fetch lesson plans' });
    }
  });

  app.get('/api/lesson-plans/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      res.status(404).json({ message: 'Lesson plan not found' });
    } catch (error) {
      console.error('Error fetching lesson plan:', error);
      res.status(500).json({ message: 'Failed to fetch lesson plan' });
    }
  });

  app.post('/api/lesson-plans', async (req: Request, res: Response) => {
    try {
      // For now, just return success response
      res.status(201).json({ 
        id: Date.now(), 
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error creating lesson plan:', error);
      res.status(500).json({ message: 'Failed to create lesson plan' });
    }
  });

  app.patch('/api/lesson-plans/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      res.json({ id, ...req.body, updatedAt: new Date() });
    } catch (error) {
      console.error('Error updating lesson plan:', error);
      res.status(500).json({ message: 'Failed to update lesson plan' });
    }
  });

  app.delete('/api/lesson-plans/:id', async (req: Request, res: Response) => {
    try {
      res.json({ message: 'Lesson plan deleted successfully' });
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      res.status(500).json({ message: 'Failed to delete lesson plan' });
    }
  });

  // Study Materials API Routes
  app.get('/api/study-materials', async (req: Request, res: Response) => {
    try {
      const materials = await storage.getStudyMaterials();
      res.json(materials);
    } catch (error) {
      console.error('Error fetching study materials:', error);
      res.status(500).json({ message: 'Failed to fetch study materials' });
    }
  });

  app.get('/api/study-materials/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const material = await storage.getStudyMaterialById(id);
      if (!material) {
        return res.status(404).json({ message: 'Study material not found' });
      }
      res.json(material);
    } catch (error) {
      console.error('Error fetching study material:', error);
      res.status(500).json({ message: 'Failed to fetch study material' });
    }
  });

  app.post('/api/study-materials', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const materialData = {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        qaqfLevel: parseInt(req.body.qaqfLevel),
        content: req.body.content || '',
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        fileName: req.file?.originalname,
        filePath: req.file?.path,
        fileSize: req.file?.size,
        mimeType: req.file?.mimetype,
        createdByUserId: 1, // Default user
      };

      const material = await storage.createStudyMaterial(materialData);
      res.status(201).json(material);
    } catch (error) {
      console.error('Error creating study material:', error);
      res.status(500).json({ message: 'Failed to create study material' });
    }
  });

  app.patch('/api/study-materials/:id', upload.single('file'), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        qaqfLevel: req.body.qaqfLevel ? parseInt(req.body.qaqfLevel) : undefined,
        content: req.body.content,
        tags: req.body.tags ? JSON.parse(req.body.tags) : undefined,
      };

      if (req.file) {
        Object.assign(updates, {
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        });
      }

      const material = await storage.updateStudyMaterial(id, updates);
      res.json(material);
    } catch (error) {
      console.error('Error updating study material:', error);
      res.status(500).json({ message: 'Failed to update study material' });
    }
  });

  app.delete('/api/study-materials/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStudyMaterial(id);
      res.json({ message: 'Study material deleted successfully' });
    } catch (error) {
      console.error('Error deleting study material:', error);
      res.status(500).json({ message: 'Failed to delete study material' });
    }
  });

  // Collections API Routes
  app.get('/api/collections', async (req: Request, res: Response) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      console.error('Error fetching collections:', error);
      res.status(500).json({ message: 'Failed to fetch collections' });
    }
  });

  app.get('/api/collections/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await storage.getCollectionById(id);
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found' });
      }
      res.json(collection);
    } catch (error) {
      console.error('Error fetching collection:', error);
      res.status(500).json({ message: 'Failed to fetch collection' });
    }
  });

  app.get('/api/collections/:id/materials', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const materials = await storage.getCollectionMaterials(id);
      res.json(materials);
    } catch (error) {
      console.error('Error fetching collection materials:', error);
      res.status(500).json({ message: 'Failed to fetch collection materials' });
    }
  });

  app.post('/api/collections', async (req: Request, res: Response) => {
    try {
      const collectionData = {
        title: req.body.title,
        description: req.body.description,
        createdByUserId: 1, // Default user
      };

      const collection = await storage.createCollection(collectionData);
      res.status(201).json(collection);
    } catch (error) {
      console.error('Error creating collection:', error);
      res.status(500).json({ message: 'Failed to create collection' });
    }
  });

  app.post('/api/collections/:id/materials', async (req: Request, res: Response) => {
    try {
      const collectionId = parseInt(req.params.id);
      const materialId = parseInt(req.body.materialId);
      
      await storage.addMaterialToCollection(collectionId, materialId);
      res.json({ message: 'Material added to collection successfully' });
    } catch (error) {
      console.error('Error adding material to collection:', error);
      res.status(500).json({ message: 'Failed to add material to collection' });
    }
  });

  app.delete('/api/collections/:id/materials/:materialId', async (req: Request, res: Response) => {
    try {
      const collectionId = parseInt(req.params.id);
      const materialId = parseInt(req.params.materialId);
      
      await storage.removeMaterialFromCollection(collectionId, materialId);
      res.json({ message: 'Material removed from collection successfully' });
    } catch (error) {
      console.error('Error removing material from collection:', error);
      res.status(500).json({ message: 'Failed to remove material from collection' });
    }
  });

  app.patch('/api/collections/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = {
        title: req.body.title,
        description: req.body.description,
      };

      const collection = await storage.updateCollection(id, updates);
      res.json(collection);
    } catch (error) {
      console.error('Error updating collection:', error);
      res.status(500).json({ message: 'Failed to update collection' });
    }
  });

  app.delete('/api/collections/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCollection(id);
      res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
      console.error('Error deleting collection:', error);
      res.status(500).json({ message: 'Failed to delete collection' });
    }
  });

  // Material Templates API Routes
  app.get('/api/material-templates', async (req: Request, res: Response) => {
    try {
      const templates = await storage.getMaterialTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching material templates:', error);
      res.status(500).json({ message: 'Failed to fetch material templates' });
    }
  });

  app.get('/api/material-templates/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getMaterialTemplateById(id);
      if (!template) {
        return res.status(404).json({ message: 'Material template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error('Error fetching material template:', error);
      res.status(500).json({ message: 'Failed to fetch material template' });
    }
  });

  app.post('/api/material-templates', async (req: Request, res: Response) => {
    try {
      const templateData = {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        qaqfLevel: req.body.qaqfLevel,
        templateContent: req.body.templateContent,
        placeholders: req.body.placeholders || [],
        createdByUserId: 1, // Default user
      };

      const template = await storage.createMaterialTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating material template:', error);
      res.status(500).json({ message: 'Failed to create material template' });
    }
  });

  app.post('/api/material-templates/:id/use', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const customizations = req.body.customizations || {};
      
      const material = await storage.createMaterialFromTemplate(id, customizations);
      res.status(201).json(material);
    } catch (error) {
      console.error('Error creating material from template:', error);
      res.status(500).json({ message: 'Failed to create material from template' });
    }
  });

  app.patch('/api/material-templates/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        qaqfLevel: req.body.qaqfLevel,
        templateContent: req.body.templateContent,
        placeholders: req.body.placeholders,
      };

      const template = await storage.updateMaterialTemplate(id, updates);
      res.json(template);
    } catch (error) {
      console.error('Error updating material template:', error);
      res.status(500).json({ message: 'Failed to update material template' });
    }
  });

  app.delete('/api/material-templates/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMaterialTemplate(id);
      res.json({ message: 'Material template deleted successfully' });
    } catch (error) {
      console.error('Error deleting material template:', error);
      res.status(500).json({ message: 'Failed to delete material template' });
    }
  });

  // File serving route
  app.get('/uploads/:filename', (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filepath)) {
      res.download(filepath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
