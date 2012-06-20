check.group('Quirks');
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
