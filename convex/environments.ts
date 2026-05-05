import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  assertCollectionInWorkspace,
  requireWorkspaceRole,
  requireWorkspaceWriter,
} from "./lib/authz";
import { variable } from "./lib/validators";

export const listWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireWorkspaceRole(ctx, args.workspaceId);
    return await ctx.db
      .query("workspaceEnvironments")
      .withIndex("by_workspace_deleted", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("deleted", false),
      )
      .collect();
  },
});

export const upsertWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    environmentId: v.optional(v.id("workspaceEnvironments")),
    name: v.string(),
    color: v.optional(v.string()),
    variables: v.array(variable),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireWorkspaceWriter(ctx, args.workspaceId);
    const now = Date.now();

    if (args.environmentId) {
      const environment = await ctx.db.get(args.environmentId);
      if (!environment || environment.workspaceId !== args.workspaceId || environment.deleted) {
        throw new Error("Environment not found");
      }

      await ctx.db.patch(args.environmentId, {
        name: args.name,
        color: args.color,
        variables: args.variables,
        updatedAt: now,
      });
      return args.environmentId;
    }

    return await ctx.db.insert("workspaceEnvironments", {
      workspaceId: args.workspaceId,
      name: args.name,
      color: args.color,
      variables: args.variables,
      deleted: false,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const removeWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    environmentId: v.id("workspaceEnvironments"),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceWriter(ctx, args.workspaceId);
    const environment = await ctx.db.get(args.environmentId);
    if (!environment || environment.workspaceId !== args.workspaceId || environment.deleted) {
      throw new Error("Environment not found");
    }

    await ctx.db.patch(args.environmentId, {
      deleted: true,
      updatedAt: Date.now(),
    });
    return args.environmentId;
  },
});

export const listCollection = query({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.id("collections"),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceRole(ctx, args.workspaceId);
    await assertCollectionInWorkspace(ctx, args.workspaceId, args.collectionId);
    return await ctx.db
      .query("collectionEnvironments")
      .withIndex("by_collection_deleted", (q) =>
        q.eq("collectionId", args.collectionId).eq("deleted", false),
      )
      .collect();
  },
});

export const upsertCollection = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.id("collections"),
    environmentId: v.optional(v.id("collectionEnvironments")),
    name: v.string(),
    color: v.optional(v.string()),
    variables: v.array(variable),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireWorkspaceWriter(ctx, args.workspaceId);
    await assertCollectionInWorkspace(ctx, args.workspaceId, args.collectionId);
    const now = Date.now();

    if (args.environmentId) {
      const environment = await ctx.db.get(args.environmentId);
      if (
        !environment ||
        environment.workspaceId !== args.workspaceId ||
        environment.collectionId !== args.collectionId ||
        environment.deleted
      ) {
        throw new Error("Environment not found");
      }

      await ctx.db.patch(args.environmentId, {
        name: args.name,
        color: args.color,
        variables: args.variables,
        updatedAt: now,
      });
      return args.environmentId;
    }

    return await ctx.db.insert("collectionEnvironments", {
      workspaceId: args.workspaceId,
      collectionId: args.collectionId,
      name: args.name,
      color: args.color,
      variables: args.variables,
      deleted: false,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const removeCollection = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    environmentId: v.id("collectionEnvironments"),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceWriter(ctx, args.workspaceId);
    const environment = await ctx.db.get(args.environmentId);
    if (!environment || environment.workspaceId !== args.workspaceId || environment.deleted) {
      throw new Error("Environment not found");
    }

    await ctx.db.patch(args.environmentId, {
      deleted: true,
      updatedAt: Date.now(),
    });
    return args.environmentId;
  },
});
