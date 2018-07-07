import { Common } from '../common';
import { Data } from './data-model';
import { Util } from '../util';

export namespace Type {
  export function Check(ast: any, model: Data.Model): Common.Verdict {
    // TODO: Implement.
    return error('Check', 'not implemented');
  }

  function errorString(name: string, message: string): string {
    return Util.ErrorString(message, { prefix: 'Type', name: name });
  }

  function error(name: string, message: string): Common.Verdict {
    return Util.Error(errorString(name, message));
  }
}