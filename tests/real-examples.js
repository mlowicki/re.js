test.beginGroup('real examples');

test.eq(
  'Escape regexp special characters',
  re.parse('[\\-\\[\\]\\/\\{\\}\\(\\)\\*\\+\\?\\.\\\\\\^\\$\\|]'),
  {
    type: re.T_CHAR_CLASS,
    negated: false,
    value: {
      type: re.T_CONCAT,
      left: { type: re.T_IDENTITY_ESCAPE, value: '-' },
      right: {
        type: re.T_CONCAT,
        left: { type: re.T_IDENTITY_ESCAPE, value: '[' },
        right: {
          type: re.T_CONCAT,
          left: { type: re.T_IDENTITY_ESCAPE, value: ']' },
          right: {
            type: re.T_CONCAT,
            left: { type: re.T_IDENTITY_ESCAPE, value: '/' },
            right: {
              type: re.T_CONCAT,
              left: { type: re.T_IDENTITY_ESCAPE, value: '{' },
              right: {
                type: re.T_CONCAT,
                left: { type: re.T_IDENTITY_ESCAPE, value: '}' },
                right: {
                  type: re.T_CONCAT,
                  left: { type: re.T_IDENTITY_ESCAPE, value: '(' },
                  right: {
                    type: re.T_CONCAT,
                    left: { type: re.T_IDENTITY_ESCAPE, value: ')' },
                    right: {
                      type: re.T_CONCAT,
                      left: { type: re.T_IDENTITY_ESCAPE, value: '*' },
                      right: {
                        type: re.T_CONCAT,
                        left: { type: re.T_IDENTITY_ESCAPE, value: '+' },
                        right: {
                          type: re.T_CONCAT,
                          left: { type: re.T_IDENTITY_ESCAPE, value: '?' },
                          right: {
                            type: re.T_CONCAT,
                            left: { type: re.T_IDENTITY_ESCAPE, value: '.' },
                            right: {
                              type: re.T_CONCAT,
                              left: { type: re.T_IDENTITY_ESCAPE, value: '\\' },
                              right: {
                                type: re.T_CONCAT,
                                left: { type: re.T_IDENTITY_ESCAPE, value: '^' },
                                right: {
                                  type: re.T_CONCAT,
                                  left: { type: re.T_IDENTITY_ESCAPE, value: '$' },
                                  right: { type: re.T_IDENTITY_ESCAPE, value: '|' },
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
);

test.endGroup();
