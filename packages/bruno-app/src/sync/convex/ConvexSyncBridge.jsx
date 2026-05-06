import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useConvexAuth } from '@convex-dev/auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { createWorkspace, setActiveWorkspace, updateWorkspace } from 'providers/ReduxStore/slices/workspaces';
import { removeCollection, upsertSyncedCollection } from 'providers/ReduxStore/slices/collections';
import { api } from './api';
import { useConvexSync } from './ConvexSyncProvider';
import { updateGlobalEnvironments } from 'providers/ReduxStore/slices/global-environments';

const convexPath = (id) => `convex:${id}`;

const cloneForStore = (value) => {
  if (value === undefined || value === null) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
};

const useStableClonedQueryValue = (value) => {
  const stableValue = useRef({
    signature: undefined,
    clone: undefined
  });

  if (value === undefined || value === null) {
    stableValue.current = {
      signature: value,
      clone: value
    };
    return value;
  }

  const signature = JSON.stringify(value);
  if (stableValue.current.signature !== signature) {
    stableValue.current = {
      signature,
      clone: JSON.parse(signature)
    };
  }

  return stableValue.current.clone;
};

const requestTypeForProtocol = (protocol) => {
  if (protocol === 'graphql') {
    return 'graphql-request';
  }
  if (protocol === 'websocket') {
    return 'ws-request';
  }
  if (protocol === 'grpc') {
    return 'grpc-request';
  }
  return 'http-request';
};

const defaultRequest = (protocol) => {
  if (protocol === 'websocket') {
    return {
      url: '',
      method: 'GET',
      params: [],
      body: { mode: 'ws', ws: [] },
      auth: { mode: 'inherit' },
      vars: { req: [], res: [] },
      script: { req: null, res: null },
      assertions: [],
      tests: null,
      docs: ''
    };
  }

  if (protocol === 'grpc') {
    return {
      url: '',
      body: { mode: 'grpc', grpc: [{ name: 'message 1', content: '{}' }] },
      auth: { mode: 'inherit' },
      vars: { req: [], res: [] },
      script: { req: null, res: null },
      assertions: [],
      tests: null,
      docs: ''
    };
  }

  return {
    method: 'GET',
    url: '',
    headers: [],
    params: [],
    body: {
      mode: protocol === 'graphql' ? 'graphql' : 'none',
      json: null,
      text: null,
      xml: null,
      sparql: null,
      graphql: protocol === 'graphql' ? { query: '', variables: '' } : undefined,
      multipartForm: [],
      formUrlEncoded: [],
      file: []
    },
    vars: { req: [], res: [] },
    assertions: [],
    auth: { mode: 'inherit' },
    script: { req: null, res: null },
    tests: null,
    docs: ''
  };
};

const normalizeRequestForStore = (request, protocol) => {
  const base = defaultRequest(protocol);
  const source = cloneForStore(request) || {};
  const sourceBody = source.body && typeof source.body === 'object' && !Array.isArray(source.body) ? source.body : {};
  const body = {
    ...base.body,
    ...sourceBody
  };
  const sourceVars = source.vars && typeof source.vars === 'object' && !Array.isArray(source.vars) ? source.vars : {};
  const sourceScript = source.script && typeof source.script === 'object' && !Array.isArray(source.script) ? source.script : {};

  return {
    ...base,
    ...source,
    headers: Array.isArray(source.headers) ? source.headers : (Array.isArray(base.headers) ? base.headers : []),
    params: Array.isArray(source.params) ? source.params : (Array.isArray(base.params) ? base.params : []),
    body: {
      ...body,
      multipartForm: Array.isArray(body.multipartForm) ? body.multipartForm : [],
      formUrlEncoded: Array.isArray(body.formUrlEncoded) ? body.formUrlEncoded : [],
      file: Array.isArray(body.file) ? body.file : [],
      ws: Array.isArray(body.ws) ? body.ws : base.body?.ws,
      grpc: Array.isArray(body.grpc) ? body.grpc : base.body?.grpc
    },
    auth: source.auth && typeof source.auth === 'object' && !Array.isArray(source.auth) ? source.auth : base.auth,
    vars: {
      ...sourceVars,
      req: Array.isArray(sourceVars.req) ? sourceVars.req : [],
      res: Array.isArray(sourceVars.res) ? sourceVars.res : []
    },
    script: {
      ...sourceScript,
      req: sourceScript.req ?? null,
      res: sourceScript.res ?? null
    },
    assertions: Array.isArray(source.assertions) ? source.assertions : [],
    tests: source.tests ?? base.tests ?? null,
    docs: source.docs ?? base.docs ?? ''
  };
};

