re.js
=====

Parser for JavaScript regular expressions.

Usage
=====

<code>re.parse('abc');</code>

Returns:

    {
        type: re.T_CONCAT,
        left: { type: re.T_CHAR, value: 'a' },
        right: {
            type: re.T_CONCAT,
            left: { type: re.T_CHAR, value: 'b' },
            right: { type: re.T_CHAR, value: 'c' }
        }
    };

<code>re.parse('a{1,3}');</code>

Returns:

    {
        type: re.T_REPEAT,
        quantifier: { from: 1, to: 3, greedy: true },
        atom: { type: re.T_CHAR, value: 'a' }
    }


Modes
===========

* re.M\_RANGE\_STRICT

  Strict mode follows rules from ES's grammar.

* re.M\_RANGE\_TOLERANT

  Tolerant mode accepts character class escapes in ranges like /[\d-b]/ matches set {0,1, ... ,9, 'b', '-'}. [More info](http://referenceerror.com/class-ranges-with-character-class-escape/)

* re.M\_RANGE\_TOLERANT\_NO\_CCE\_AT\_END

  Accepts /[\d-b]/ but throws syntax error exception when encounters character class escape and the end of range - /[a-\d]/. [More info](http://referenceerror.com/class-ranges-with-character-class-escape/)

* re.M\_SPECIAL\_CHAR\_VERBATIM

  Some special character - '{', '}', ']' can be treated verbatim if cannot be parsed as part of quantifier or character class. [More info](http://referenceerror.com/special-characters-treated-verbatim-in-regexp/)
