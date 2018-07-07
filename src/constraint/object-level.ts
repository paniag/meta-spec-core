import { Common } from '../common';
import { Ctx } from '../context';
import { Data } from '../query-combinator/data-model';
import { Util } from '../util';
import { QueryCombinator } from '../query-combinator';

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
    // TODO: Implement.
    return {
      model: null as Data.Model,
      errors: [errorString('buildModel', 'not implemented')]
    };
  }

  interface buildModelRet {
    model: Data.Model;
    errors: Common.Errors;
  }

  function errorString(name: string, message: string): string {
    return Util.ErrorString(message, { prefix: 'OLC', name: name });
  }

  function error(name: string, message: string, opts?: Util.ErrorOpts): Common.Verdict {
    return Util.Error(errorString(name, message), opts);
  }
}