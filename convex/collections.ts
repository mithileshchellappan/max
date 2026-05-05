import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  assertCollectionInWorkspace,
  assertItemInWorkspace,
  requireWorkspaceRole,
  requireWorkspaceWriter,
} from "./lib/authz";
import { requestProtocol } from "./lib/validators";

export const tree = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireWorkspaceRole(ctx, args.workspaceId);
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_workspace_deleted", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("deleted", false),
      )
      .collect();

    const collectionIds = new Set(collections.map((collection) => collection._id));
    const allItems = await ctx.db
      .query("collectionItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const items = allItems.filter(
      (item) => !item.deleted && collectionIds.has(item.collectionId),
    );

    const environments = [];
    for (const collection of collections) {
      const collectionEnvironments = await ctx.db
        .query("collectionEnvironments")
        .withIndex("by_collection_deleted", (q) =>
          q.eq("collectionId", collection._id).eq("deleted", false),
        )
        .collect();
      environments.push(...collectionEnvironments);
    }

    return { collections, items, environments };
  },
});

export const list = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireWorkspaceRole(ctx, args.workspaceId);
    return await ctx.db
      .query("collections")
      .withIndex("by_workspace_deleted", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("deleted", false),
      )
      .collect();
  },
});

export const upsert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.optional(v.id("collections")),
    name: v.string(),
    sortKey: v.optional(v.string()),
    root: v.optional(v.any()),
    format: v.optional(v.union(v.literal("bru"), v.literal("yml"))),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireWorkspaceWriter(ctx, args.workspaceId);
    const now = Date.now();

    if (args.collectionId) {
      await assertCollectionInWorkspace(ctx, args.workspaceId, args.collectionId);
      await ctx.db.patch(args.collectionId, {
        name: args.name,
        sortKey: args.sortKey,
        root: args.root,
        format: args.format,
        updatedAt: now,
      });
      return args.collectionId;
    }

    return await ctx.db.insert("collections", {
      workspaceId: args.workspaceId,
      name: args.name,
      sortKey: args.sortKey,
      root: args.root,
      format: args.format ?? "yml",
      deleted: false,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.id("collections"),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceWriter(ctx, args.workspaceId);
    await assertCollectionInWorkspace(ctx, args.workspaceId, args.collectionId);
    await ctx.db.patch(args.collectionId, {
      deleted: true,
      updatedAt: Date.now(),
    });

    return args.collectionId;
  },
});

export const upsertItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.id("collections"),
    itemId: v.optional(v.id("collectionItems")),
    parentId: v.optional(v.id("collectionItems")),
    kind: v.union(v.literal("folder"), v.literal("request")),
    protocol: v.optional(requestProtocol),
    name: v.string(),
    sortKey: v.optional(v.string()),
    request: v.optional(v.any()),
    folder: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireWorkspaceWriter(ctx, args.workspaceId);
    await assertCollectionInWorkspace(ctx, args.workspaceId, args.collectionId);
    if (args.parentId) {
      const parent = await assertItemInWorkspace(ctx, args.workspaceId, args.parentId);
      if (parent.collectionId !== args.collectionId || parent.kind !== "folder") {
        throw new Error("Invalid parent item");
      }
    }

    const now = Date.now();
    if (args.itemId) {
      const existing = await assertItemInWorkspace(ctx, args.workspaceId, args.itemId);
      if (existing.collectionId !== args.collectionId) {
        throw new Error("Item does not belong to collection");
      }

      await ctx.db.patch(args.itemId, {
        parentId: args.parentId,
        kind: args.kind,
        protocol: args.protocol,
        name: args.name,
        sortKey: args.sortKey,
        request: args.request,
        folder: args.folder,
        updatedAt: now,
      });
      return args.itemId;
    }

    return await ctx.db.insert("collectionItems", {
      workspaceId: args.workspaceId,
      collectionId: args.collectionId,
      parentId: args.parentId,
      kind: args.kind,
      protocol: args.protocol,
      name: args.name,
      sortKey: args.sortKey,
      request: args.request,
      folder: args.folder,
      deleted: false,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const removeItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    itemId: v.id("collectionItems"),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceWriter(ctx, args.workspaceId);
    await assertItemInWorkspace(ctx, args.workspaceId, args.itemId);
    await ctx.db.patch(args.itemId, {
      deleted: true,
      updatedAt: Date.now(),
    });

    return args.itemId;
  },
});
