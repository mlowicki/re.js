test.eq(
  '"{" treated verbatim',
  re.parse('{'),
  {type: re.T_CHAR, value: '{'}
);
test.eq(
  '"}" treated verbatim',
  re.parse('}'),
  {type: re.T_CHAR, value: '}'}
);
test.eq(
  '"]" treated verbatim',
  re.parse(']'),
  {type: re.T_CHAR, value: ']'}
);
