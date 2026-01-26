// Browser polyfill for util module

export function format(f: string, ...args: any[]): string {
  let i = 0;
  return f.replace(/%[sdj%]/g, (x) => {
    if (i >= args.length) return x;
    switch (x) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return Number(args[i++]).toString();
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
}

export function inspect(obj: any, options?: any): string {
  return JSON.stringify(obj, null, 2);
}

export function isArray(arg: any): arg is any[] {
  return Array.isArray(arg);
}

export function isFunction(arg: any): arg is Function {
  return typeof arg === 'function';
}

export function isString(arg: any): arg is string {
  return typeof arg === 'string';
}

export function isNumber(arg: any): arg is number {
  return typeof arg === 'number';
}

export function isObject(arg: any): arg is object {
  return typeof arg === 'object' && arg !== null;
}

export function isNull(arg: any): arg is null {
  return arg === null;
}

export function isUndefined(arg: any): arg is undefined {
  return arg === undefined;
}

export function inherits(ctor: Function, superCtor: Function): void {
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
}

export default {
  format,
  inspect,
  isArray,
  isFunction,
  isString,
  isNumber,
  isObject,
  isNull,
  isUndefined,
  inherits,
};
