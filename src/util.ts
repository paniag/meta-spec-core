import { Common } from './common';

export namespace Util {
  export function ErrorString(message: string, opts?: ErrorOpts): string {
    const d1 = (typeof opts !== 'undefined' &&
      typeof opts.prefix !== 'undefined' &&
      typeof opts.name !== 'undefined')
      ? '.'
      : '';
    const d2 = (typeof opts !== 'undefined' &&
      (typeof opts.prefix !== 'undefined' ||
        typeof opts.name !== 'undefined'))
      ? ':'
      : '';
    if (typeof opts === 'undefined') {
      opts = {};
    }
    if (typeof opts.prefix === 'undefined') {
      opts.prefix = '';
    }
    if (typeof opts.name === 'undefined') {
      opts.name = '';
    }
    return `${opts.prefix}${d1}${opts.name}${d2}${message}`;
  }

  export function Error(message: string, opts?: ErrorOpts): Common.Verdict {
    const errors: Common.Errors = [ErrorString(message, opts)];
    if (typeof opts !== 'undefined' && typeof opts.errors !== 'undefined') {
      errors.push(opts.errors);
    }
    return {
      isValid: false,
      errors: errors
    };
  }

  export function IsBasicType(value: any): boolean {
    return typeof value === 'boolean'
      || typeof value === 'number'
      || typeof value === 'string';
  }

  export interface ErrorOpts {
    prefix?: string;
    name?: string;
    errors?: Common.Errors;
  }
}