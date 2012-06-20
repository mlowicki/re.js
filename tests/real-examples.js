check.group('Real examples');
check.eq(
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