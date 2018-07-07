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
    private constraints: Common.Constraints;
    private constraintMetas: Common.ConstraintMetas;
  }

  export const Manager = Object.freeze(new manager());
}