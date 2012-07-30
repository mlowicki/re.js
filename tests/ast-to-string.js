test.beginGroup('ast to string');

test.eq(
  'a',
  re.astToString({type: re.T_CHAR, value: 'a'}),
  'a'
);

test.eq(
  'ab',
  re.astToString({type: re.T_CONCAT, left: {type: re.T_CHAR, value: 'a'}, right: {type: re.T_CHAR, value: 'b'}}),
  'ab'
);

test.eq(
  'a|b',
  re.astToString({type: re.T_OR, left: {type: re.T_CHAR, value: 'a'}, right: {type: re.T_CHAR, value: 'b'}}),
  'a|b'
);

test.eq(
  'empty',
  re.astToString({type: re.T_EMPTY}),
  ''
);

test.eq(
  '.',
  re.astToString({type: re.T_DOT}),
  '.'
);

test.eq(
  '(a)',
  re.astToString({type: re.T_GROUP, capturing: true, value: {type: re.T_CHAR, value: 'a'}}),
  '(a)'
);

test.eq(
  '(?:a)',
  re.astToString({type: re.T_GROUP, capturing: false, value: {type: re.T_CHAR, value: 'a'}}),
  '(?:a)'
);

test.eq(
  '\\d',
  re.astToString({type: re.T_CCE, value: re.C_DIGIT}),
  '\\d'
);

test.eq(
  '\\D',
  re.astToString({type: re.T_CCE, value: re.C_NON_DIGIT}),
  '\\D'
);

test.eq(
  '\\w',
  re.astToString({type: re.T_CCE, value: re.C_WORD_CHAR}),
  '\\w'
);

test.eq(
  '\\W',
  re.astToString({type: re.T_CCE, value: re.C_NON_WORD_CHAR}),
  '\\W'
);

test.eq(
  '\\s',
  re.astToString({type: re.T_CCE, value: re.C_WHITESPACE}),
  '\\s'
);

test.eq(
  '\\S',
  re.astToString({type: re.T_CCE, value: re.C_NON_WHITESPACE}),
  '\\S'
);

test.eq(
  '\\5',
  re.astToString({type: re.T_DECIMAL_ESCAPE, value: 5}),
  '\\5'
);

test.eq(
  '\\n',
  re.astToString({type: re.T_CONTROL_ESCAPE, value: 'n'}),
  '\\n'
);

test.eq(
  '\\a',
  re.astToString({type: re.T_IDENTITY_ESCAPE, value: 'a'}),
  '\\a'
);

test.eq(
  '\\ca',
  re.astToString({type: re.T_CONTROL_LETTER, value: 'a'}),
  '\\ca'
);

test.eq(
  '\\xAA',
  re.astToString({type: re.T_HEX_ESCAPE, value: 'AA'}),
  '\\xAA'
);

test.eq(
  '\\uAAAA',
  re.astToString({type: re.T_UNICODE_ESCAPE, value: 'AAAA'}),
  '\\uAAAA'
);

test.eq(
  '^',
  re.astToString({type: re.T_ASSERT, value: '^'}),
  '^'
);

test.eq(
  '$',
  re.astToString({type: re.T_ASSERT, value: '$'}),
  '$'
);

test.eq(
  '\\b',
  re.astToString({type: re.T_ASSERT, value: '\\b'}),
  '\\b'
);

test.eq(
  '\\B',
  re.astToString({type: re.T_ASSERT, value: '\\B'}),
  '\\B'
);

test.eq(
  '(?=a)',
  re.astToString({type: re.T_ASSERT, value: '?=', tester: {type: re.T_CHAR, value: 'a'}}),
  '(?=a)'
);

test.eq(
  '(?!a)',
  re.astToString({type: re.T_ASSERT, value: '?!', tester: {type: re.T_CHAR, value: 'a'}}),
  '(?!a)'
);

test.eq(
  '[a]',
  re.astToString({type: re.T_CHAR_CLASS, negated: false, value: {type: re.T_CHAR, value: 'a'}}),
  '[a]'
);

test.eq(
  '[^a]',
  re.astToString({type: re.T_CHAR_CLASS, negated: true, value: {type: re.T_CHAR, value: 'a'}}),
  '[^a]'
);

test.eq(
  '[a-z]',
  re.astToString({
    type: re.T_CHAR_CLASS,
    negated: false,
    value: {
      type: re.T_RANGE,
      from: {type: re.T_CHAR, value: 'a'},
      to: {type: re.T_CHAR, value: 'z'}
    }
  }),
  '[a-z]'
);

test.eq(
  'a?',
  re.astToString({
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 0, to: 1, special: true, greedy: true}
  }),
  'a?'
);

test.eq(
  'a*',
  re.astToString({
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 0, to: Infinity, special: true, greedy: true}
  }),
  'a*'
);

test.eq(
  'a+',
  re.astToString({
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 1, to: Infinity, special: true, greedy: true}
  }),
  'a+'
);

test.eq(
  'a+?',
  re.astToString({
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 1, to: Infinity, special: true, greedy: false}
  }),
  'a+?'
);

test.eq(
  'a{2}',
  re.astToString({
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 2, special: false, greedy: true}
  }),
  'a{2}'
);

test.eq(
  'a{2,4}',
  re.astToString({
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 2, to: 4, special: false, greedy: true}
  }),
  'a{2,4}'
);

test.eq(
  'a{2,}',
  re.astToString({
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 2, to: Infinity, special: false, greedy: true}
  }),
  'a{2,}'
);

test.eq(
  'a{2,}?',
  re.astToString({
    type: re.T_REPEAT,
    atom: {type: re.T_CHAR, value: 'a'},
    quantifier: {from: 2, to: Infinity, special: false, greedy: false}
  }),
  'a{2,}?'
);

test.endGroup();
