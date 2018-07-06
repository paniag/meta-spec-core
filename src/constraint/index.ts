import { Builtin } from '../builtin';
import { Common } from '../common';

export namespace Constraint {
  export class Manager {
    constructor() {
      this.constraints = Builtin.Constraints;
      this.constraintMetas = Builtin.ConstraintMetas;
    }
    getConstraints() {
      return this.constraints;
    }
    getConstraintMetas() {
      return this.constraintMetas;
    }
    private constraints: Common.Constraints;
    private constraintMetas: Common.ConstraintMetas;
  }
}