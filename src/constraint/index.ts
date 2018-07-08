import { Builtin } from '../builtin';
import { Common } from '../common';

export namespace Constraint {
  export class Manager {
    constructor() {
      this.constraints = Builtin.Constraints;
      this.constraintMetas = Builtin.ConstraintMetas;
    }

    getConstraints(): Common.Constraints {
      return this.constraints;
    }

    getConstraint(id: string): constraintRet {
      if (!this.hasConstraint(id)) {
        return {
          constraint: null as Common.Constraint,
          errors: [errorString('Manager.getConstraint',
            `there is no constraint with id '${id}'`)]
        };
      }
      return {
        constraint: this.constraints[id],
        errors: []
      };
    }

    hasConstraint(id: string): boolean {
      return (typeof this.constraints !== 'undefined') &&
        (typeof this.constraints[id] !== 'undefined');
    }

    addConstraints(constraints: Common.Constraints): Common.Verdict {
      const ret = Common.Valid();
      for (let id in constraints) {
        if (this.hasConstraint(id)) {
          ret.isValid = false;
          ret.errors.push(
            errorString('Manager.addConstraints',
              `constraint with id '${id}' already exists: not adding any ` +
              'constraints')
          );
        }
      }
      if (!ret.isValid) {
        return ret;
      }

      for (let id in constraints) {
        this.constraints[id] = constraints[id];
      }
      return Common.Valid();
    }

    getConstraintMetas(): Common.ConstraintMetas {
      return this.constraintMetas;
    }

    getConstraintMeta(id: string): constraintMetaRet {
      if (!this.hasConstraintMeta(id)) {
        return {
          meta: null as Common.ConstraintMeta,
          errors: [errorString('Manager.getConstraintMeta',
            `there is no constraint meta with id '${id}'`)]
        };
      }
    }

    hasConstraintMeta(id: string): boolean {
      return (typeof this.constraintMetas !== 'undefined') &&
        (typeof this.constraintMetas[id] !== 'undefined');
    }

    addConstraintMetas(metas: Common.ConstraintMetas): Common.Verdict {
      const ret = Common.Valid();
      for (let id in metas) {
        if (!this.hasConstraint(id)) {
          ret.isValid = false;
          ret.errors.push(
            errorString('Manager.addConstraintMetas',
              `no constraint with id '${id}' exists: not adding any ` +
              'constraints')
          );
        }
        if (this.hasConstraintMeta(id)) {
          ret.isValid = false;
          ret.errors.push(
            errorString('Manager.addConstraintMetas',
              `constraint meta for id '${id}' already exists: not adding ` +
              'any constraints')
          );
        }
      }
      if (!ret.isValid) {
        return ret;
      }

      for (let id in metas) {
        this.constraintMetas[id] = metas[id];
      }
      return Common.Valid();
    }

    private constraints: Common.Constraints;
    private constraintMetas: Common.ConstraintMetas;
  }

  interface constraintRet {
    constraint: Common.Constraint;
    errors: Common.Errors;
  }

  interface constraintMetaRet {
    meta: Common.ConstraintMeta;
    errors: Common.Errors;
  }

  function errorString(name: string, message: string): string {
    return `Constraint.${name}: ${message}`;
  }
}