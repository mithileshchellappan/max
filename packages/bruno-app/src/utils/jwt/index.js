const defaultHeader = {
  typ: 'JWT'
};

const defaultPayload = {
  sub: ''
};

const textEncoder = new TextEncoder();

const base64UrlEncode = (value) => {
  const bytes = value instanceof Uint8Array ? value : textEncoder.encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const parseJson = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const hashForAlgorithm = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512'
};

export const jwtAlgorithms = Object.keys(hashForAlgorithm);

export const generateJwt = async ({
  algorithm = 'HS256',
  secret = '',
  header,
  payload,
  expiresInSeconds
}) => {
  const resolvedAlgorithm = hashForAlgorithm[algorithm] ? algorithm : 'HS256';
  const resolvedSecret = String(secret || '');
  if (!resolvedSecret) {
    throw new Error('JWT secret is required');
  }

  const now = Math.floor(Date.now() / 1000);
  const parsedHeader = {
    ...defaultHeader,
    ...parseJson(header, defaultHeader),
    alg: resolvedAlgorithm
  };
  const parsedPayload = {
    ...parseJson(payload, defaultPayload)
  };

  if (parsedPayload.iat === undefined) {
    parsedPayload.iat = now;
  }
  const expirySeconds = Number(expiresInSeconds);
  if (Number.isFinite(expirySeconds) && expirySeconds > 0 && parsedPayload.exp === undefined) {
    parsedPayload.exp = now + Math.floor(expirySeconds);
  }

  const signingInput = [
    base64UrlEncode(JSON.stringify(parsedHeader)),
    base64UrlEncode(JSON.stringify(parsedPayload))
  ].join('.');

  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(resolvedSecret),
    { name: 'HMAC', hash: hashForAlgorithm[resolvedAlgorithm] },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(signingInput));
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
};

export const defaultJwtConfig = {
  algorithm: 'HS256',
  secret: '',
  tokenPrefix: 'Bearer',
  header: JSON.stringify(defaultHeader, null, 2),
  payload: JSON.stringify(defaultPayload, null, 2),
  expiresInSeconds: 3600
};
