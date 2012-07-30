test.beginGroup('dot');

test.eq(
  '.',
  re.parse('.'),
  {type: re.T_DOT}
);
test.eq(
  '[.]',
  re.parse('[.]'),
  {type: re.T_CHAR_CLASS, negated: false, value: {type: re.T_CHAR, value: '.'}}
);
test.eq(
  '(.)',
  re.parse('(.)'),
  {type: re.T_GROUP, capturing: true, value: {type: re.T_DOT}}
);

test.endGroup();
