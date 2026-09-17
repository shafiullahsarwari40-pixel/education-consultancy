// Keep validation ahead of any database or storage mutations.
export class RequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function readBoundedBody(request, maxBytes) {
  const declaredSize = Number(request.headers.get('content-length') || 0);
  if (declaredSize > maxBytes) throw new RequestError('The request is too large.', 413);
  if (!request.body) throw new RequestError('A request body is required.');

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestError('The request is too large.', 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return new Blob(chunks);
}

export async function readJson(request, maxBytes = 16 * 1024) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new RequestError('Please send a JSON request.', 415);
  }
  const body = await readBoundedBody(request, maxBytes);
  try {
    const value = JSON.parse(await body.text());
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    throw new RequestError('The request contains invalid JSON.');
  }
}

export function textField(value, label, maxLength, required = false) {
  if (value == null && !required) return '';
  if (typeof value !== 'string') throw new RequestError(`${label} must be text.`);
  const clean = value.trim();
  if (required && !clean) throw new RequestError(`${label} is required.`);
  if (clean.length > maxLength) throw new RequestError(`${label} must be ${maxLength} characters or fewer.`);
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(clean)) {
    throw new RequestError(`${label} contains unsupported characters.`);
  }
  return clean;
}

export function emailField(value) {
  const email = textField(value, 'Email', 254, true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestError('Enter a valid email address.');
  return email;
}

// A bounded, per-process burst guard. Production edge rate limits remain useful
// when the app runs across multiple server instances.
const requestWindows = new Map();
export function rateLimit(key, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  if (requestWindows.size >= 2000) {
    for (const [id, value] of requestWindows) {
      if (value.expires <= now) requestWindows.delete(id);
    }
    if (requestWindows.size >= 2000) requestWindows.delete(requestWindows.keys().next().value);
  }
  const current = requestWindows.get(key);
  if (!current || current.expires <= now) {
    requestWindows.set(key, { count: 1, expires: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function requestAddress(request) {
  return (request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown').slice(0, 100);
}
