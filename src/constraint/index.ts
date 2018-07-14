import { Builtin } from '../builtin';
import { Common } from '../common';

export namespace Constraint {
  class manager {
    constructor() {
      if (!manager.instance) {
        this.constraints = Builtin.Constraints;
        this.constraintMetas = Builtin.ConstraintMetas;
        manager.instance = this;
      }
      return manager.instance;
    }

    static instance: manager;

    getConstraints(): Common.Constraints {
      return this.constraints;
    }

    hasConstraint(id: string): boolean {
      return (typeof this.constraints !== 'undefined') &&
        (typeof this.constraints[id] !== 'undefined');
    }

    getConstraint(id: string): anyerrors {
      if (typeof this.constraints[id] !== 'undefined') {
        return {
          value: this.constraints[id],
          errors: []
        };
      }
      return {
        value: undefined,
        errors: [errorString('manager.getConstraint', `there is no constraint with id '${id}'`)]
      };
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

    getConstraintMeta(id: string): anyerrors {
      if (!this.hasConstraintMeta(id)) {
        return {
          value: null,
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

    getCardinality(id: string): anyerrors { // Returns a string in the value field.
      const meta = this.getConstraintMeta(id).value;
      if (typeof meta.cardinality === 'undefined') {
        return {
          value: null as any,
          errors: [errorString('manager.getCardinality', `id '${id}' has no cardinality`)]
        };
      }
      return {
        value: meta.cardinality,
        errors: []
      };
    }

    getValidator(id: string): anyerrors { // Returns a Common.ValidatorFunc in the value field.
      const meta = this.getConstraintMeta(id).value;
      if (typeof meta.validator === 'undefined') {
        return {
          value: null as any,
          errors: [errorString('manager.getValidator', `id '${id}' has no validator`)]
        };
      }
      return {
        value: meta.validator,
        errors: []
      };
    }

    private constraints: Common.Constraints;
    private constraintMetas: Common.ConstraintMetas;
  }

  export const Manager = Object.freeze(new manager());

  interface anyerrors {
    value: any;
    errors: Common.Errors;
  }

  function errorString(name: string, message: string): string {
    return `Constraint.${name}: ${message}`;
  }
}