// Browser polyfill for path module

export const sep = '/';
export const delimiter = ':';

export function join(...paths: string[]): string {
  return (
    paths
      .filter((p) => p && p !== '.')
      .join('/')
      .replace(/\/+/g, '/')
      .replace(/\/$/, '') || '.'
  );
}

export function resolve(...paths: string[]): string {
  let resolved = '';
  let absolute = false;

  for (let i = paths.length - 1; i >= -1 && !absolute; i--) {
    const path = i >= 0 ? paths[i] : '/';
    if (!path) continue;

    resolved = path + '/' + resolved;
    absolute = path.charAt(0) === '/';
  }

  resolved = normalizeArray(
    resolved.split('/').filter((p) => !!p),
    !absolute,
  ).join('/');
  return (absolute ? '/' : '') + resolved || '.';
}

export function relative(from: string, to: string): string {
  from = resolve(from).substr(1);
  to = resolve(to).substr(1);

  const fromParts = from.split('/');
  const toParts = to.split('/');

  const length = Math.min(fromParts.length, toParts.length);
  let samePartsLength = length;
  for (let i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  let outputParts = [];
  for (let i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join('/');
}

export function dirname(path: string): string {
  const dir = path.substring(0, path.lastIndexOf('/'));
  return dir || (path.charAt(0) === '/' ? '/' : '.');
}

export function basename(path: string, ext?: string): string {
  let base = path.substring(path.lastIndexOf('/') + 1);
  if (ext && base.endsWith(ext)) {
    base = base.substring(0, base.length - ext.length);
  }
  return base;
}

export function extname(path: string): string {
  const dot = path.lastIndexOf('.');
  const slash = path.lastIndexOf('/');
  return dot > slash ? path.substring(dot) : '';
}

export function normalize(path: string): string {
  const isAbsolute = path.charAt(0) === '/';
  const trailingSlash = path.substr(-1) === '/';

  path = normalizeArray(
    path.split('/').filter((p) => !!p),
    !isAbsolute,
  ).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
}

function normalizeArray(parts: string[], allowAboveRoot: boolean): string[] {
  const up = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === '..') {
      if (up.length && up[up.length - 1] !== '..') {
        up.pop();
      } else if (allowAboveRoot) {
        up.push('..');
      }
    } else if (p && p !== '.') {
      up.push(p);
    }
  }
  return up;
}

export default {
  sep,
  delimiter,
  join,
  resolve,
  relative,
  dirname,
  basename,
  extname,
  normalize,
};
