test.beginGroup('general');

test.eq(
  'empty',
  re.parse(''),
  {type: re.T_EMPTY}
);
test.eq(
  'a',
  re.parse('a'),
  {type: re.T_CHAR, value: 'a'}
);
test.eq(
  '#',
  re.parse('#'),
  {type: re.T_CHAR, value: '#'}
);
test.eq(
  'ab',
  re.parse('ab'),
  {type: re.T_CONCAT, left: {type: re.T_CHAR, value: 'a'}, right: {type: re.T_CHAR, value: 'b'}}
);
test.eq(
  '|',
  re.parse('|'),
  {type: re.T_OR, left: {type: re.T_EMPTY}, right: {type: re.T_EMPTY}}
);
test.eq(
  'a|b',
  re.parse('a|b'),
  {type: re.T_OR, left: {type: re.T_CHAR, value: 'a'}, right: {type: re.T_CHAR, value: 'b'}}
);
test.eq(
  '(a)',
  re.parse('(a)'),
  {type: re.T_GROUP, capturing: true, value: {type: re.T_CHAR, value: 'a'}}
);
test.eq(
  '(?:a)',
  re.parse('(?:a)'),
  {type: re.T_GROUP, capturing: false, value: {type: re.T_CHAR, value: 'a'}}
);

test.endGroup();
