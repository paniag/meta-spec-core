import { Common } from '../common';
import { Constraint } from '../constraint';
import { IsBasicType } from './util';

export class Validator {
  constructor() {
    this.constraintManager = new Constraint.Manager();
    this.defaultValidator = ((self) => {
      return (v: any, c: any, f: Common.ValidatorFunc): Common.Verdict => {
        return self.validateImpl(v, c);
      };
    })(this);
  }

  Validate(value: any, constraint: any): Common.Verdict {
    // Validate constraint.
    const constraintDef = this.constraintManager.getConstraints().constraint;
    const ret = this.validateImpl(constraint, constraintDef);
    if (!ret.isValid) {
      ret.errors = [
        errorString('Validate', 'constraint failed validation'),
        ret.errors
      ];
      return ret;
    }
    // Validate value.
    return this.validateImpl(value, constraint);
  }

  private constraintManager: Constraint.Manager;
  private defaultValidator: Common.ValidatorFunc;

  private validateImpl(value: any, constraint: any): Common.Verdict {
    // constraint must be defined.
    if (typeof constraint === 'undefined') {
      return error('validateImpl', 'constraint is undefined');
    }
    // Handle constraints that are literals of simple type.
    if (typeof constraint === 'boolean' ||
      typeof constraint === 'number' ||
      typeof constraint === 'string') {
      if (value !== constraint) {
        return error('validateImpl',
          `constraint literal not matched ${JSON.stringify({
            got: value,
            want: constraint
          })}`);
      }
      return Common.Valid();
    }
    // constraint can only be boolean, number, string, or object, so if it's not
    // object by this point, the constraint is invalid.
    if (typeof constraint !== 'object') {
      return error('validateImpl', 'typeof constraint must be boolean, number, ' +
        `string, or object (got ${typeof constraint})`)
    }
    // null is an object, so we handle the possibility of a null literal
    // constraint here.
    if (constraint === null) {
      if (value !== null) {
        return error('validateImpl', 'value is not null');
      }
      return Common.Valid();
    }
    if (typeof constraint.sort === 'undefined') {
      return error('validateImpl', `constraint is missing 'sort' field`);
    }
    // The 'ref' sort is a special case we handle here to avoid needing
    // to get at this.constraintManager.getConstraints() from builtin.ts.
    if (constraint.sort === 'ref') {
      const constraints = this.constraintManager.getConstraints();
      return this.validateImpl(value, constraints[constraint.ref]);
    }
    // Delegate to the constraint's validator.
    const validator = this.getValidator(constraint.sort);
    return validator(value, constraint, this.defaultValidator);
  }

  private getValidator(sort: string): Common.ValidatorFunc {
    const metas = this.constraintManager.getConstraintMetas();
    if (typeof metas[sort] === 'undefined') {
      return this.defaultValidator;
    }
    if (typeof metas[sort].validator === 'undefined') {
      return this.defaultValidator;
    }
    return metas[sort].validator;
  }
}

function errorString(name: string, message: string): string {
  return `validation.${name}: ${message}`;
}

function error(name: string, message: string): Common.Verdict {
  return { isValid: false, errors: [errorString(name, message)] };
}