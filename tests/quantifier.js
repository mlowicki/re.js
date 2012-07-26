test.eq(
  'a*',
  re.parse('a*'),
  {
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 0, to: Infinity, greedy: true, special: true}
  }
);
test.eq(
  'a*?',
  re.parse('a*?'),
  {
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 0, to: Infinity, greedy: false, special: true}
  }
);
test.eq(
  'a+',
  re.parse('a+'),
  {
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 1, to: Infinity, greedy: true, special: true}
  }
);
test.eq(
  'a+?',
  re.parse('a+?'),
  {
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 1, to: Infinity, greedy: false, special: true}
  }
);
test.eq(
  'a?',
  re.parse('a?'),
  {
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 0, to: 1, greedy: true, special: true}
  }
);
test.eq(
  'a??',
  re.parse('a??'),
  {
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 0, to: 1, greedy: false, special: true}
  }
);
test.eq(
  'a{2}',
  re.parse('a{2}'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 2, to: undefined, greedy: true}}
);
test.eq(
  'a{2}?',
  re.parse('a{2}?'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 2, to: undefined, greedy: false}}
);
test.eq(
  'a{2,}',
  re.parse('a{2,}'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 2, to: Infinity, greedy: true}}
);
test.eq(
  'a{2,}?',
  re.parse('a{2,}?'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 2, to: Infinity, greedy: false}}
);
test.eq(
  'a{2,3}',
  re.parse('a{2,3}'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 2, to: 3, greedy: true}}
);
test.eq(
  'a{11,33}',
  re.parse('a{11,33}'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 11, to: 33, greedy: true}}
);
test.eq(
  'a{2,3}?',
  re.parse('a{2,3}?'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 2, to: 3, greedy: false}}
);
test.eq(
  'a{',
  re.parse('a{'),
  {type: re.T_CONCAT, left: {type: re.T_CHAR, value: 'a'}, right: {type: re.T_CHAR, value: '{'}}
);
test.eq(
  'a{2,x',
  re.parse('a{,x'),
  {
    type: re.T_CONCAT,
    left: {type: re.T_CHAR, value: 'a'},
    right: {
      type: re.T_CONCAT,
      left: {type: re.T_CHAR, value: '{'},
      right: {
        type: re.T_CONCAT,
        left: {type: re.T_CHAR, value: ','},
        right: {type: re.T_CHAR, value: 'x'}
      }
    }
  }
);
test.eq(
  'a{2,3',
  re.parse('a{2,3'),
  {
    type: re.T_CONCAT,
    left: {type: re.T_CHAR, value: 'a'},
    right: {
      type: re.T_CONCAT,
      left: {type: re.T_CHAR, value: '{'},
      right: {
        type: re.T_CONCAT,
        left: {type: re.T_CHAR, value: '2'},
        right: {
          type: re.T_CONCAT,
          left: {type: re.T_CHAR, value: ','},
          right: {type: re.T_CHAR, value: '3'}
        }
      }
    }
  }
);
test.eq(
  'a{2,3[',
  re.parse('a{2,3]'),
  {
    type: re.T_CONCAT,
    left: {type: re.T_CHAR, value: 'a'},
    right: {
      type: re.T_CONCAT,
      left: {type: re.T_CHAR, value: '{'},
      right: {
        type: re.T_CONCAT,
        left: {type: re.T_CHAR, value: '2'},
        right: {
          type: re.T_CONCAT,
          left: {type: re.T_CHAR, value: ','},
          right: {
            type: re.T_CONCAT,
            left: {type: re.T_CHAR, value: '3'},
            right: {type: re.T_CHAR, value: ']'}
          }
        }
      }
    }
  }
);
test.throws(
  'a{2,1}',
  function() { re.parse('a{2,1}'); },
  SyntaxError,
  'Numbers out of order in quantifier'
);
