import deepEqual = require('deep-equal');
import { Common } from '../src/common';
import { Validator } from '../src/validation';
import { expect } from 'chai';
import 'mocha';

interface testCase {
  name: string;
  value: any;
  constraint: any;
  isValid: boolean;
}

let test_cases: Array<testCase> = [
  {
    name: 'undefined value',
    value: undefined,
    constraint: { ref: 'string' },
    isValid: false
  },
  {
    name: 'null',
    value: null,
    constraint: null,
    isValid: true
  },
  {
    name: 'null for boolean',
    value: null,
    constraint: { ref: 'boolean' },
    isValid: false
  },
  {
    name: 'null for number',
    value: null,
    constraint: { ref: 'number' },
    isValid: false
  },
  {
    name: 'null for string',
    value: null,
    constraint: { ref: 'string' },
    isValid: false
  },
  {
    name: 'null Constraint',
    value: null,
    constraint: { ref: 'constraint' },
    isValid: true
  },
  {
    name: 'number for null',
    value: 3,
    constraint: null,
    isValid: false
  },
  {
    name: 'number for boolean',
    value: 3,
    constraint: { ref: 'boolean' },
    isValid: false
  },
  {
    name: 'number',
    value: 3,
    constraint: 3,
    isValid: true
  },
  {
    name: '3 for "three"',
    value: 3,
    constraint: "three",
    isValid: false
  },
  {
    name: 'number literal',
    value: 42,
    constraint: {
      id: 'literal',
      value: 42
    },
    isValid: true
  },
  {
    name: 'object literal',
    value: {
      foo: 3,
      bar: {
        baz: ["quux", "zyzzyx"]
      }
    },
    constraint: {
      id: 'literal',
      value: {
        foo: 3,
        bar: {
          baz: ["quux", "zyzzyx"]
        }
      }
    },
    isValid: true
  },
  {
    name: 'Scout (valid)',
    value: { name: 'Scout', age: 4 },
    constraint: {
      id: 'object',
      properties: [
        {
          id: 'property',
          name: 'name',
          constraint: { ref: 'string' }
        },
        {
          id: 'property',
          name: 'age',
          constraint: { ref: 'number' }
        }
      ],
      constraint: null as Common.Constraint
    },
    isValid: true
  },
  {
    name: 'Scout (invalid)',
    value: { name: 'Scout', age: 'four' },
    constraint: {
      id: 'object',
      properties: [
        {
          id: 'property',
          name: 'name',
          constraint: { ref: 'string' }
        },
        {
          id: 'property',
          name: 'age',
          constraint: { ref: 'number' }
        }
      ],
      constraint: null as Common.Constraint
    },
    isValid: false
  }
];

const validator = new Validator();

describe('deepEqual', () => {
  it('returns true for deepEqual(42,42)', () => {
    const val = 42;
    const lit = { id: 'literal', value: 42 };
    expect(deepEqual(val, lit.value)).to.equal(true);
  });
});

describe('Validate function', () => {
  for (let i in test_cases) {
    const tc = test_cases[i];
    it(tc.name, () => {
      const ret = validator.Validate(tc.value, tc.constraint);
      if (ret.isValid != tc.isValid) {
        console.log(`Test FAILED ${i} ${tc.name}`);
        console.log(`  value: ${JSON.stringify(tc.value)}`);
        console.log(`  constraint: ${JSON.stringify(tc.constraint)}`);
        console.log(`  ret: ${JSON.stringify(ret)}`);
        console.log(`  ${JSON.stringify({ got: ret.isValid, want: tc.isValid })}`);
      } else {
        console.log(`Test PASSED ${i} ${tc.name}`);
      }
      expect(ret.isValid).to.equal(tc.isValid);
    });
  }
});