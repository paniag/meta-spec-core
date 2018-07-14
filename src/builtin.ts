import { Common } from './common';
import deepEqual = require('deep-equal');
import { Util } from './util';

export namespace Builtin {
  const constraints: Array<Common.Constraint> = [
    {
      id: 'builtin/constraint/any',
      sort: 'object',
      properties: [
        {
          sort: 'property',
          name: 'sort',
          constraint: 'any'
        },
        {
          sort: 'property',
          name: 'constraints',
          constraint: {
            sort: 'list',
            of: { sort: 'ref', refID: 'builtin/constraint/any' }
          }
        }
      ],
      objectLevelConstraint: ''
    },
    {
      id: 'builtin/constraint/anything',
      sort: 'anything'
    },
    {
      id: 'builtin/constraint/boolean',
      sort: 'boolean'
    },
    {
      id: 'builtin/constraint/ref',
      sort: 'object',
      properties: [
        {
          sort: 'property',
          name: 'sort',
          constraint: 'ref'
        },
        {
          sort: 'property',
          name: 'refID',
          constraint: { sort: 'ref', refID: 'builtin/constraint/string' }
        }
      ],
      constraint: null as Common.Constraint
    },
    {
      id: 'builtin/constraint/list',
      sort: 'object',
      properties: [
        {
          sort: 'property',
          name: 'sort',
          constraint: 'list'
        },
        {
          sort: 'property',
          name: 'of',
          constraint: { sort: 'ref', refID: 'builtin/constraint/constraint' }
        }
      ],
      objectLevelConstraint: ''
    },
    {
      id: 'builtin/constraint/literal',
      sort: 'object',
      properties: [
        {
          sort: 'property',
          name: 'sort',
          constraint: 'literal'
        },
        {
          sort: 'property',
          name: 'value',
          constraint: { sort: 'ref', refID: 'builtin/constraint/anything' }
        }
      ],
      objectLevelConstraint: ''
    },
    {
      // TODO: Test if this constraint does anything or if null is hard coded
      //  in all cases.
      id: 'builtin/constraint/null',
      sort: 'literal',
      value: null as any
    },
    {
      id: 'builtin/constraint/number',
      sort: 'number'
    },
    {
      id: 'builtin/constraint/object',
      sort: 'object',
      properties: [
        {
          sort: 'property',
          name: 'sort',
          constraint: 'object'
        },
        {
          sort: 'property',
          name: 'properties',
          constraint: {
            sort: 'list',
            of: { sort: 'ref', refID: 'builtin/constraint/property' }
          }
        },
        {
          id: 'property',
          name: 'objectLevelConstraint',
          constraint: { sort: 'ref', refID: 'builtin/constraint/string' }
        }
      ],
      objectLevelConstraint: ''
    },
    {
      id: 'builtin/constraint/property',
      sort: 'object',
      properties: [
        {
          sort: 'property',
          name: 'sort',
          constraint: 'property'
        },
        {
          sort: 'property',
          name: 'name',
          constraint: { sort: 'ref', refID: 'builtin/constraint/string' }
        },
        {
          sort: 'property',
          name: 'constraint',
          constraint: { sort: 'ref', refID: 'builtin/constraint/constraint' }
        }
      ],
      objectLevelConstraint: ''
    },
    {
      id: 'builtin/constraint/string',
      sort: 'string'
    },
  ];
  constraints.push({
    id: 'builtin/constraint/constraint',
    sort: 'any',
    constraints: constraints
  });
  export const Constraints: Common.Constraints = (() => {
    const cs: Common.Constraints = {};
    for (let c of constraints) {
      let a = <Common.BaseConstraint>c;
      cs[a.id] = a;
    }
    return cs;
  })();

  export const ConstraintMetas: Common.ConstraintMetas = {
    any: {
      cardinality: 'single',
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
      cardinality: 'single',
      validator: (value: any, constraint: any, validate: Common.ValidatorFunc): Common.Verdict => {
        return Common.Valid();
      }
    },
    boolean: {
      cardinality: 'single',
      validator: builtinTypeValidator('boolean')
    },
    list: {
      cardinality: 'Seq',
      innerProp: 'of',
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
      cardinality: 'single',
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
    number: {
      cardinality: 'single',
      validator: builtinTypeValidator('number')
    },
    object: {
      cardinality: 'single',
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
      cardinality: 'single',
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
    string: {
      cardinality: 'single',
      validator: builtinTypeValidator('string')
    }
  };

  export const Combinators: Array<string> = [
    'around',
    'all',
    'any',
    'asc',
    'before',
    'connect',
    'count',
    'define',
    'desc',
    'exists',
    'filter',
    'frame',
    'given',
    'group',
    'max',
    'min',
    'rollup',
    'select',
    'sort',
    'sum',
    'take',
    'unique'
  ];

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