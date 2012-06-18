check.eq(
  '^',
  re.parse('^'),
  { type: re.T_ASSERT, value: '^' }
);
check.eq(
  '^a',
  re.parse('^a'),
  { type: re.T_CONCAT, left: { type: re.T_ASSERT, value: '^' }, right: { type: re.T_CHAR, value: 'a' } }
);
check.eq(
  '$',
  re.parse('$'),
  { type: re.T_ASSERT, value: '$' }
);
check.eq(
  'a$',
  re.parse('a$'),
  { type: re.T_CONCAT, left: { type: re.T_CHAR, value: 'a' }, right: { type: re.T_ASSERT, value: '$' } }
);
check.eq(
  '\\b',
  re.parse('\\b'),
  { type: re.T_ASSERT, value: '\\b' }
);
check.eq(
  '\\ba',
  re.parse('\\ba'),
  { type: re.T_CONCAT, left: { type: re.T_ASSERT, value: '\\b' }, right: { type: re.T_CHAR, value: 'a' } }
);
check.eq(
  '\\Ba',
  re.parse('\\Ba'),
  { type: re.T_CONCAT, left: { type: re.T_ASSERT, value: '\\B' }, right: { type: re.T_CHAR, value: 'a' } }
);
check.eq(
  '(?=a)',
  re.parse('(?=a)'),
  { type: re.T_ASSERT, value: '?=', tester: { type: re.T_CHAR, value: 'a' } }
);
check.eq(
  '(?!a)',
  re.parse('(?!a)'),
  { type: re.T_ASSERT, value: '?!', tester: { type: re.T_CHAR, value: 'a' } }
);
