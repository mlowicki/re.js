check.eq('empty', re.parse(''), {type: re.T_EMPTY});
check.eq('single character', re.parse('a'), {type: re.T_CHAR, value: 'a'});
check.eq(
  'concatenation with two characters',
  re.parse('ab'),
  {type: re.T_CONCAT, left: {type: re.T_CHAR, value: 'a'}, right: {type: re.T_CHAR, value: 'b'}}
);
check.eq(
  'single OR without operands',
  re.parse('|'),
  {type: re.T_OR, left: {type: re.T_EMPTY}, right: {type: re.T_EMPTY}}
);
check.eq(
  'OR with simple chars on both sides',
  re.parse('a|b'),
  {type: re.T_OR, left: {type: re.T_CHAR, value: 'a'}, right: {type: re.T_CHAR, value: 'b'}}
);
