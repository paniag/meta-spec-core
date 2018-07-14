export namespace Common {
  export interface Verdict {
    isValid: boolean,
    errors: errors
  }

  export function Valid(): Verdict {
    return { isValid: true, errors: [] }
  }

  export interface Constraints {
    [id: string]: Constraint;
  }

  export interface ConstraintMetas {
    [sort: string]: ConstraintMeta;
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
    sort: string;
  }

  export interface AnyConstraint extends BaseConstraint {
    constraints: Array<Constraint>;
  }

  export interface RefConstraint extends BaseConstraint {
    refID: string;
  }

  export interface ListConstraint extends BaseConstraint {
    of: Constraint;
  }

  export interface LiteralConstraint extends BaseConstraint {
    value: any;
  }

  export interface ObjectConstraint extends BaseConstraint {
    properties: Array<PropertyConstraint>;
    constraint: Constraint;
  }

  export interface PropertyConstraint extends BaseConstraint {
    name: string;
    constraint: Constraint;
  }

  export interface ConstraintMeta {
    validator?: ValidatorFunc;
  }

  export type ValidatorFunc = (value: any, constraint: any, validate: ValidatorFunc) => Verdict;

  interface errors extends Array<string | errors> { }
}