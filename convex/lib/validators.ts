import { v } from "convex/values";

export const workspaceRole = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("editor"),
  v.literal("viewer"),
);

export const workspaceMemberStatus = v.union(
  v.literal("active"),
  v.literal("invited"),
  v.literal("removed"),
);

export const workspaceType = v.union(v.literal("personal"), v.literal("team"));

export const requestProtocol = v.union(
  v.literal("http"),
  v.literal("graphql"),
  v.literal("grpc"),
  v.literal("websocket"),
);

export const authKind = v.union(
  v.literal("none"),
  v.literal("basic"),
  v.literal("bearer"),
  v.literal("apiKey"),
  v.literal("oauth1"),
  v.literal("oauth2"),
  v.literal("jwt"),
  v.literal("awsV4"),
);

export const jwtAlgorithm = v.union(
  v.literal("HS256"),
  v.literal("HS384"),
  v.literal("HS512"),
  v.literal("RS256"),
  v.literal("RS384"),
  v.literal("RS512"),
  v.literal("ES256"),
  v.literal("ES384"),
  v.literal("ES512"),
  v.literal("EdDSA"),
);

export const variable = v.object({
  uid: v.optional(v.string()),
  name: v.string(),
  value: v.optional(v.any()),
  annotations: v.optional(v.array(v.any())),
  type: v.optional(v.string()),
  enabled: v.optional(v.boolean()),
  secret: v.optional(v.boolean()),
  description: v.optional(v.string()),
});
