import { Common } from '../common';
import { Ctx } from '../context';
import { Data } from '../query-combinator/data-model';
import { Util } from '../util';
import { QueryCombinator } from '../query-combinator';
import { Constraint } from '.';

export namespace OLC {
  export function Validate(value: any, constraint: Common.ObjectConstraint): Common.Verdict {
    // Tasks
    //  - Construct the Context object and a Constraint describing it.
    let { context, ctxConstraint, errors } = Ctx.Build(value, constraint);
    if (errors.length > 0) {
      return error('Validate', 'failed to build context', { errors: errors });
    }
    //  - Validate the Context object against that Constraint(?)
    //  - Derive a Data.Model from that Constraint.
    let model: Data.Model;
    ({ model, errors } = buildModel(ctxConstraint));
    if (errors.length > 0) {
      return error('Validate', 'failed to build data model', { errors: errors });
    }
    //  - Build a QueryCombinator.Engine from the Data.Model.
    const engine = QueryCombinator.BuildEngine(model);
    //  - Evaluate the Object-Level Constraint on the Value using Engine.Run.
    let result: any;
    ({ result, errors } = engine.Run(value, constraint.objectLevelConstraint));
    if (errors.length > 0) {
      return error('Validate', 'query execution failed', { errors: errors });
    }
    //  - Success!
    return Common.Valid();
  }

  function buildModel(ctxConstraint: Common.Constraint): buildModelRet {
    function walk(cc: any, path: path, builder: Data.ModelBuilder): Common.Errors {
      // TODO: Handle boolean, number, or string literals for cc.
      if (typeof cc.id !== 'undefined' && typeof cc.ref !== 'undefined') {
        return [errorString('buildModel.walk', 'ctxConstraint has both id and ref set')];
      }
      if (typeof cc.ref !== 'undefined') {
        const domain: Data.Type = {
          id: path[path.length - 1].id,
          cardinality: <string>Constraint.Manager.getCardinality(path[path.length - 1].id).value
        };
        const codomain: Data.Type = {
          id: cc.ref,
          // TODO: Lookup 'ref' and handle the case that it has some other cardinality.
          cardinality: <string>Constraint.Manager.getCardinality(cc.ref).value
        };
        if (codomain.cardinality !== 'single') {
          codomain.innerType = {
            id: Constraint.Manager.getConstraintMeta(cc.ref).value
          };
        }
        builder.addRelationship({
          id: path[path.length - 1].name,
          type: {
            id: 'function',
            domain: domain,
            codomain: codomain
          }
        });
      }
      if (typeof cc.id === 'undefined') {
        return [errorString('buildModel.walk', 'ctxConstraint has neither id nor ref set')];
      }
      const { nextCtx, nextPath, errors } = handlers[cc.id](cc, path, builder);
      // TODO: Implement.
      return [errorString('buildModel.walk', 'not implemented')];
    }
    // TODO: Validate that ctxConstraint has value and constraint properties.
    // We will assume that the ctxConstraint.value satisfies ctxConstraint.constraint.
    const path: path = [];
    const builder = new Data.ModelBuilder();
    const errors = walk(ctxConstraint, path, builder);
    return {
      model: builder.getModel(),
      errors: errors
    };
  }

  interface buildModelRet {
    model: Data.Model;
    errors: Common.Errors;
  }

  const handlers: handlers = {};

  interface handlers {
    [id: string]: handler;
  }

  type handler = (cc: any, path: path, builder: Data.ModelBuilder) => handlerRet;

  interface handlerRet {
    nextCtx: any;
    nextPath: path;
    errors: Common.Errors;
  }

  type path = Array<pathEntry>;

  interface pathEntry {
    id: string;
    name: string;
  }

  function errorString(name: string, message: string): string {
    return Util.ErrorString(message, { prefix: 'OLC', name: name });
  }

  function error(name: string, message: string, opts?: Util.ErrorOpts): Common.Verdict {
    return Util.Error(errorString(name, message), opts);
  }
}