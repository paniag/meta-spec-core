import { Common } from '../common';
import { Data } from './data-model';
import P = require('parsimmon');
import { Util } from '../util';

export namespace Parser {
  export function Build(model: Data.Model): buildRet {
    return {
      parser: null as P.Parser<any>,
      errors: [errorString('Build', 'not implemented')]
    };
  }

  interface buildRet {
    parser: P.Parser<any>;
    errors: Common.Errors;
  }

  function errorString(name: string, message: string) {
    return Util.ErrorString(message, { prefix: 'Parser', name: name });
  }

  function error(name: string, message: string) {
    return Util.Error(errorString(name, message));
  }
}