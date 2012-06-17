check.eq('empty', re.parse(''), {type: re.T_EMPTY});
check.eq('single character', re.parse('a'), {type: re.T_CHAR, value: 'a'});
check.eq(
  'ab',
  re.parse('ab'),
  {type: re.T_CONCAT, left: {type: re.T_CHAR, value: 'a'}, right: {type: re.T_CHAR, value: 'b'}}
);
check.eq(
  '|',
  re.parse('|'),
  {type: re.T_OR, left: {type: re.T_EMPTY}, right: {type: re.T_EMPTY}}
);
check.eq(
  'a|b',
  re.parse('a|b'),
  {type: re.T_OR, left: {type: re.T_CHAR, value: 'a'}, right: {type: re.T_CHAR, value: 'b'}}
);
check.eq(
  '"{" treated verbatim',
  re.parse('{'),
  {type: re.T_CHAR, value: '{'}
);
check.eq(
  '"}" treated verbatim',
  re.parse('}'),
  {type: re.T_CHAR, value: '}'}
);
check.eq(
  '"]" treated verbatim',
  re.parse(']'),
  {type: re.T_CHAR, value: ']'}
);
check.eq(
  '(a)',
  re.parse('(a)'),
  {type: re.T_GROUP, capturing: true, value: {type: re.T_CHAR, value: 'a'}}
)
check.eq(
  '(?:a)',
  re.parse('(?:a)'),
  {type: re.T_GROUP, capturing: false, value: {type: re.T_CHAR, value: 'a'}}
)
check.eq(
  '[a]',
  re.parse('[a]'),
  {type: re.T_CHAR_CLASS, negated: false, value: {type: re.T_CHAR, value: 'a'}}
);
check.eq(
  '[^a]',
  re.parse('[^a]'),
  {type: re.T_CHAR_CLASS, negated: true, value: {type: re.T_CHAR, value: 'a'}}
);
check.eq(
  '[ab]',
  re.parse('[ab]'),
  {
    type: re.T_CHAR_CLASS,
    negated: false,
    value: {type: re.T_CONCAT, left: {type: re.T_CHAR, value: 'a'}, right: {type: re.T_CHAR, value: 'b'}}
  }
);

// Quantifiers
check.eq(
  'a*',
  re.parse('a*'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 0, to: Infinity, greedy: true}}
);
check.eq(
  'a*?',
  re.parse('a*?'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 0, to: Infinity, greedy: false}}
);
check.eq(
  'a+',
  re.parse('a+'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 1, to: Infinity, greedy: true}}
);
check.eq(
  'a+?',
  re.parse('a+?'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 1, to: Infinity, greedy: false}}
);
check.eq(
  'a?',
  re.parse('a?'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 0, to: 1, greedy: true}}
);
check.eq(
  'a??',
  re.parse('a??'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 0, to: 1, greedy: false}}
);
check.eq(
  'a{2}',
  re.parse('a{2}'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 2, to: undefined, greedy: true}}
);
check.eq(
  'a{2}?',
  re.parse('a{2}?'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 2, to: undefined, greedy: false}}
);
check.eq(
  'a{2,}',
  re.parse('a{2,}'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 2, to: Infinity, greedy: true}}
);
check.eq(
  'a{2,}?',
  re.parse('a{2,}?'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 2, to: Infinity, greedy: false}}
);
check.eq(
  'a{2,3}',
  re.parse('a{2,3}'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 2, to: 3, greedy: true}}
);
check.eq(
  'a{11,33}',
  re.parse('a{11,33}'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 11, to: 33, greedy: true}}
);
check.eq(
  'a{2,3}?',
  re.parse('a{2,3}?'),
  {type: re.T_REPEAT, atom: {type: re.T_CHAR, value: 'a'}, quantifier: {from: 2, to: 3, greedy: false}}
);
check.eq(
  'a{',
  re.parse('a{'),
  {type: re.T_CONCAT, left: {type: re.T_CHAR, value: 'a'}, right: {type: re.T_CHAR, value: '{'}}
);
check.eq(
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
check.eq(
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
check.eq(
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
