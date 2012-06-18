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
