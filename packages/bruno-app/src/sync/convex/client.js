let convexClient = null;

export const setConvexClient = (client) => {
  convexClient = client;
};

export const getConvexClient = () => convexClient;

export const isConvexCollection = (collection) => {
  return collection?.source === 'convex' || collection?.pathname?.startsWith('convex:');
};
