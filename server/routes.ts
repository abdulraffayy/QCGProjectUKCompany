import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContentSchema, 
  insertVideoSchema, 
  insertActivitySchema, 
  VerificationStatus 
} from "@shared/schema";
import { z } from "zod";
import { generateContent, verifyContent, checkBritishStandards, contentGenerationSchema } from "./openai";

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

  const httpServer = createServer(app);
  return httpServer;
}
