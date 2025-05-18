import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  avatar: true,
});

// Content types enum
export const ContentType = {
  ACADEMIC_PAPER: "academic_paper",
  ASSESSMENT: "assessment",
  VIDEO: "video",
  LECTURE: "lecture",
  COURSE: "course",
} as const;

// Verification status enum
export const VerificationStatus = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  IN_REVIEW: "in_review",
} as const;

// QAQF level schema (1-9)
export const qaqfLevels = pgTable("qaqf_levels", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const insertQaqfLevelSchema = createInsertSchema(qaqfLevels).pick({
  level: true,
  name: true,
  description: true,
});

// QAQF characteristics schema
export const qaqfCharacteristics = pgTable("qaqf_characteristics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
});

export const insertQaqfCharacteristicSchema = createInsertSchema(qaqfCharacteristics).pick({
  name: true,
  description: true,
  category: true,
});

// Content schema
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  qaqfLevel: integer("qaqf_level").notNull(),
  moduleCode: text("module_code"),
  createdByUserId: integer("created_by_user_id").notNull(),
  verificationStatus: text("verification_status").notNull().default(VerificationStatus.PENDING),
  verifiedByUserId: integer("verified_by_user_id"),
  content: text("content").notNull(),
  characteristics: json("characteristics").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertContentSchema = createInsertSchema(contents).pick({
  title: true,
  description: true,
  type: true,
  qaqfLevel: true,
  moduleCode: true,
  createdByUserId: true,
  verificationStatus: true,
  verifiedByUserId: true,
  content: true,
  characteristics: true,
});

// Video schema
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  qaqfLevel: integer("qaqf_level").notNull(),
  moduleCode: text("module_code"),
  createdByUserId: integer("created_by_user_id").notNull(),
  verificationStatus: text("verification_status").notNull().default(VerificationStatus.PENDING),
  verifiedByUserId: integer("verified_by_user_id"),
  animationStyle: text("animation_style").notNull(),
  duration: text("duration").notNull(),
  characteristics: json("characteristics").notNull(),
  url: text("url"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  title: true,
  description: true,
  qaqfLevel: true,
  moduleCode: true,
  createdByUserId: true,
  verificationStatus: true,
  verifiedByUserId: true,
  animationStyle: true,
  duration: true,
  characteristics: true,
  url: true,
  thumbnailUrl: true,
});

// Activity schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  details: json("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  action: true,
  entityType: true,
  entityId: true,
  details: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type QaqfLevel = typeof qaqfLevels.$inferSelect;
export type InsertQaqfLevel = z.infer<typeof insertQaqfLevelSchema>;

export type QaqfCharacteristic = typeof qaqfCharacteristics.$inferSelect;
export type InsertQaqfCharacteristic = z.infer<typeof insertQaqfCharacteristicSchema>;

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
