check.group('General');
check.eq(
  'empty',
  re.parse(''),
  {type: re.T_EMPTY}
);
check.eq(
  'a',
  re.parse('a'),
  {type: re.T_CHAR, value: 'a'}
);
check.eq(
  '#',
  re.parse('#'),
  {type: re.T_CHAR, value: '#'}
);
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
  '(a)',
  re.parse('(a)'),
  {type: re.T_GROUP, capturing: true, value: {type: re.T_CHAR, value: 'a'}}
);
check.eq(
  '(?:a)',
  re.parse('(?:a)'),
  {type: re.T_GROUP, capturing: false, value: {type: re.T_CHAR, value: 'a'}}
);
