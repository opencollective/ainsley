import { fastClone, map, flat, combinations, toString } from "./utils";

export const iteratorRegex = /\{[a-z]+\}/gi;

// private constants
const _hyphenOrDigitRegex = /-|[^0-9]/g;
const _notUpperOrDigitRegex = /[^A-Z0-9]/g;

// private helpers
const _expandDeclaration = subpair => `${subpair[0]}:${subpair[1]}`;
const _addEmptyMod = mod => [["", ""]].concat(mod);
const _toCase = (s, upper) => s[`to${upper ? "Upp" : "Low"}erCase`]();
const _toPair = (input, isValue) => {
  if (typeof input === "number") {
    const str = toString(input);
    return [
      str.replace(_hyphenOrDigitRegex, match => (match === "-" ? "N" : "")),
      str
    ];
  } else {
    return [
      _toCase(input.replace(_notUpperOrDigitRegex, ""), isValue),
      _toCase(input, false)
    ];
  }
};

// parse smart map
export const parseSmartMap = (inputs, isValue) =>
  inputs.length
    ? map(inputs, input => _toPair(input, isValue))
    : map(Object.keys(inputs), key => [toString(key), toString(inputs[key])]);

// expand ainsley.defs
export const expandDefs = (ainsley, ruleSet) => {
  const pair = ruleSet[1].reduce(
    (iters, pair) => [
      iters[0].concat(toString(pair[0]).match(iteratorRegex) || []),
      iters[1].concat(toString(pair[1]).match(iteratorRegex) || [])
    ],
    [[], []]
  );

  return map(
    combinations(
      flat([
        map(pair[0], iter =>
          map(parseSmartMap(ainsley[iter]), pair => [iter, pair[0], pair[1]])
        ),
        map(pair[1], iter =>
          map(parseSmartMap(ainsley[iter], true), pair => [
            iter,
            pair[0],
            pair[1]
          ])
        )
      ])
    ),
    perm => {
      const clone = fastClone(ruleSet);
      for (let i = 0; clone[0].includes("&"); i++) {
        clone[0] = clone[0].replace("&", perm[i][1]);
      }
      for (let i = 0; i < clone[1].length; i++) {
        const decl = clone[1][i];
        while (perm.length > 0 && decl[0].includes(perm[0][0])) {
          const first = perm.shift();
          decl[0] = decl[0].replace(first[0], first[2]);
        }
      }
      for (let i = 0; i < clone[1].length; i++) {
        const decl = clone[1][i];
        while (perm.length > 0 && decl[1].includes(perm[0][0])) {
          const first = perm.shift();
          decl[1] = decl[1].replace(first[0], first[2]);
        }
      }
      return clone;
    }
  );
};

// expand ainsley.props
export const expandProps = pair => {
  const prop = parseSmartMap([pair[0]])[0];
  return map(parseSmartMap(pair[1], true), subpair => [
    `${prop[0]}${subpair[0]}`,
    [[prop[1], subpair[1]]]
  ]);
};

// compile ainsley to a simple stylesheet ast
export const ainsleyToAST = ainsley => {
  const ast = [].concat(
    flat(map(ainsley.defs || [], def => expandDefs(ainsley, def))),
    flat(map(ainsley.props || [], expandProps)),
    ainsley.raw || []
  );
  return (ainsley.reset ? [ainsley.reset] : []).concat(
    flat(
      map(combinations(map(ainsley.mods || [], _addEmptyMod)), comb =>
        comb.reduce((ast, pair) => {
          if (!pair[1]) {
            return ast;
          } else if (pair[1][0] === "@") {
            return [
              [
                pair[1],
                map(ast, subpair => [`${pair[0]}${subpair[0]}`, subpair[1]])
              ]
            ];
          } else {
            return map(ast, subpair => [
              `${pair[0]}${subpair[0]}${pair[1]}`,
              subpair[1]
            ]);
          }
        }, ast)
      )
    )
  );
};

export const ruleToCSS = rule => {
  if (typeof rule === "string") return rule;
  return rule[0][0] === "@"
    ? `${rule[0]}{${astToCSS(rule[1])}}`
    : `.${rule[0]}{${map(rule[1], _expandDeclaration).join(";")}}`;
};

// generate css from simple stylesheet ast
export const astToCSS = ast => map(ast, ruleToCSS).join("");

// generate css from ainsley
export const ainsleyToCSS = ainsley => astToCSS(ainsleyToAST(ainsley));

// insert ainsley into a dom
export const ainsleyInsert = (ainsley, stylesheet) => {
  const ast = ainsleyToAST(ainsley);
  for (let i = ast.length - 1; i >= 0; i--) {
    stylesheet.insertRule(ruleToCSS(ast[i]), 0);
  }
};
