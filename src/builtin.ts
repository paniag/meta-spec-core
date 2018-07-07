import { Common } from './common';
import deepEqual = require('deep-equal');
import { Util } from './util';

export namespace Builtin {
  export const Constraints: Common.Constraints = {
    any: {
      id: 'object',
      properties: [
        {
          id: 'property',
          name: 'id',
          constraint: 'any'
        },
        {
          id: 'property',
          name: 'constraints',
          constraint: {
            id: 'list',
            of: { ref: 'constraint' }
          }
        }
      ],
      objectLevelConstraint: ''
    },
    anything: { id: 'anything' },
    boolean: { id: 'boolean' },
    booleanRef: {
      id: 'literal',
      value: { ref: 'boolean' }
    },
    list: {
      id: 'object',
      properties: [
        {
          id: 'property',
          name: 'id',
          constraint: 'list'
        },
        {
          id: 'property',
          name: 'of',
          constraint: { ref: 'constraint' }
        }
      ],
      objectLevelConstraint: ''
    },
    literal: {
      id: 'object',
      properties: [
        {
          id: 'property',
          name: 'id',
          constraint: 'literal'
        },
        {
          id: 'property',
          name: 'value',
          constraint: { ref: 'anything' }
        }
      ],
      objectLevelConstraint: ''
    },
    null: {
      id: 'literal',
      value: null as any
    },
    number: { id: 'number' },
    numberRef: {
      id: 'literal',
      value: { ref: 'number' }
    },
    object: {
      id: 'object',
      properties: [
        {
          id: 'property',
          name: 'id',
          constraint: 'object'
        },
        {
          id: 'property',
          name: 'properties',
          constraint: {
            id: 'list',
            of: { ref: 'property' }
          }
        },
        {
          id: 'property',
          name: 'objectLevelConstraint',
          constraint: { ref: 'string' }
        }
      ],
      objectLevelConstraint: ''
    },
    property: {
      id: 'object',
      properties: [
        {
          id: 'property',
          name: 'id',
          constraint: 'property'
        },
        {
          id: 'property',
          name: 'name',
          constraint: { ref: 'string' }
        },
        {
          id: 'property',
          name: 'constraint',
          constraint: { ref: 'constraint' }
        }
      ],
      objectLevelConstraint: ''
    },
    ref: {
      id: 'object',
      properties: [
        {
          id: 'property',
          name: 'ref',
          constraint: { ref: 'string' }
        }
      ],
      objectLevelConstraint: ''
    },
    string: { id: 'string' },
    stringRef: {
      id: 'literal',
      value: { ref: 'string' }
    }
  };
  Constraints.constraint = {
    id: 'any',
    constraints: ((): Array<Common.Constraint> => {
      let cs: Array<Common.Constraint> = [];
      for (let id in Constraints) {
        cs.push(Constraints[id]);
      }
      return cs;
    })()
  };

  export const ConstraintMetas: Common.ConstraintMetas = {
    any: {
      validator: (value: any, constraint: any, validate: Common.ValidatorFunc): Common.Verdict => {
        const ret: Common.Verdict = { isValid: false, errors: [] };
        for (let c of constraint.constraints) {
          const iret = validate(value, c, validate);
          if (iret.isValid) {
            return iret;
          }
          ret.errors.push(
            errorString('anyValidator', `failed validation against constraint ${JSON.stringify(c)}`)
          );
          ret.errors.push(iret.errors);
        }
        return ret;
      }
    },
    anything: {
      validator: (value: any, constraint: any, validate: Common.ValidatorFunc): Common.Verdict => {
        return Common.Valid();
      }
    },
    boolean: { validator: builtinTypeValidator('boolean') },
    list: {
      validator: (value: any, constraint: any, validate: Common.ValidatorFunc): Common.Verdict => {
        if (!Array.isArray(value)) {
          return error('listValidator', 'value is not a list');
        }
        const ret = Common.Valid();
        for (let i in value) {
          const iret = validate(value[i], constraint.of, validate);
          if (!iret.isValid) {
            ret.isValid = false;
            ret.errors.push(
              errorString('listValidator', `index ${i} failed validation`)
            );
            ret.errors.push(iret.errors);
          }
        }
        return ret;
      }
    },
    literal: {
      validator: (value: any, constraint: any, validate: Common.ValidatorFunc): Common.Verdict => {
        if (!deepEqual(value, constraint.value)) {
          return error('literalValidator', JSON.stringify({
            got: value,
            want: constraint.value
          }));
        }
        return Common.Valid();
      }
    },
    number: { validator: builtinTypeValidator('number') },
    object: {
      validator: (value: any, constraint: any, validate: Common.ValidatorFunc): Common.Verdict => {
        if (typeof value !== 'object') {
          return error('objectValidator', 'value must be an object');
        }
        const ret = Common.Valid();
        for (let i in constraint.properties) {
          const iret = validate(value, constraint.properties[i], validate);
          if (!iret.isValid) {
            ret.isValid = false;
            ret.errors.push(
              errorString(
                'objectValidator',
                `property ${JSON.stringify(constraint.properties[i])} failed validation`
              )
            );
            ret.errors.push(iret.errors);
          }
        }
        // TODO: Validate object-level constraint.
        return ret;
      }
    },
    property: {
      validator: (value: any, constraint: any, validate: Common.ValidatorFunc): Common.Verdict => {
        if (typeof value !== 'object') {
          return error('propertyValidator', 'value must be an object');
        }
        if (value === null) {
          return error('propertyValidator', 'value is null');
        }
        if (typeof value[constraint.name] === 'undefined') {
          return error('propertyValidator', `value missing property '${constraint.name}'`);
        }
        const ret = validate(value[constraint.name], constraint.constraint, validate);
        if (!ret.isValid) {
          ret.errors = [
            errorString('propertyValidator', `property ${constraint.name} failed validation`),
            ret.errors
          ];
        }
        return ret;
      }
    },
    string: { validator: builtinTypeValidator('string') }
  };

  function builtinTypeValidator(id: string): Common.ValidatorFunc {
    return (value: any, constraint: any, validate: Common.ValidatorFunc): Common.Verdict => {
      if (typeof value !== id) {
        return error('builtinTypeValidator', `value is not a ${id}`);
      }
      return Common.Valid();
    }
  }

  function errorString(name: string, message: string): string {
    return Util.ErrorString(message, { prefix: 'builtin', name: name });
  }

  function error(name: string, message: string): Common.Verdict {
    return Util.Error(errorString(name, message));
  }
}