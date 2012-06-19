check.eq(
  '.',
  re.parse('.'),
  {type: re.T_DOT}
);
check.eq(
  '[.]',
  re.parse('[.]'),
  {type: re.T_CHAR_CLASS, negated: false, value: {type: re.T_CHAR, value: '.'}}
);
check.eq(
  '(.)',
  re.parse('(.)'),
  {type: re.T_GROUP, capturing: true, value: {type: re.T_DOT}}
);
