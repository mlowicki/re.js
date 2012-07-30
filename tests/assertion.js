test.beginGroup('assertion');

test.eq(
  '^',
  re.parse('^'),
  { type: re.T_ASSERT, value: '^' }
);
test.eq(
  '^a',
  re.parse('^a'),
  { type: re.T_CONCAT, left: { type: re.T_ASSERT, value: '^' }, right: { type: re.T_CHAR, value: 'a' } }
);
test.eq(
  '$',
  re.parse('$'),
  { type: re.T_ASSERT, value: '$' }
);
test.eq(
  'a$',
  re.parse('a$'),
  { type: re.T_CONCAT, left: { type: re.T_CHAR, value: 'a' }, right: { type: re.T_ASSERT, value: '$' } }
);
test.eq(
  '\\b',
  re.parse('\\b'),
  { type: re.T_ASSERT, value: '\\b' }
);
test.eq(
  '\\ba',
  re.parse('\\ba'),
  { type: re.T_CONCAT, left: { type: re.T_ASSERT, value: '\\b' }, right: { type: re.T_CHAR, value: 'a' } }
);
test.eq(
  '\\Ba',
  re.parse('\\Ba'),
  { type: re.T_CONCAT, left: { type: re.T_ASSERT, value: '\\B' }, right: { type: re.T_CHAR, value: 'a' } }
);
test.eq(
  '(?=a)',
  re.parse('(?=a)'),
  { type: re.T_ASSERT, value: '?=', tester: { type: re.T_CHAR, value: 'a' } }
);
test.eq(
  '(?!a)',
  re.parse('(?!a)'),
  { type: re.T_ASSERT, value: '?!', tester: { type: re.T_CHAR, value: 'a' } }
);

test.endGroup();
