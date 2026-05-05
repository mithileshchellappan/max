import { getAuthUserId } from "@convex-dev/auth/server";

const writeRoles = new Set(["owner", "admin", "editor"]);
const adminRoles = new Set(["owner", "admin"]);

export const requireUserId = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  return userId;
};

export const requireWorkspaceRole = async (
  ctx: any,
  workspaceId: any,
  allowedRoles = ["owner", "admin", "editor", "viewer"],
) => {
  const userId = await requireUserId(ctx);
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace || workspace.archived) {
    throw new Error("Workspace not found");
  }

  if (workspace.ownerId === userId && allowedRoles.includes("owner")) {
    return { userId, workspace, role: "owner" };
  }

  const member = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_user", (q: any) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();

  if (!member || member.status !== "active" || !allowedRoles.includes(member.role)) {
    throw new Error("Forbidden");
  }

  return { userId, workspace, role: member.role };
};

export const requireWorkspaceWriter = (ctx: any, workspaceId: any) =>
  requireWorkspaceRole(ctx, workspaceId, Array.from(writeRoles));

export const requireWorkspaceAdmin = (ctx: any, workspaceId: any) =>
  requireWorkspaceRole(ctx, workspaceId, Array.from(adminRoles));

export const assertCollectionInWorkspace = async (
  ctx: any,
  workspaceId: any,
  collectionId: any,
) => {
  const collection = await ctx.db.get(collectionId);
  if (!collection || collection.workspaceId !== workspaceId || collection.deleted) {
    throw new Error("Collection not found");
  }

  return collection;
};

export const assertItemInWorkspace = async (
  ctx: any,
  workspaceId: any,
  itemId: any,
) => {
  const item = await ctx.db.get(itemId);
  if (!item || item.workspaceId !== workspaceId || item.deleted) {
    throw new Error("Item not found");
  }

  return item;
};