const normalizeConvexId = (id) => {
  if (id === undefined || id === null) {
    return undefined;
  }
  if (typeof id === 'object') {
    return id._id || id.id || id.$id || JSON.stringify(id);
  }
  return String(id);
};

const itemMatchesParent = (item, parentId) => {
  return normalizeConvexId(item.parentId) === normalizeConvexId(parentId);
};

const buildItems = (items, collectionId, parentId = undefined) => {
  const normalizedCollectionId = normalizeConvexId(collectionId);
  return items
    .filter((item) => normalizeConvexId(item.collectionId) === normalizedCollectionId && itemMatchesParent(item, parentId))
    .sort((a, b) => (a.sortKey || a.name).localeCompare(b.sortKey || b.name, undefined, { numeric: true }))
    .map((item) => {
      const pathname = convexPath(item._id);
      if (item.kind === 'folder') {
        const folderRoot = item.folder?.meta ? cloneForStore(item.folder) : item.folder?.request?.meta ? cloneForStore(item.folder.request) : {
          meta: { name: item.name },
          request: { auth: { mode: 'inherit' }, headers: [], vars: { req: [], res: [] } }
        };
        return {
          uid: item._id,
          remoteId: item._id,
          parentUid: item.parentId,
          source: 'convex',
          type: 'folder',
          name: item.name,
          filename: item.name,
          pathname,
          items: buildItems(items, collectionId, item._id),
          seq: Number.parseInt(item.sortKey, 10) || undefined,
          root: folderRoot
        };
      }

      const savedItem = item.request?.request ? cloneForStore(item.request) : null;
      if (savedItem) {
        return {
          ...savedItem,
          request: normalizeRequestForStore(savedItem.request, item.protocol),
          uid: item._id,
          remoteId: item._id,
          parentUid: item.parentId,
          source: 'convex',
          name: savedItem.name || item.name,
          filename: savedItem.filename || item.name,
          pathname
        };
      }

      return {
        uid: item._id,
        remoteId: item._id,
        parentUid: item.parentId,
        source: 'convex',
        type: requestTypeForProtocol(item.protocol),
        name: item.name,
        filename: item.name,
        pathname,
        request: normalizeRequestForStore(item.request, item.protocol),
        settings: cloneForStore(item.request?.settings) || { encodeUrl: true }
      };
    });
};

const buildCollection = (workspaceId, collection, items, environments) => {
  return {
    version: '1',
    uid: collection._id,
    remoteId: collection._id,
    workspaceId,
    source: 'convex',
    name: collection.name,
    pathname: convexPath(collection._id),
    root: cloneForStore(collection.root) || {
      docs: '',
      request: { auth: { mode: 'inherit' }, headers: [], vars: { req: [], res: [] } }
    },
    items: buildItems(items, collection._id),
    environments: environments
      .filter((environment) => environment.collectionId === collection._id)
      .map((environment) => ({
        uid: environment._id,
        remoteId: environment._id,
        source: 'convex',
        name: environment.name,
        color: environment.color,
        variables: cloneForStore(environment.variables) || []
      })),
    runtimeVariables: {},
    brunoConfig: {
      opencollection: '1.0.0',
      name: collection.name,
      type: 'collection',
      format: collection.format || 'yml'
    }
  };
};

