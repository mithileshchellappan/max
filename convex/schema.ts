import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  authKind,
  jwtAlgorithm,
  requestProtocol,
  variable,
  workspaceMemberStatus,
  workspaceRole,
  workspaceType,
} from "./lib/validators";

export default defineSchema({
  ...authTables,

  workspaces: defineTable({
    name: v.string(),
    type: workspaceType,
    ownerId: v.id("users"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    archived: v.boolean(),
    docs: v.optional(v.string()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_archived", ["archived"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.id("users")),
    invitedEmail: v.optional(v.string()),
    role: workspaceRole,
    status: workspaceMemberStatus,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_invited_email", ["invitedEmail"])
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_workspace_email", ["workspaceId", "invitedEmail"]),

  collections: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    sortKey: v.optional(v.string()),
    root: v.optional(v.any()),
    format: v.optional(v.union(v.literal("bru"), v.literal("yml"))),
    deleted: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_deleted", ["workspaceId", "deleted"]),

  collectionItems: defineTable({
    workspaceId: v.id("workspaces"),
    collectionId: v.id("collections"),
    parentId: v.optional(v.id("collectionItems")),
    kind: v.union(v.literal("folder"), v.literal("request")),
    protocol: v.optional(requestProtocol),
    name: v.string(),
    sortKey: v.optional(v.string()),
    request: v.optional(v.any()),
    folder: v.optional(v.any()),
    deleted: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_collection", ["collectionId"])
    .index("by_collection_parent", ["collectionId", "parentId"])
    .index("by_collection_deleted", ["collectionId", "deleted"]),

  collectionEnvironments: defineTable({
    workspaceId: v.id("workspaces"),
    collectionId: v.id("collections"),
    name: v.string(),
    color: v.optional(v.string()),
    variables: v.array(variable),
    deleted: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_collection", ["collectionId"])
    .index("by_collection_deleted", ["collectionId", "deleted"]),

  workspaceEnvironments: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    color: v.optional(v.string()),
    variables: v.array(variable),
    deleted: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_deleted", ["workspaceId", "deleted"]),

  collectionVariables: defineTable({
    workspaceId: v.id("workspaces"),
    collectionId: v.id("collections"),
    variables: v.array(variable),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }).index("by_collection", ["collectionId"]),

  authConfigs: defineTable({
    workspaceId: v.id("workspaces"),
    collectionId: v.optional(v.id("collections")),
    itemId: v.optional(v.id("collectionItems")),
    name: v.string(),
    kind: authKind,
    config: v.any(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_collection", ["collectionId"])
    .index("by_item", ["itemId"]),

  jwtTemplates: defineTable({
    workspaceId: v.id("workspaces"),
    collectionId: v.optional(v.id("collections")),
    name: v.string(),
    algorithm: jwtAlgorithm,
    header: v.optional(v.any()),
    payload: v.optional(v.any()),
    expiresInSeconds: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_collection", ["collectionId"]),

  oauthCredentials: defineTable({
    workspaceId: v.id("workspaces"),
    collectionId: v.optional(v.id("collections")),
    itemId: v.optional(v.id("collectionItems")),
    credentialsId: v.string(),
    provider: v.optional(v.string()),
    tokenSet: v.any(),
    expiresAt: v.optional(v.number()),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_collection", ["collectionId"])
    .index("by_item", ["itemId"])
    .index("by_credentials", ["workspaceId", "credentialsId"]),
});
