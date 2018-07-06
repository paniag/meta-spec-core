import { hello } from '../src/validation';
import { expect } from 'chai';
import 'mocha';

describe('hello test', () => {
  it('return hello world', () => {
    expect(hello()).to.equal('Hello world!');
  });
});