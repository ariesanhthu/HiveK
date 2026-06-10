import { z } from "zod";

export const platformSchema = z.enum(["facebook", "threads", "tiktok"]);
export const socialPlatformSchema = z.enum(["tiktok", "instagram", "youtube"]);

export const generateCampaignPlanRequestSchema = z.object({
  days: z.number().int().min(1).max(30).default(7),
  platforms: z.array(platformSchema).min(1).default(["threads", "facebook"]),
  mode: z.enum(["human_review", "auto_publish"]).default("human_review"),
  forceRefresh: z.boolean().optional(),
});

export const generateSinglePostRequestSchema = z.object({
  stepId: z.string().min(1),
  platform: platformSchema,
  angle: z.string().min(1),
  userInstruction: z.string().optional(),
});

export const validateContentRequestSchema = z.object({
  campaignId: z.string().min(1),
  platform: platformSchema,
  content: z.string().min(1),
});

export const matchKolKocRequestSchema = z.object({
  campaignId: z.string().min(1),
  limit: z.number().int().min(1).max(20).default(10),
  filters: z.object({
    platforms: z.array(socialPlatformSchema).min(1).default(["tiktok"]),
    minFollowers: z.number().int().nonnegative().optional(),
    maxEstimatedCost: z.number().int().positive().optional(),
  }),
});

export const saveFeedbackRequestSchema = z.object({
  campaignId: z.string().min(1),
  stepId: z.string().optional(),
  assetId: z.string().optional(),
  eventType: z.enum([
    "approve",
    "reject",
    "edit",
    "regenerate",
    "publish",
    "pin_as_good",
    "mark_too_ai",
    "mark_wrong_fact",
  ]),
  beforeText: z.string().optional(),
  afterText: z.string().optional(),
  reason: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
