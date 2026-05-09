import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireWorkspaceAdmin, requireWorkspaceRole } from "./lib/authz";
import { workspaceRole, workspaceType } from "./lib/validators";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const visible = [];
    for (const membership of memberships) {
      if (membership.status !== "active") {
        continue;
      }

      const workspace = await ctx.db.get(membership.workspaceId);
      if (workspace && !workspace.archived) {
        visible.push({ ...workspace, role: membership.role });
      }
    }

    return visible;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.optional(workspaceType),
    docs: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      type: args.type ?? "team",
      ownerId: userId,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      archived: false,
      docs: args.docs,
    });

    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId,
      role: "owner",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return workspaceId;
  },
});

export const update = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
    docs: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceAdmin(ctx, args.workspaceId);
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) {
      patch.name = args.name;
    }
    if (args.docs !== undefined) {
      patch.docs = args.docs;
    }

    await ctx.db.patch(args.workspaceId, patch);
    return args.workspaceId;
  },
});

export const archive = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireWorkspaceAdmin(ctx, args.workspaceId);
    await ctx.db.patch(args.workspaceId, {
      archived: true,
      updatedAt: Date.now(),
    });

    return args.workspaceId;
  },
});

export const inviteMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: workspaceRole,
  },
  handler: async (ctx, args) => {
    await requireWorkspaceAdmin(ctx, args.workspaceId);
    if (args.role === "owner") {
      throw new Error("Owner role cannot be invited");
    }

    const now = Date.now();
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_email", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("invitedEmail", email),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        status: "invited",
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("workspaceMembers", {
      workspaceId: args.workspaceId,
      invitedEmail: email,
      role: args.role,
      status: "invited",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateMemberRole = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    memberId: v.id("workspaceMembers"),
    role: workspaceRole,
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceAdmin(ctx, args.workspaceId);
    const member = await ctx.db.get(args.memberId);
    if (!member || member.workspaceId !== args.workspaceId || member.status === "removed") {
      throw new Error("Member not found");
    }

    if (args.role === "owner") {
      throw new Error("Owner role cannot be assigned here");
    }

    if (member.userId === workspace.ownerId || member.role === "owner") {
      throw new Error("Workspace owner role cannot be changed");
    }

    await ctx.db.patch(args.memberId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return args.memberId;
  },
});

export const removeMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    memberId: v.id("workspaceMembers"),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceAdmin(ctx, args.workspaceId);
    const member = await ctx.db.get(args.memberId);
    if (!member || member.workspaceId !== args.workspaceId || member.status === "removed") {
      throw new Error("Member not found");
    }

    if (member.userId === workspace.ownerId || member.role === "owner") {
      throw new Error("Workspace owner cannot be removed");
    }

    await ctx.db.patch(args.memberId, {
      status: "removed",
      updatedAt: Date.now(),
    });

    return args.memberId;
  },
});

export const claimInvitesForCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const user = await ctx.db.get(userId);
    const email = user?.email?.trim().toLowerCase();
    if (!email || !user?.emailVerificationTime) {
      return [];
    }

    const invites = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_invited_email", (q) => q.eq("invitedEmail", email))
      .collect();

    const claimed = [];
    const now = Date.now();
    for (const invite of invites) {
      if (invite.status !== "invited") {
        continue;
      }

      const existing = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspace_user", (q) =>
          q.eq("workspaceId", invite.workspaceId).eq("userId", userId),
        )
        .unique();

      if (existing && existing.status === "active") {
        await ctx.db.patch(invite._id, {
          status: "removed",
          updatedAt: now,
        });
        continue;
      }

      await ctx.db.patch(invite._id, {
        userId,
        invitedEmail: undefined,
        status: "active",
        updatedAt: now,
      });
      claimed.push(invite.workspaceId);
    }

    return claimed;
  },
});

export const members = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireWorkspaceRole(ctx, args.workspaceId);
    const members = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const visible = [];
    for (const member of members) {
      if (member.status === "removed") {
        continue;
      }

      const user = member.userId ? await ctx.db.get(member.userId) : null;
      visible.push({
        ...member,
        user: user
          ? {
              email: user.email,
              name: user.name,
              image: user.image,
            }
          : null,
      });
    }

    return visible;
  },
});
