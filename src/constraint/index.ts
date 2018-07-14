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
    getConstraints() {
      return this.constraints;
    }
    getConstraintMetas() {
      return this.constraintMetas;
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
    getConstraintMeta(id: string): anyerrors {
      if (typeof this.constraintMetas[id] === 'undefined') {
        return {
          value: undefined,
          errors: [errorString('manager.getConstraintMeta', `there is no constraint with id '${id}'`)]
        };
      }
      return {
        value: this.constraintMetas[id],
        errors: []
      };
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