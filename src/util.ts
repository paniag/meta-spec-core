import { Common } from './common';

export namespace Util {
  export function ErrorString(message: string, opts?: errorOpts): string {
    const d1 = (typeof opts.prefix !== 'undefined' && typeof opts.name !== 'undefined')
      ? '.'
      : '';
    const d2 = (typeof opts.prefix !== 'undefined' || typeof opts.name !== 'undefined')
      ? ':'
      : '';
    if (typeof opts.prefix === 'undefined') {
      opts.prefix = '';
    }
    if (typeof opts.name === 'undefined') {
      opts.name = '';
    }
    return `${opts.prefix}${d1}${opts.name}${d2}${message}`;
  }

  export function Error(message: string, opts?: errorOpts): Common.Verdict {
    return {
      isValid: false,
      errors: [ErrorString(message, opts)]
    };
  }

  export function IsBasicType(value: any): boolean {
    return typeof value === 'boolean'
      || typeof value === 'number'
      || typeof value === 'string';
  }

  interface errorOpts {
    prefix?: string;
    name?: string;
  }
}