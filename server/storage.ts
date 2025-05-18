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

export const storage = new MemStorage();
