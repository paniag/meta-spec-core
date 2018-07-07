import P = require('parsimmon');

import { Common } from '../common';
import { Compiler } from './compiler';
import { Data } from './data-model';
import { Parser } from './parser';
import { Type } from './type';
import { Util } from '../util';

export namespace QueryCombinator {
  // TODO: Add caching.
  export function BuildEngine(model: Data.Model): EngineRet {
    // - Derive a query combinator parser from the Data.Model.
    const { parser, errors } = Parser.Build(model);
    if (errors.length > 0) {
      return {
        engine: null as Engine,
        errors: errors
      };
    }
    // - Package result in an Engine and return it.
    return {
      engine: new Engine(parser, model),
      errors: []
    };
  }

  export class Engine {
    constructor(parser: P.Parser<any>, model: Data.Model) {
      this.parser = parser;
      this.model = model;
    }

    // TODO: Add caching.
    Run(value: any, query: string): EngineRunRet {
      // - Parse the query.
      const ast = this.parser.parse(query);
      // - Type check the query.
      let ret: Common.Verdict = Type.Check(ast, this.model);
      if (!ret.isValid) {
        ret.errors = [
          errorString('Run', `query '${query}' failed to type check`),
          ret.errors
        ];
        return {
          result: null as any,
          errors: ret.errors
        };
      }
      // - Compile the Object-Level Constraint to executable code.
      let { impl, errors } = Compiler.Run(ast);
      if (errors.length > 0) {
        errors = [
          errorString('Run', `compilation failed for query '${query}'`),
          errors
        ];
        return {
          result: null as any,
          errors: errors
        };
      }
      // - Evaluate the query against the value.
      return impl(value);
    }

    private model: Data.Model;
    private parser: P.Parser<any>;
  }

  export interface EngineRet {
    engine: Engine;
    errors: Common.Errors;
  }

  export interface EngineRunRet {
    result: any;  // TODO: Work out a better solution here, maybe with generics.
    errors: Common.Errors;
  }

  function errorString(name: string, message: string): string {
    return Util.ErrorString(message, { prefix: 'builtin', name: name });
  }
}