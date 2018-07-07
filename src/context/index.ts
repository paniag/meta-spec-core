import { Common } from '../common';
import { Util } from '../util';

export namespace Ctx {
  export interface Context {
    [prop: string]: any;
  }

  export function Build(value: any, constraint: any): contextRet {
    // TODO: Implement.
    return {
      context: null as Context,
      ctxConstraint: null as Common.Constraint,
      errors: [errorString('Build', 'not implemented')]
    }
  }

  interface contextRet {
    context: Context;
    ctxConstraint: Common.Constraint;
    errors: Common.Errors;
  }

  function errorString(name: string, message: string): string {
    return Util.ErrorString(message, { prefix: 'Ctx', name: name });
  }
}