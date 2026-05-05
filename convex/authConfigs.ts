import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  assertCollectionInWorkspace,
  assertItemInWorkspace,
  requireWorkspaceRole,
  requireWorkspaceWriter,
} from "./lib/authz";
import { authKind, jwtAlgorithm } from "./lib/validators";

const validateScope = async (
  ctx: any,
  workspaceId: any,
  collectionId?: any,
  itemId?: any,
) => {
  if (collectionId) {
    await assertCollectionInWorkspace(ctx, workspaceId, collectionId);
  }
  if (itemId) {
    const item = await assertItemInWorkspace(ctx, workspaceId, itemId);
    if (collectionId && item.collectionId !== collectionId) {
      throw new Error("Item does not belong to collection");
    }
  }
};

export const listForWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireWorkspaceRole(ctx, args.workspaceId);
    return await ctx.db
      .query("authConfigs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const upsertAuthConfig = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    authConfigId: v.optional(v.id("authConfigs")),
    collectionId: v.optional(v.id("collections")),
    itemId: v.optional(v.id("collectionItems")),
    name: v.string(),
    kind: authKind,
    config: v.any(),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireWorkspaceWriter(ctx, args.workspaceId);
    await validateScope(ctx, args.workspaceId, args.collectionId, args.itemId);
    const now = Date.now();

    if (args.authConfigId) {
      const existing = await ctx.db.get(args.authConfigId);
      if (!existing || existing.workspaceId !== args.workspaceId) {
        throw new Error("Auth config not found");
      }

      await ctx.db.patch(args.authConfigId, {
        collectionId: args.collectionId,
        itemId: args.itemId,
        name: args.name,
        kind: args.kind,
        config: args.config,
        updatedAt: now,
      });
      return args.authConfigId;
    }

    return await ctx.db.insert("authConfigs", {
      workspaceId: args.workspaceId,
      collectionId: args.collectionId,
      itemId: args.itemId,
      name: args.name,
      kind: args.kind,
      config: args.config,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const upsertJwtTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    jwtTemplateId: v.optional(v.id("jwtTemplates")),
    collectionId: v.optional(v.id("collections")),
    name: v.string(),
    algorithm: jwtAlgorithm,
    header: v.optional(v.any()),
    payload: v.optional(v.any()),
    expiresInSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireWorkspaceWriter(ctx, args.workspaceId);
    if (args.collectionId) {
      await assertCollectionInWorkspace(ctx, args.workspaceId, args.collectionId);
    }

    const now = Date.now();
    if (args.jwtTemplateId) {
      const existing = await ctx.db.get(args.jwtTemplateId);
      if (!existing || existing.workspaceId !== args.workspaceId) {
        throw new Error("JWT template not found");
      }

      await ctx.db.patch(args.jwtTemplateId, {
        collectionId: args.collectionId,
        name: args.name,
        algorithm: args.algorithm,
        header: args.header,
        payload: args.payload,
        expiresInSeconds: args.expiresInSeconds,
        updatedAt: now,
      });
      return args.jwtTemplateId;
    }

    return await ctx.db.insert("jwtTemplates", {
      workspaceId: args.workspaceId,
      collectionId: args.collectionId,
      name: args.name,
      algorithm: args.algorithm,
      header: args.header,
      payload: args.payload,
      expiresInSeconds: args.expiresInSeconds,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const upsertOauthCredentials = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.optional(v.id("collections")),
    itemId: v.optional(v.id("collectionItems")),
    credentialsId: v.string(),
    provider: v.optional(v.string()),
    tokenSet: v.any(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireWorkspaceWriter(ctx, args.workspaceId);
    await validateScope(ctx, args.workspaceId, args.collectionId, args.itemId);
    const now = Date.now();
    const existing = await ctx.db
      .query("oauthCredentials")
      .withIndex("by_credentials", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("credentialsId", args.credentialsId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        collectionId: args.collectionId,
        itemId: args.itemId,
        provider: args.provider,
        tokenSet: args.tokenSet,
        expiresAt: args.expiresAt,
        updatedBy: userId,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("oauthCredentials", {
      workspaceId: args.workspaceId,
      collectionId: args.collectionId,
      itemId: args.itemId,
      credentialsId: args.credentialsId,
      provider: args.provider,
      tokenSet: args.tokenSet,
      expiresAt: args.expiresAt,
      updatedBy: userId,
      updatedAt: now,
    });
  },
});
