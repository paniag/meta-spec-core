import { Common } from '../common';
import { Util } from '../util';

export namespace Compiler {
  export function Run(ast: any): compilerRet {
    return {
      impl: null as any,
      errors: [errorString('Run', 'not implemented')]
    };
  }

  interface compilerRet {
    impl: any;  // TODO: Work out what the correct type is.
    errors: Common.Errors;
  }

  function errorString(name: string, message: string): string {
    return Util.ErrorString(message, { prefix: 'Compiler', name: name });
  }
}