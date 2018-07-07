import P = require('parsimmon');

import { Builtin } from '../builtin';
import { Common } from '../common';
import { Data } from './data-model';
import { Util } from '../util';

export namespace Parser {
  export function Build(model: Data.Model): P.Parser<any> {
    const relationshipIDs: Array<string> = [];
    for (let id in model.relationships) {
      relationshipIDs.push(id);
    }
    const attributeIDs: Array<string> = [];
    for (let id in model.attributes) {
      attributeIDs.push(id);
    }
    const combinators = Builtin.Combinators;

    const _ = (x: string) => P.string(x).trim(P.optWhitespace);
    const lang = P.createLanguage({
      ArgExp: (r) => P.alt(r.BoundQuery, r.Query),
      Arrow: (r) => P.alt(...attributeIDs.map(_), ...relationshipIDs.map(_)),
      BoundQuery: (r) => P.seqMap(r.NameBinding, _('=>'), r.Query,
        (a, b, c) => [a, c]),
      Combinator: (r) => P.alt(...combinators.map(_)),
      CombinatorCall: (r) => P.seqMap(
        r.Combinator, _('('), r.ArgExp, P.seq(_(','), r.ArgExp).many(), _(')'),
        (combinator: astNode, open: string, arg1: any, args: Array<Array<any>>, close: string) => {
          return {
            id: 'CombinatorCall',
            combinator: combinator.name,
            args: [arg1, ...args.map(argk => argk[1])]
          };
        }),
      CombinatorExp: (r) => P.alt(r.CombinatorCall, r.Arrow, r.Combinator,
        r.NameReference, r.Number),
      Identifier: (r) => P.regex(/[a-zA-Z][a-zA-Z0-9_]*/),
      NameBinding: (r) => r.Identifier,
      NameReference: (r) => r.Identifier,
      Number: (r) => P.regex(/([1-9][0-9]*|0)(\.[0-9]*)?/),
      Pipeline: (r) => P.seqMap(
        r.CombinatorExp,
        P.seq(_(':'), r.CombinatorExp).atLeast(1),
        (first, rest) => {
          return rest.reduce((acc, ch) => {
            let [op, another] = ch;
            if (another !== null && typeof another.id !== 'undefined') {
              if (another.id === 'CombinatorCall') {
                another.args = [
                  acc,
                  ...another.args
                ];
                return another;
              }
              if (another.id === 'Combinator') {
                return {
                  id: 'CombinatorCall',
                  combinator: another.name,
                  args: [acc]
                };
              }
            }
            return [acc, another];
          }, first);
        }),
      Query: (r) => P.alt(r.Pipeline, r.CombinatorExp),
    });

    const labels = [
      'Arrow',
      'Combinator',
      'BoundQuery',
      'NameBinding',
      'NameReference'
    ];
    for (let lbl of labels) {
      lang[lbl] = lang[lbl].node(lbl).map(strip);
    }

    return lang.Query;
  }

  interface astNode {
    id: string;
    name: any;
  }

  function strip<T extends string>(node: P.Node<T, any>): astNode {
    return {
      id: <string>node.name,
      name: node.value
    };
  }

  function errorString(name: string, message: string) {
    return Util.ErrorString(message, { prefix: 'Parser', name: name });
  }

  function error(name: string, message: string) {
    return Util.Error(errorString(name, message));
  }
}