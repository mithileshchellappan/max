import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  assertCollectionInWorkspace,
  requireWorkspaceRole,
  requireWorkspaceWriter,
} from "./lib/authz";
import { variable } from "./lib/validators";

export const getCollectionVariables = query({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.id("collections"),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceRole(ctx, args.workspaceId);
    await assertCollectionInWorkspace(ctx, args.workspaceId, args.collectionId);
    return await ctx.db
      .query("collectionVariables")
      .withIndex("by_collection", (q) => q.eq("collectionId", args.collectionId))
      .unique();
  },
});

export const setCollectionVariables = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.id("collections"),
    variables: v.array(variable),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireWorkspaceWriter(ctx, args.workspaceId);
    await assertCollectionInWorkspace(ctx, args.workspaceId, args.collectionId);
    const existing = await ctx.db
      .query("collectionVariables")
      .withIndex("by_collection", (q) => q.eq("collectionId", args.collectionId))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        variables: args.variables,
        updatedBy: userId,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("collectionVariables", {
      workspaceId: args.workspaceId,
      collectionId: args.collectionId,
      variables: args.variables,
      updatedBy: userId,
      updatedAt: now,
    });
  },
});
