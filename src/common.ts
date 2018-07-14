export namespace Common {
  export interface Verdict {
    isValid: boolean,
    errors: Errors
  }

  export interface Errors extends Array<string | Errors> { }

  export function Valid(): Verdict {
    return { isValid: true, errors: [] }
  }

  export interface Constraints {
    [id: string]: Constraint;
  }

  export type Constraint =
    boolean
    | number
    | string
    | AnyConstraint
    | BaseConstraint
    | RefConstraint
    | ListConstraint
    | LiteralConstraint
    | ObjectConstraint
    | PropertyConstraint;

  export interface BaseConstraint {
    id?: string;
    ref?: string;
  }

  export interface AnyConstraint extends BaseConstraint {
    constraints: Array<Constraint>;
  }

  export interface RefConstraint extends BaseConstraint {
    ref: string;
  }

  export interface ListConstraint extends BaseConstraint {
    of: Constraint;
  }

  export interface LiteralConstraint extends BaseConstraint {
    value: any;
  }

  export interface ObjectConstraint extends BaseConstraint {
    properties: Array<PropertyConstraint>;
    objectLevelConstraint: string;
  }

  export interface PropertyConstraint extends BaseConstraint {
    name: string;
    constraint: Constraint;
  }

  export interface ConstraintMetas {
    [id: string]: ConstraintMeta;
  }

  export interface ConstraintMeta {
    cardinality: string;
    innerProp?: string;
    validator?: ValidatorFunc;
  }

  export type ValidatorFunc = (value: any, constraint: any, validate: ValidatorFunc) => Verdict;
}