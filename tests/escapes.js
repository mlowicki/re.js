check.group('Escapes');
check.eq(
  '\\ca',
  re.parse('\\ca'),
  {type: re.T_CONTROL_LETTER, value: 'a'}
);
check.eq(
  '\\cZ',
  re.parse('\\cZ'),
  {type: re.T_CONTROL_LETTER, value: 'Z'}
);
['f', 'n', 'r', 't', 'v'].forEach(function(character) {
  check.eq(
    '\\' + character,
    re.parse('\\' + character),
    {type: re.T_CONTROL_ESCAPE, value: character}
  );
});
check.eq(
  '\\x23', // '#'
  re.parse('\\x23'),
  {type: re.T_HEX_ESCAPE, value: '23'}
);
check.eq(
  '\\u0066', // 'f'
  re.parse('\\u0066'),
  {type: re.T_UNICODE_ESCAPE, value: '0066'}
);
check.eq(
  '\\a',
  re.parse('\\a'),
  {type: re.T_IDENTITY_ESCAPE, value: 'a'}
);
check.eq(
  '\\[',
  re.parse('\\['),
  {type: re.T_IDENTITY_ESCAPE, value: '['}
);
check.eq(
  '\\1',
  re.parse('\\1'),
  {type: re.T_DECIMAL_ESCAPE, value: 1}
);
check.eq(
  '\\123',
  re.parse('\\123'),
  {type: re.T_DECIMAL_ESCAPE, value: 123}
);
[
  {character: 'd', type: re.C_DIGIT},
  {character: 'D', type: re.C_NON_DIGIT},
  {character: 'w', type: re.C_WORD_CHAR},
  {character: 'W', type: re.C_NON_WORD_CHAR},
  {character: 's', type: re.C_WHITESPACE},
  {character: 'S', type: re.C_NON_WHITESPACE}
].forEach(function(item) {
  check.eq(
    '\\' + item.character,
    re.parse('\\' + item.character),
    {type: re.T_CCE, value: item.type} 
  );
}); 