const ConvexSyncBridgeInner = () => {
  'use no memo';

  const dispatch = useDispatch();
  const { isAuthenticated } = useConvexAuth();
  const activeWorkspaceUid = useSelector((state) => state.workspaces.activeWorkspaceUid);
  const knownCollections = useSelector((state) => state.collections.collections);
  const knownCollectionsRef = useRef(knownCollections);
  const createdDefaultWorkspace = useRef(false);
  const claimedInvites = useRef(false);
  const [invitesChecked, setInvitesChecked] = useState(false);
  const createDefaultWorkspace = useMutation(api.workspaces.create);
  const claimInvites = useMutation(api.workspaces.claimInvitesForCurrentUser);
  const workspaces = useQuery(api.workspaces.list, isAuthenticated ? {} : 'skip');
  const workspaceRows = useStableClonedQueryValue(workspaces);

  useEffect(() => {
    knownCollectionsRef.current = knownCollections;
  }, [knownCollections]);

  useEffect(() => {
    if (!isAuthenticated) {
      claimedInvites.current = false;
      createdDefaultWorkspace.current = false;
      setInvitesChecked(false);
      return;
    }

    if (!isAuthenticated || claimedInvites.current) {
      return;
    }

    claimedInvites.current = true;
    claimInvites()
      .then(() => {
        setInvitesChecked(true);
      })
      .catch(() => {
        claimedInvites.current = false;
        setInvitesChecked(false);
      });
  }, [claimInvites, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !invitesChecked || workspaceRows === undefined) {
      return;
    }

    if (workspaceRows.length === 0 && !createdDefaultWorkspace.current) {
      createdDefaultWorkspace.current = true;
      createDefaultWorkspace({ name: 'My Workspace', type: 'personal' });
      return;
    }

    for (const workspace of workspaceRows) {
      dispatch(createWorkspace({
        uid: workspace._id,
        source: 'convex',
        pathname: convexPath(workspace._id),
        name: workspace.name,
        type: workspace.type,
        role: workspace.role,
        docs: workspace.docs || ''
      }));
    }

    if (workspaceRows.length > 0 && !workspaceRows.some((workspace) => workspace._id === activeWorkspaceUid)) {
      dispatch(setActiveWorkspace(workspaceRows[0]._id));
    }
  }, [activeWorkspaceUid, createDefaultWorkspace, dispatch, invitesChecked, isAuthenticated, workspaceRows]);

  const activeWorkspace = useMemo(() => {
    return workspaceRows?.find((workspace) => workspace._id === activeWorkspaceUid);
  }, [activeWorkspaceUid, workspaceRows]);

  const tree = useQuery(
    api.collections.tree,
    isAuthenticated && activeWorkspace ? { workspaceId: activeWorkspace._id } : 'skip'
  );
  const treeSnapshot = useStableClonedQueryValue(tree);
  const workspaceEnvironments = useQuery(
    api.environments.listWorkspace,
    isAuthenticated && activeWorkspace ? { workspaceId: activeWorkspace._id } : 'skip'
  );
  const workspaceEnvironmentRows = useStableClonedQueryValue(workspaceEnvironments);

  useEffect(() => {
    if (!activeWorkspace || workspaceEnvironmentRows === undefined) {
      return;
    }

    dispatch(updateGlobalEnvironments({
      globalEnvironments: workspaceEnvironmentRows.map((environment) => ({
        uid: environment._id,
        remoteId: environment._id,
        source: 'convex',
        name: environment.name,
        color: environment.color,
        variables: cloneForStore(environment.variables) || []
      })),
      activeGlobalEnvironmentUid: workspaceEnvironmentRows[0]?._id || null
    }));
  }, [activeWorkspace, dispatch, workspaceEnvironmentRows]);

  useEffect(() => {
    if (!activeWorkspace || treeSnapshot === undefined) {
      return;
    }

    const workspaceCollections = treeSnapshot.collections.map((collection) => ({
      uid: collection._id,
      name: collection.name,
      path: convexPath(collection._id),
      source: 'convex'
    }));

    dispatch(updateWorkspace({
      uid: activeWorkspace._id,
      collections: workspaceCollections,
      loadingState: 'loaded'
    }));

    const syncedCollectionIds = new Set(treeSnapshot.collections.map((collection) => collection._id));
    for (const collection of treeSnapshot.collections) {
      dispatch(upsertSyncedCollection(cloneForStore(buildCollection(activeWorkspace._id, collection, treeSnapshot.items, treeSnapshot.environments || []))));
    }

    for (const collection of knownCollectionsRef.current) {
      if (collection.source === 'convex' && collection.workspaceId === activeWorkspace._id && !syncedCollectionIds.has(collection.uid)) {
        dispatch(removeCollection({ collectionUid: collection.uid }));
      }
    }
  }, [activeWorkspace, dispatch, treeSnapshot]);

  return null;
};

const ConvexSyncBridge = () => {
  'use no memo';

  const { enabled } = useConvexSync();
  if (!enabled) {
    return null;
  }

  return <ConvexSyncBridgeInner />;
};

export default ConvexSyncBridge;
