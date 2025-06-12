import {
  User,
  InsertUser,
  QaqfLevel,
  InsertQaqfLevel,
  QaqfCharacteristic,
  InsertQaqfCharacteristic,
  Content,
  InsertContent,
  Video,
  InsertVideo,
  Activity,
  InsertActivity,
  StudyMaterial,
  InsertStudyMaterial,
  Collection,
  InsertCollection,
  CollectionMaterial,
  InsertCollectionMaterial,
  MaterialTemplate,
  InsertMaterialTemplate,
  VerificationStatus,
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // QAQF Level operations
  getQaqfLevel(id: number): Promise<QaqfLevel | undefined>;
  getQaqfLevels(): Promise<QaqfLevel[]>;
  createQaqfLevel(level: InsertQaqfLevel): Promise<QaqfLevel>;
  
  // QAQF Characteristic operations
  getQaqfCharacteristic(id: number): Promise<QaqfCharacteristic | undefined>;
  getQaqfCharacteristics(): Promise<QaqfCharacteristic[]>;
  createQaqfCharacteristic(characteristic: InsertQaqfCharacteristic): Promise<QaqfCharacteristic>;
  
  // Content operations
  getContent(id: number): Promise<Content | undefined>;
  getContents(): Promise<Content[]>;
  getContentsByUser(userId: number): Promise<Content[]>;
  getContentsByVerificationStatus(status: string): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: Partial<Content>): Promise<Content | undefined>;
  
  // Video operations
  getVideo(id: number): Promise<Video | undefined>;
  getVideos(): Promise<Video[]>;
  getVideosByUser(userId: number): Promise<Video[]>;
  getVideosByVerificationStatus(status: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, video: Partial<Video>): Promise<Video | undefined>;
  
  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getActivities(): Promise<Activity[]>;
  getActivitiesByUser(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Study Material operations
  getStudyMaterials(): Promise<StudyMaterial[]>;
  getStudyMaterialById(id: number): Promise<StudyMaterial | undefined>;
  createStudyMaterial(material: InsertStudyMaterial): Promise<StudyMaterial>;
  updateStudyMaterial(id: number, updates: Partial<StudyMaterial>): Promise<StudyMaterial | undefined>;
  deleteStudyMaterial(id: number): Promise<void>;

  // Collection operations
  getCollections(): Promise<Collection[]>;
  getCollectionById(id: number): Promise<Collection | undefined>;
  getCollectionMaterials(collectionId: number): Promise<StudyMaterial[]>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: number, updates: Partial<Collection>): Promise<Collection | undefined>;
  deleteCollection(id: number): Promise<void>;
  addMaterialToCollection(collectionId: number, materialId: number): Promise<void>;
  removeMaterialFromCollection(collectionId: number, materialId: number): Promise<void>;

  // Material Template operations
  getMaterialTemplates(): Promise<MaterialTemplate[]>;
  getMaterialTemplateById(id: number): Promise<MaterialTemplate | undefined>;
  createMaterialTemplate(template: InsertMaterialTemplate): Promise<MaterialTemplate>;
  updateMaterialTemplate(id: number, updates: Partial<MaterialTemplate>): Promise<MaterialTemplate | undefined>;
  deleteMaterialTemplate(id: number): Promise<void>;
  createMaterialFromTemplate(templateId: number, customizations: any): Promise<StudyMaterial>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    contentCount: number;
    verifiedContentCount: number;
    pendingVerificationCount: number;
    videoCount: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private qaqfLevels: Map<number, QaqfLevel>;
  private qaqfCharacteristics: Map<number, QaqfCharacteristic>;
  private contents: Map<number, Content>;
  private videos: Map<number, Video>;
  private activities: Map<number, Activity>;
  
  private userIdCounter: number;
  private qaqfLevelIdCounter: number;
  private qaqfCharacteristicIdCounter: number;
  private contentIdCounter: number;
  private videoIdCounter: number;
  private activityIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.qaqfLevels = new Map();
    this.qaqfCharacteristics = new Map();
    this.contents = new Map();
    this.videos = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.qaqfLevelIdCounter = 1;
    this.qaqfCharacteristicIdCounter = 1;
    this.contentIdCounter = 1;
    this.videoIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Initialize with default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Dr. Jane Doe",
      role: "admin",
      avatar: ""
    });

    // Initialize QAQF levels
    this.initializeQaqfLevels();
    
    // Initialize QAQF characteristics
    this.initializeQaqfCharacteristics();
  }

  private initializeQaqfLevels() {
    const levels = [
      { level: 1, name: "Basic", description: "Basic implementation of nine characteristics within learning and education environment." },
      { level: 2, name: "Rudimentary", description: "Rudimentary implementation of nine characteristics within learning and education environment." },
      { level: 3, name: "Crucial", description: "Crucial implementation of nine characteristics within learning and education environment." },
      { level: 4, name: "Key", description: "Key implementation of nine characteristics within learning and education environment." },
      { level: 5, name: "Substantial", description: "Substantial implementation of nine characteristics within learning and education environment." },
      { level: 6, name: "Critical", description: "Critical implementation of nine characteristics within learning and education environment." },
      { level: 7, name: "Leading", description: "Leading implementation of nine characteristics within learning and education environment." },
      { level: 8, name: "Specialist", description: "Specialist implementation of nine characteristics within learning and education environment." },
      { level: 9, name: "21st Century Innovative", description: "21st century innovative implementation of nine characteristics within learning and education environment." }
    ];

    levels.forEach(level => this.createQaqfLevel(level));
  }

  private initializeQaqfCharacteristics() {
    const characteristics = [
      { name: "Knowledge and understanding", description: "Descriptive, simple, facts, ideas, concepts, subject, discipline, defining understanding", category: "foundation" },
      { name: "Applied knowledge", description: "Application of: theories, facts, ideas, concepts", category: "foundation" },
      { name: "Cognitive skills", description: "Critical, analytical, research", category: "foundation" },
      { name: "Communication", description: "English level, use of command of communication", category: "intermediate" },
      { name: "Autonomy, accountability & working with others", description: "Team work, group work, autonomy, independent thinking, accountability of thoughts", category: "intermediate" },
      { name: "Digitalisation & AI", description: "Application of digital knowledge, use of artificial intelligence, application of advanced IT, implementation of Robotic thinking", category: "intermediate" },
      { name: "Sustainability & ecological", description: "Show sustainability, resilient and ecological thinking", category: "advanced" },
      { name: "Reflective & creative", description: "Level of reflection, creativity and innovative input", category: "advanced" },
      { name: "Futuristic/Genius Skills", description: "Think outside the box, show different thinking on outcomes", category: "advanced" }
    ];

    characteristics.forEach(characteristic => this.createQaqfCharacteristic(characteristic));
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // QAQF Level operations
  async getQaqfLevel(id: number): Promise<QaqfLevel | undefined> {
    return this.qaqfLevels.get(id);
  }
  
  async getQaqfLevels(): Promise<QaqfLevel[]> {
    return Array.from(this.qaqfLevels.values()).sort((a, b) => a.level - b.level);
  }
  
  async createQaqfLevel(level: InsertQaqfLevel): Promise<QaqfLevel> {
    const id = this.qaqfLevelIdCounter++;
    const newLevel: QaqfLevel = { ...level, id };
    this.qaqfLevels.set(id, newLevel);
    return newLevel;
  }
  
  // QAQF Characteristic operations
  async getQaqfCharacteristic(id: number): Promise<QaqfCharacteristic | undefined> {
    return this.qaqfCharacteristics.get(id);
  }
  
  async getQaqfCharacteristics(): Promise<QaqfCharacteristic[]> {
    return Array.from(this.qaqfCharacteristics.values());
  }
  
  async createQaqfCharacteristic(characteristic: InsertQaqfCharacteristic): Promise<QaqfCharacteristic> {
    const id = this.qaqfCharacteristicIdCounter++;
    const newCharacteristic: QaqfCharacteristic = { ...characteristic, id };
    this.qaqfCharacteristics.set(id, newCharacteristic);
    return newCharacteristic;
  }
  
  // Content operations
  async getContent(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }
  
  async getContents(): Promise<Content[]> {
    return Array.from(this.contents.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getContentsByUser(userId: number): Promise<Content[]> {
    return Array.from(this.contents.values())
      .filter(content => content.createdByUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getContentsByVerificationStatus(status: string): Promise<Content[]> {
    return Array.from(this.contents.values())
      .filter(content => content.verificationStatus === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createContent(content: InsertContent): Promise<Content> {
    const id = this.contentIdCounter++;
    const now = new Date();
    const newContent: Content = { 
      ...content, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.contents.set(id, newContent);
    return newContent;
  }
  
  async updateContent(id: number, contentUpdate: Partial<Content>): Promise<Content | undefined> {
    const content = this.contents.get(id);
    if (!content) return undefined;
    
    const updatedContent: Content = { 
      ...content, 
      ...contentUpdate,
      updatedAt: new Date()
    };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }
  
  // Video operations
  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }
  
  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getVideosByUser(userId: number): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter(video => video.createdByUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getVideosByVerificationStatus(status: string): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter(video => video.verificationStatus === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createVideo(video: InsertVideo): Promise<Video> {
    const id = this.videoIdCounter++;
    const now = new Date();
    const newVideo: Video = { 
      ...video, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.videos.set(id, newVideo);
    return newVideo;
  }
  
  async updateVideo(id: number, videoUpdate: Partial<Video>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo: Video = { 
      ...video, 
      ...videoUpdate,
      updatedAt: new Date()
    };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }
  
  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const newActivity: Activity = { 
      ...activity, 
      id, 
      createdAt: now
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  // Dashboard stats
  async getDashboardStats(): Promise<{
    contentCount: number;
    verifiedContentCount: number;
    pendingVerificationCount: number;
    videoCount: number;
  }> {
    const contents = Array.from(this.contents.values());
    const videos = Array.from(this.videos.values());
    
    return {
      contentCount: contents.length,
      verifiedContentCount: contents.filter(content => content.verificationStatus === VerificationStatus.VERIFIED).length,
      pendingVerificationCount: contents.filter(content => content.verificationStatus === VerificationStatus.PENDING).length,
      videoCount: videos.length
    };
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getQaqfLevel(id: number): Promise<QaqfLevel | undefined> {
    const [level] = await db.select().from(qaqfLevels).where(eq(qaqfLevels.id, id));
    return level || undefined;
  }
  
  async getQaqfLevels(): Promise<QaqfLevel[]> {
    return await db.select().from(qaqfLevels).orderBy(qaqfLevels.level);
  }
  
  async createQaqfLevel(level: InsertQaqfLevel): Promise<QaqfLevel> {
    const [newLevel] = await db
      .insert(qaqfLevels)
      .values(level)
      .returning();
    return newLevel;
  }
  
  async getQaqfCharacteristic(id: number): Promise<QaqfCharacteristic | undefined> {
    const [characteristic] = await db.select().from(qaqfCharacteristics).where(eq(qaqfCharacteristics.id, id));
    return characteristic || undefined;
  }
  
  async getQaqfCharacteristics(): Promise<QaqfCharacteristic[]> {
    return await db.select().from(qaqfCharacteristics);
  }
  
  async createQaqfCharacteristic(characteristic: InsertQaqfCharacteristic): Promise<QaqfCharacteristic> {
    const [newCharacteristic] = await db
      .insert(qaqfCharacteristics)
      .values(characteristic)
      .returning();
    return newCharacteristic;
  }
  
  async getContent(id: number): Promise<Content | undefined> {
    const [content] = await db.select().from(contents).where(eq(contents.id, id));
    return content || undefined;
  }
  
  async getContents(): Promise<Content[]> {
    return await db.select().from(contents).orderBy(desc(contents.createdAt));
  }
  
  async getContentsByUser(userId: number): Promise<Content[]> {
    return await db.select()
      .from(contents)
      .where(eq(contents.createdByUserId, userId))
      .orderBy(desc(contents.createdAt));
  }
  
  async getContentsByVerificationStatus(status: string): Promise<Content[]> {
    return await db.select()
      .from(contents)
      .where(eq(contents.verificationStatus, status))
      .orderBy(desc(contents.createdAt));
  }
  
  async createContent(content: InsertContent): Promise<Content> {
    const [newContent] = await db
      .insert(contents)
      .values({
        ...content,
        verificationStatus: content.verificationStatus || SchemaVerificationStatus.PENDING,
        moduleCode: content.moduleCode || null,
        verifiedByUserId: content.verifiedByUserId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newContent;
  }
  
  async updateContent(id: number, contentUpdate: Partial<Content>): Promise<Content | undefined> {
    const [updatedContent] = await db
      .update(contents)
      .set({
        ...contentUpdate,
        updatedAt: new Date()
      })
      .where(eq(contents.id, id))
      .returning();
    return updatedContent || undefined;
  }
  
  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video || undefined;
  }
  
  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.createdAt));
  }
  
  async getVideosByUser(userId: number): Promise<Video[]> {
    return await db.select()
      .from(videos)
      .where(eq(videos.createdByUserId, userId))
      .orderBy(desc(videos.createdAt));
  }
  
  async getVideosByVerificationStatus(status: string): Promise<Video[]> {
    return await db.select()
      .from(videos)
      .where(eq(videos.verificationStatus, status))
      .orderBy(desc(videos.createdAt));
  }
  
  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db
      .insert(videos)
      .values({
        ...video,
        verificationStatus: video.verificationStatus || SchemaVerificationStatus.PENDING,
        moduleCode: video.moduleCode || null,
        url: video.url || null,
        verifiedByUserId: video.verifiedByUserId || null,
        thumbnailUrl: video.thumbnailUrl || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newVideo;
  }
  
  async updateVideo(id: number, videoUpdate: Partial<Video>): Promise<Video | undefined> {
    const [updatedVideo] = await db
      .update(videos)
      .set({
        ...videoUpdate,
        updatedAt: new Date()
      })
      .where(eq(videos.id, id))
      .returning();
    return updatedVideo || undefined;
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity || undefined;
  }
  
  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(50);
  }
  
  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return await db.select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt));
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values({
        ...activity,
        details: activity.details || {},
        createdAt: new Date()
      })
      .returning();
    return newActivity;
  }
  
  // Study Material operations
  async getStudyMaterials(): Promise<StudyMaterial[]> {
    return await db.select().from(studyMaterials).orderBy(desc(studyMaterials.createdAt));
  }

  async getStudyMaterialById(id: number): Promise<StudyMaterial | undefined> {
    const [material] = await db.select().from(studyMaterials).where(eq(studyMaterials.id, id));
    return material || undefined;
  }

  async createStudyMaterial(material: InsertStudyMaterial): Promise<StudyMaterial> {
    const [newMaterial] = await db
      .insert(studyMaterials)
      .values({
        ...material,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newMaterial;
  }

  async updateStudyMaterial(id: number, updates: Partial<StudyMaterial>): Promise<StudyMaterial | undefined> {
    const [updatedMaterial] = await db
      .update(studyMaterials)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(studyMaterials.id, id))
      .returning();
    return updatedMaterial || undefined;
  }

  async deleteStudyMaterial(id: number): Promise<void> {
    await db.delete(studyMaterials).where(eq(studyMaterials.id, id));
  }

  // Collection operations
  async getCollections(): Promise<Collection[]> {
    return await db.select().from(collections).orderBy(desc(collections.createdAt));
  }

  async getCollectionById(id: number): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection || undefined;
  }

  async getCollectionMaterials(collectionId: number): Promise<StudyMaterial[]> {
    return await db
      .select({
        id: studyMaterials.id,
        title: studyMaterials.title,
        description: studyMaterials.description,
        type: studyMaterials.type,
        qaqfLevel: studyMaterials.qaqfLevel,
        fileName: studyMaterials.fileName,
        filePath: studyMaterials.filePath,
        fileSize: studyMaterials.fileSize,
        mimeType: studyMaterials.mimeType,
        content: studyMaterials.content,
        tags: studyMaterials.tags,
        createdByUserId: studyMaterials.createdByUserId,
        createdAt: studyMaterials.createdAt,
        updatedAt: studyMaterials.updatedAt,
      })
      .from(studyMaterials)
      .innerJoin(collectionMaterials, eq(studyMaterials.id, collectionMaterials.materialId))
      .where(eq(collectionMaterials.collectionId, collectionId))
      .orderBy(desc(collectionMaterials.addedAt));
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const [newCollection] = await db
      .insert(collections)
      .values({
        ...collection,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newCollection;
  }

  async updateCollection(id: number, updates: Partial<Collection>): Promise<Collection | undefined> {
    const [updatedCollection] = await db
      .update(collections)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(collections.id, id))
      .returning();
    return updatedCollection || undefined;
  }

  async deleteCollection(id: number): Promise<void> {
    await db.delete(collectionMaterials).where(eq(collectionMaterials.collectionId, id));
    await db.delete(collections).where(eq(collections.id, id));
  }

  async addMaterialToCollection(collectionId: number, materialId: number): Promise<void> {
    await db
      .insert(collectionMaterials)
      .values({
        collectionId,
        materialId,
        addedAt: new Date()
      });
  }

  async removeMaterialFromCollection(collectionId: number, materialId: number): Promise<void> {
    await db
      .delete(collectionMaterials)
      .where(
        and(
          eq(collectionMaterials.collectionId, collectionId),
          eq(collectionMaterials.materialId, materialId)
        )
      );
  }

  // Material Template operations
  async getMaterialTemplates(): Promise<MaterialTemplate[]> {
    return await db.select().from(materialTemplates).orderBy(desc(materialTemplates.createdAt));
  }

  async getMaterialTemplateById(id: number): Promise<MaterialTemplate | undefined> {
    const [template] = await db.select().from(materialTemplates).where(eq(materialTemplates.id, id));
    return template || undefined;
  }

  async createMaterialTemplate(template: InsertMaterialTemplate): Promise<MaterialTemplate> {
    const [newTemplate] = await db
      .insert(materialTemplates)
      .values({
        ...template,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newTemplate;
  }

  async updateMaterialTemplate(id: number, updates: Partial<MaterialTemplate>): Promise<MaterialTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(materialTemplates)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(materialTemplates.id, id))
      .returning();
    return updatedTemplate || undefined;
  }

  async deleteMaterialTemplate(id: number): Promise<void> {
    await db.delete(materialTemplates).where(eq(materialTemplates.id, id));
  }

  async createMaterialFromTemplate(templateId: number, customizations: any): Promise<StudyMaterial> {
    const template = await this.getMaterialTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    await db
      .update(materialTemplates)
      .set({ usageCount: (template.usageCount || 0) + 1 })
      .where(eq(materialTemplates.id, templateId));

    let content = template.templateContent;
    if (template.placeholders && customizations) {
      (template.placeholders as any[]).forEach((placeholder: any) => {
        if (customizations[placeholder.key]) {
          content = content.replace(`{{${placeholder.key}}}`, customizations[placeholder.key]);
        }
      });
    }

    const materialData: InsertStudyMaterial = {
      title: customizations.title || template.title,
      description: customizations.description || template.description,
      type: template.type,
      qaqfLevel: customizations.qaqfLevel || (template.qaqfLevel === 'Various' ? 1 : parseInt(template.qaqfLevel?.split('-')[0] || '1')),
      content,
      tags: customizations.tags || [],
      createdByUserId: 1,
    };

    return await this.createStudyMaterial(materialData);
  }

  async getDashboardStats(): Promise<{
    contentCount: number;
    verifiedContentCount: number;
    pendingVerificationCount: number;
    videoCount: number;
  }> {
    const contentCount = await db.select({ count: count() }).from(contents);
    const verifiedContentCount = await db.select({ count: count() })
      .from(contents)
      .where(eq(contents.verificationStatus, VerificationStatus.VERIFIED));
    const pendingVerificationCount = await db.select({ count: count() })
      .from(contents)
      .where(eq(contents.verificationStatus, VerificationStatus.PENDING));
    const videoCount = await db.select({ count: count() }).from(videos);
    
    return {
      contentCount: contentCount[0]?.count || 0,
      verifiedContentCount: verifiedContentCount[0]?.count || 0,
      pendingVerificationCount: pendingVerificationCount[0]?.count || 0,
      videoCount: videoCount[0]?.count || 0
    };
  }
}

// Initialize tables with QAQF data if needed
async function initializeDatabase() {
  const existingLevels = await db.select().from(qaqfLevels);
  if (existingLevels.length === 0) {
    // Initialize QAQF levels one by one
    for (const level of [
      { level: 1, name: "Basic", description: "Basic implementation of nine characteristics within learning and education environment." },
      { level: 2, name: "Rudimentary", description: "Rudimentary implementation of nine characteristics within learning and education environment." },
      { level: 3, name: "Crucial", description: "Crucial implementation of nine characteristics within learning and education environment." },
      { level: 4, name: "Key", description: "Key implementation of nine characteristics within learning and education environment." },
      { level: 5, name: "Substantial", description: "Substantial implementation of nine characteristics within learning and education environment." },
      { level: 6, name: "Critical", description: "Critical implementation of nine characteristics within learning and education environment." },
      { level: 7, name: "Leading", description: "Leading implementation of nine characteristics within learning and education environment." },
      { level: 8, name: "Specialist", description: "Specialist implementation of nine characteristics within learning and education environment." },
      { level: 9, name: "21st Century Innovative", description: "21st century innovative implementation of nine characteristics within learning and education environment." }
    ]) {
      await db.insert(qaqfLevels).values(level);
    }
  }
  
  const existingCharacteristics = await db.select().from(qaqfCharacteristics);
  if (existingCharacteristics.length === 0) {
    // Initialize QAQF characteristics one by one
    for (const characteristic of [
      { name: "Knowledge and understanding", description: "Descriptive, simple, facts, ideas, concepts, subject, discipline, defining understanding", category: "foundation", icon: "school" },
      { name: "Applied knowledge", description: "Application of: theories, facts, ideas, concepts", category: "foundation", icon: "psychology" },
      { name: "Cognitive skills", description: "Critical, analytical, research", category: "foundation", icon: "tips_and_updates" },
      { name: "Communication", description: "English level, use of command of communication", category: "intermediate", icon: "chat" },
      { name: "Autonomy, accountability & working with others", description: "Team work, group work, autonomy, independent thinking, accountability of thoughts", category: "intermediate", icon: "groups" },
      { name: "Digitalisation & AI", description: "Application of digital knowledge, use of artificial intelligence, application of advanced IT, implementation of Robotic thinking", category: "intermediate", icon: "computer" },
      { name: "Sustainability & ecological", description: "Show sustainability, resilient and ecological thinking", category: "advanced", icon: "eco" },
      { name: "Reflective & creative", description: "Level of reflection, creativity and innovative input", category: "advanced", icon: "auto_awesome" },
      { name: "Futuristic/Genius Skills", description: "Think outside the box, show different thinking on outcomes", category: "advanced", icon: "lightbulb" }
    ]) {
      await db.insert(qaqfCharacteristics).values(characteristic);
    }
  }
}

// Import database module and helpers
import { db } from "./db";
import { eq, desc, count, and } from "drizzle-orm";
import { 
  users, 
  qaqfLevels, 
  qaqfCharacteristics, 
  contents, 
  videos, 
  activities,
  studyMaterials,
  collections,
  collectionMaterials,
  materialTemplates,
  VerificationStatus as SchemaVerificationStatus
} from "@shared/schema";

// Initialize storage with database
export const storage = new DatabaseStorage();

// Initialize the database with default data
initializeDatabase().catch(console.error);
