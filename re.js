/**
 * @license Public Domain.
 */


/**
 * JavaScript regular expression parser.
 */
var re = (function() {
  'use strict';

  var pos, // Current position in input stream.
      stream, // Input stream.
      HEX_DIGIT = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F',],
      CONTROL_ESCAPE = ['f', 'n', 'r', 't', 'v'],
      NON_PATTERN_CHAR = ['^', '$', '\\', '.', '*', '+', '?', '(', ')', '[', ']', '{', '}', '|'],
      mode;

  function reset() {
    pos = 0;
  }

  /**
   * @param {Object} Quantifier's object.
   */
  function validateQuantifier(obj) {
    if (isFinite(obj.to) && obj.from > obj.to) {
      throw new Error('Numbers out of order in quantifier');
    }
  }

  /**
   * @param {Object} node Input node.
   */
  function validateRange(node) {
    if (node.type !== re.T_RANGE) {
      throw new Error('Range required but found ' + node.type);
    }
    var from = node.from,
        to = node.to,
        escapes = [
          re.T_CCE,
          re.T_DECIMAL_ESCAPE,
          re.T_CONTROL_ESCAPE,
          re.T_CONTROL_LETTER,
          re.T_HEX_ESCAPE,
          re.T_UNICODE_ESCAPE,
          re.T_IDENTITY_ESCAPE
        ];

    if ((from.type === re.T_CCE || to.type === re.T_CCE) &&
        !(mode & re.M_RANGE_STRICT)) {

      if (to.type === re.T_CCE && mode & re.M_RANGE_TOLERANT_NO_CCE_AT_END) {
        throw new Error('Character class escape not allowed at end of range');
      }

      return;
    }

    if (from.type !== re.T_CHAR && escapes.indexOf(from.type) === -1) {
      throw new Error('Invalid left end of range. Found ' + node.from.type);
    }

    if (to.type !== re.T_CHAR && escapes.indexOf(to.type) === -1) {
      throw new Error('Invalid right end o range. Found ' + node.to.type);
    }

    from = from.value + '';
    to = to.value + '';
    if (from.charCodeAt(0) > to.charCodeAt(0)) {
      throw new Error('Range out of order in character class');
    }
  }

  /**
   * @return {boolean} True if end of stream has been reached, false otherwise.
   */
  function eos() {
    return pos >= stream.length;
  }

  function lookAhead(numOfChars) {
    return stream.substr(pos, numOfChars);
  }

  function assert(character, message) {
    if (stream[pos] !== character) {
      if (!message) {
        message = "Expected '" + character + "' found " +
            (pos < stream.length ? "'" + stream[pos] + "'" : 'end of stream');
      }

      throw new Error(message);
    }
  }

  /**
   * Pattern :: Disjunction
   *
   * @return {Object}
   */
  function parsePattern() {
    var alternatives = parseDisjunction();

    if (pos < stream.length) {
      throw new Error('Cannot parse remaining characters: ' + stream.substr(pos));
    }

    return alternatives;
  };

  /**
   * Disjunction ::
   *    Alternative
   *    Alternative | Disjunction
   *
   * @return {Object}
   */
  function parseDisjunction() {
    var alternatives = [];

    alternatives.push(parseAlternative());

    while (lookAhead(1) === '|') {
      pos += 1;
      alternatives.push(parseAlternative());
    }

    return alternatives.reduceRight(function(prev, cur) {
      return { type: re.T_OR, left: cur, right: prev };
    });
  }

  /**
   * Alternative ::
   *    [empty]
   *    Alternative Term
   *
   * @return {Object}
   */
  function parseAlternative() {
    var terms = [],
        term;

    while(pos < stream.length) {
      term = parseTerm();

      if (term === null) {
        break;
      }
      else {
        terms.push(term);
      }
    };

    if (!terms.length) {
      return { type: re.T_EMPTY };
    }

    return terms.reduceRight(function(prev, cur) {
      return { type: re.T_CONCAT, left: cur, right: prev };
    });
  }

  /**
   * Term ::
   *    Assertion
   *    Atom
   *    Atom Quantifier
   *
   * @return {?Object}
   */
  function parseTerm() {
    var res = parseAssertion(),
        quantifier;

    if (res !== null) { return res; }

    res = parseAtom();

    if (res !== null) {
      quantifier = parseQuantifier();

      if (quantifier !== null) {
        return { type: re.T_REPEAT, atom: res, quantifier: quantifier };
      }

      return res;
    }

    return null;
  }

  /**
   * Quantifier::
   *    QuantifierPrefix
   *    QuantifierPrefix ?
   *
   * @return {?Object}
   */
  function parseQuantifier() {
    var prefix = parseQuantifierPrefix();

    if (prefix && lookAhead(1) === '?') {
      pos += 1;
      prefix.greedy = false;
    }

    return prefix;
  }

  /**
   * QuantifierPrefix::
   *    *
   *    +
   *    ?
   *    { DecimalDigits }
   *    { DecimalDigist , }
   *    { DecimalDigits , DecimalDigits }
   *
   * @return {?Object}
   */
  function parseQuantifierPrefix() {
    var from, to, quantifier;

    if (lookAhead(1) === '*') {
      pos += 1;
      quantifier = { from: 0, to: Infinity, greedy: true };
    }
    else if (lookAhead(1) === '+') {
      pos += 1;
      quantifier = { from: 1, to: Infinity, greedy: true };
    }
    else if (lookAhead(1) === '?') {
      pos += 1;
      quantifier = { from: 0, to: 1, greedy: true };
    }
    else if (lookAhead(1) === '{') {
      pos += 1;

      from = parseDecimalDigits();

      if (from === null) {
        pos -= 1;
        return null;
      }

      if (lookAhead(1) === ',') {
        pos += 1;
        to = parseDecimalDigits();

        if (to === null) {
          to = Infinity;
        }
      } 

      if (lookAhead(1) === '}') {
        pos += 1;
        quantifier = { from: from, to: to, greedy: true };
      }
      else {
        pos -= 1 + from.toString().length + (to === undefined ? 0 : isFinite(to) ? to.toString().length + 1 : 1);
        return null;
      }
    }
    else {
      return null;
    }

    validateQuantifier(quantifier);
    return quantifier;
  }

  /**
   * DecimalDigits ::
   *    DecimalDigit
   *    DecimalDigits DecimalDigit
   *
   * @return {?Number}
   */
  function parseDecimalDigits() {
    var number = 0,
        found = false,
        digit;

    while(true) {
      digit = parseDecimalDigit();

      if (digit === null) { break; }

      found = true;
      number *= 10;
      number += digit;
    }

    if (!found) { return null; }

    return number;
  }

  /**
   *
   * DecimalDigit :: one of
   *    0 1 2 3 4 5 6 7 8 9
   *
   * @return {?Number}
   */
  function parseDecimalDigit() {
    var character = lookAhead(1);

    if (character >= '0' && character <= '9') {
      pos += 1;
      return +character;
    }

    return null;
  }

  /**
   * Assertion ::
   *    ^
   *    $
   *    \b
   *    \B
   *    (?= Disjunction )
   *    (?! Disjunction )
   *
   * @return {?Object}
   */
  function parseAssertion() {
    var disjunction;

    if (lookAhead(1) === '^') {
      pos += 1;
      return { type: re.T_ASSERT, value: '^' };
    }
    else if (lookAhead(1) === '$') {
      pos += 1;
      return { type: re.T_ASSERT, value: '$' };
    }
    else if (lookAhead(2) === '\\b') {
      pos += 2;
      return { type: re.T_ASSERT, value: '\\b' };
    }
    else if (lookAhead(2) === '\\B') {
      pos += 2;
      return { type: re.T_ASSERT, value: '\\B' };
    }
    else if (lookAhead(3) === '(?=') {
      pos += 3;
      disjunction = parseDisjunction();
      assert(')');
      pos += 1;
      return { type: re.T_ASSERT, value: '?=', tester: disjunction };
    }
    else if (lookAhead(3) === '(?!') {
      pos += 3;
      disjunction = parseDisjunction();
      assert(')');
      pos += 1;
      return { type: re.T_ASSERT, value: '?!', tester: disjunction };
    }

    return null;
  }

  /**
   * PatternCharacter::
   *    SourceCharacter but not one of - ^ $ \ . * + ? ( ) [ ] { } |
   *
   * SourceCharacter::
   *    any Unicode code unit
   *
   * @param {string} character input character
   * @return {boolean} true if input is pattern character, false otherwise.
   */
  function isPatternCharacter(character) {
    if (mode & re.M_SPECIAL_CHAR_VERBATIM) {
      return ['^', '$', '\\', '.', '*', '+', '?', '(', ')', '[', '|'].indexOf(character) === -1;
    }

    return NON_PATTERN_CHAR.indexOf(character) === -1;
  }

  /**
   * Atom::
   *    PatternCharacter
   *    .
   *    \ AtomEscape
   *    CharacterClass
   *    ( Disjunction )
   *    (?: Disjunction )
   *
   * @return {?Object}
   */
  function parseAtom() {
    var character,
        match;

    if (lookAhead(1) === '.') {
      pos += 1;
      return { type: re.T_DOT };
    }
    else if (lookAhead(3) === '(?:') {
      pos += 3;
      match = parseDisjunction();
      assert(')');
      pos += 1;
      return { type: re.T_GROUP, capturing: false, value: match };
    }
    else if (lookAhead(1) === '(') {
      pos += 1;
      match = parseDisjunction();
      assert(')');
      pos += 1;
      return { type: re.T_GROUP, capturing: true, value: match };
    }
    else if (lookAhead(1) === '\\') {
      pos += 1;
      return parseAtomEscape();
    }
    else if (lookAhead(1) === '[') {
      pos += 1;
      return parseCharacterClass();
    }

    if (isPatternCharacter(lookAhead(1))) {
      character = lookAhead(1);
      pos += 1;
      return { type: re.T_CHAR, value: character };
    }

    return null;
  }

  /**
   * CharacterClass::
   *    [ [lookahead ∉ {^}] ClassRanges ]
   *    [ ^ ClassRanges ]
   *
   * @return {Object}
   */
  function parseCharacterClass() {
    var negated = false,  
        ranges;

    if (lookAhead(1) === '^') {
      pos += 1;
      negated = true;
    }

    ranges = parseClassRanges();
    assert(']', 'Unterminated character class');
    pos += 1;
    return { type: re.T_CHAR_CLASS, negated: negated, value: ranges };
  };

  /**
   * ClassRanges::
   *    [empty]
   *    NonemptyClassRanges
   *
   * NonemptyClassRanges::
   *    ClassAtom
   *    ClassAtom NonemptyClassRangesNoDash
   *    ClassAtom - ClassAtom ClassRanges
   *
   * NonemptyClassRangesNoDash::
   *    ClassAtom
   *    ClassAtomNoDash NonemptyClassRangesNoDash
   *    ClassAtomNoDash - ClassAtom ClassRanges
   *
   * @return {?Object}
   */
  function parseClassRanges() {
    var from,
        to,
        range,
        ranges,
        last,
        beforeLast;

    if (eos()) { return null; }

    if (lookAhead(1) === ']') {
      return { type: re.T_EMPTY };
    }

    from = parseClassAtom();

    if (lookAhead(1) === ']') {
      return from;
    }

    if (lookAhead(1) === '-') {
      pos += 1;
      to = parseClassAtom();

      if (to === null) {
        return { type: re.T_CONCAT, left: from, right: { type: re.T_CHAR, value: '-' } };
      }

      ranges = parseClassRanges();
      range = { type: re.T_RANGE, from: from, to: to };
      validateRange(range);

      if (ranges !== null && ranges.type !== re.T_EMPTY) {
        return { type: re.T_CONCAT, left: range, right: ranges };
      }

      return range;
    }
    else {
      ranges = [from];

      while (true) {
        to = parseClassAtom();

        if (to === null) {
          break;
        }
        else if (to.type === re.T_CHAR && to.value === '-') {
          if (lookAhead(1) === ']') {
            ranges.push(to);
            break;
          }
          else {
            beforeLast = ranges.pop();
            last = to;
            to = parseClassAtom();
            range = { type: re.T_RANGE, from: beforeLast, to: to };
            validateRange(range);
            ranges.push(range);

            if (lookAhead(1) !== ']') {
              ranges.push(parseClassRanges());
            }

            break;
          }
        }
        else {
          ranges.push(to);
        }
      }

      while (ranges.length > 1) {
        last = ranges.pop();
        beforeLast = ranges.pop();

        ranges.push({ type: re.T_CONCAT, left: beforeLast, right: last });
      }

      return ranges[0]; 
    }
  };

  /**
   * ClassAtom::
   *    -
   *    ClassAtomNoDash
   *
   * ClassAtomNoDash::
   *    SourceCharacter but not one of \ or ] or -
   *    \ ClassEscape
   *
   * SourceCharacter::
   *    any Unicode code unit
   *
   * @return {?Object}
   */
  function parseClassAtom() {
    var classEscape;

    if (eos()) { return null; }

    if (['\\', ']', '-'].indexOf(lookAhead(1)) === -1) {
      return { type: re.T_CHAR, value: stream[pos++] };
    }
    else if (lookAhead(1) === '\\') {
      pos += 1;
      return parseClassEscape();
    }
    else if (lookAhead(1) === '-') {
      pos += 1;
      return { type: re.T_CHAR, value: '-' };
    }

    return null;
  }

  /**
   * ClassEscape::
   *    DecimalEscape
   *    b
   *    CharacterEscape
   *    CharacterClassEscape
   *
   * @return {Object}
   */
  function parseClassEscape() {
    var res = parseDecimalEscape();

    if (res !== null) { return res; }

    if (lookAhead(1) === 'b') {
      pos += 1;
      return { type: re.T_IDENTITY_ESCAPE, value: 'b' };
    }

    res = parseCharacterClassEscape();

    if (res !== null) { return res; }

    return parseCharacterEscape();
  }

  /**
   * AtomEscape::
   *    DecimalEscape
   *    CharacterEscape 
   *    CharacterClassEscape
   *
   * @return {?Object}
   */
  function parseAtomEscape() {
    var res = parseCharacterClassEscape();

    if (res !== null) { return res; }

    res = parseDecimalEscape();

    if (res !== null) { return res; }

    return parseCharacterEscape();
  }

  /**
   * CharacterEscape::
   *    ControlEscape
   *    c ControlLetter
   *    HexEscapeSequence
   *    UnicodeEscapeSequence
   *    IdentityEscape
   *
   * @return {Object}
   */
  function parseCharacterEscape() {
    var res = parseControlEscape();

    if (res !== null) { return res };

    if (lookAhead(1) === 'c') {
      pos += 1;
      res = parseControlLetter();

      if (res !== null) { return res; }

      pos -= 1;
    }

    res = parseHexEscapeSequence();

    if (res !== null) { return res; }


    res = parseUnicodeEscapeSequence();

    if (res !== null) { return res; }

    return parseIdentityEscape();
  }

  /**
   * @return {Object}
   */
  function parseIdentityEscape() {
    if (pos === stream.length) {
      throw new Error('\\ at end of pattern');
    }

    return { type: re.T_IDENTITY_ESCAPE, value: stream[pos++] };
  }

  /**
   * HexEscapeSequence::
   *    x HexDigit HexDigit
   *
   * @return {?Object}
   */
  function parseHexEscapeSequence() {
    var first, second;

    if (lookAhead(1) === 'x') {
      pos += 1;
      first = parseHexDigit();

      if (first === null) {
        pos -= 1;
        return null;
      }

      second = parseHexDigit();

      if (second === null) {
        pos -= 2;
        return null;
      }

      return { type: re.T_HEX_ESCAPE, value: first + second };
    }

    return null;
  }

  /**
   * UnicodeEscapeSequence::
   *    u HexDigit HexDigit HexDigit HexDigit
   *
   * @return {?Object}
   */
  function parseUnicodeEscapeSequence() {
    var res, sequence = '', i;

    if (lookAhead(1) === 'u') {
      pos += 1;

      for (var i = 0; i < 4; i++) {
        res = parseHexDigit();

        if (res === null) {
          res -= i + 1;
          return null;
        }

        sequence += res;
      }

      return { type: re.T_UNICODE_ESCAPE, value: sequence };
    }

    return null;
  }

  /**
   * HexDigit:: one of
   *    0 1 2 3 4 5 6 7 8 9 a b c d e f A B C D E F
   *
   * @return {?string}
   */
  function parseHexDigit() {
    var c = lookAhead(1);

    if (HEX_DIGIT.indexOf(c) !== -1) {
      pos += 1;
      return c;
    }

    return null;
  }

  /**
   * ControlLetter:: one of
   *    a b c d e f g h i j k l m n o p q r s t u v w x y z
   *    A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
   *
   * @return {?Object}
   */
  function parseControlLetter() {
    var c = lookAhead(1);

    if (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z') {
      pos += 1;
      return { type: re.T_CONTROL_LETTER, value: c };
    }

    return null;
  }

  /**
   * ControlEscape:: one of
   *    f n r t v
   *
   * @return {?Object}
   */
  function parseControlEscape() {
    var character;

    if (CONTROL_ESCAPE.indexOf(lookAhead(1)) !== -1) {
      character = lookAhead(1);
      pos += 1;
      return { type: re.T_CONTROL_ESCAPE, value: character };
    }

    return null;
  }

  /**
   * DecimalEscape::
   *    DecimalIntegerLiteral [lookahead not DecimalDigit]
   *
   * @return {?Object}
   */
  function parseDecimalEscape() {
    var res = parseDecimalIntegerLiteral();

    if (res !== null) {
      return { type: re.T_DECIMAL_ESCAPE, value: res };
    }

    return null;
  }

  /**
   * DecimalIntegerLiteral::
   *    0
   *    NonZeroDigit DecimalDigits_opt
   *
   * @return {?Number}
   */
  function parseDecimalIntegerLiteral() {
    var head,
        tail;

    if (lookAhead(1) === '0') {
      pos += 1;
      return 0;
    }
    else if (lookAhead(1) >= '1' && lookAhead(1) <= '9') {
      head = Number(lookAhead(1));
      pos += 1;
      tail = parseDecimalDigits();

      if (tail === null) {
        return head;
      }
      else {
        return Number(head.toString() + tail.toString());
      }
    }

    return null;
  }

  /**
   * CharacterClassEscape:: one of
   *    d D s S w W
   *
   * @return {?Object}
   */
  function parseCharacterClassEscape() {
    switch (lookAhead(1)) {
      case 'd':
        pos += 1;
        return { type: re.T_CCE, value: re.C_DIGIT };
      case 'D':
        pos += 1;
        return { type: re.T_CCE, value: re.C_NON_DIGIT };
      case 's':
        pos += 1;
        return { type: re.T_CCE, value: re.C_WHITESPACE };
      case 'S':
        pos += 1;
        return { type: re.T_CCE, value: re.C_NON_WHITESPACE };
      case 'w':
        pos += 1;
        return { type: re.T_CCE, value: re.C_WORD_CHAR };
      case 'W':
        pos += 1;
        return { type: re.T_CCE, value: re.C_NON_WORD_CHAR };
      default:
        return null;
    }
  }

  return {
    /**
     * Exact ES's grammar rules.
     * @type {Number}
     * @static
     */
    M_RANGE_STRICT: 1,
    /**
     * Some browsers (e.g. Chrome 19) accepts character class escapes in ranges like /[\d-b]/ matches
     * set {0,1, ... ,9, 'b', '-'}.
     * http://referenceerror.com/class-ranges-with-character-class-escape/
     * @type {Number}
     * @static
     */
    M_RANGE_TOLERANT: 2,
    /**
     * Firefox accepts /[\d-b]/ but throws syntax error exception when encounters character class escape and the
     * end of range - /[a-\d]/.
     * http://referenceerror.com/class-ranges-with-character-class-escape/
     * @type {Number}
     * @static
     */
    M_RANGE_TOLERANT_NO_CCE_AT_END: 4,
    /**
     * Some special character - '{', '}', ']' can be treated verbatim.
     * cannot be fully parsed.
     * @type {Number}
     */
    M_SPECIAL_CHAR_VERBATIM: 8,
    // Node's types.
    T_OR: 'OR',
    T_CONCAT: 'CONCATENATION',
    T_EMPTY: 'EMPTY',
    T_CHAR: 'CHAR',
    T_DOT: 'DOT',
    T_GROUP: 'GROUP',
    T_CCE: 'CHARACTER CLASS ESCAPE',
    T_DECIMAL_ESCAPE: 'DECIMAL ESCAPE',
    T_CONTROL_ESCAPE: 'CONTROL ESCAPE',
    T_CONTROL_LETTER: 'CONTROL LETTER',
    T_HEX_ESCAPE: 'HEX ESCAPE',
    T_UNICODE_ESCAPE: 'UNICODE ESCAPE',
    T_IDENTITY_ESCAPE: 'IDENTITY_ESCAPE',
    T_ASSERT: 'ASSERT',
    T_CHAR_CLASS: 'CHARACTER CLASS',
    T_RANGE: 'RANGE',
    T_REPEAT: 'REPEAT',
    // Character classes.
    C_DIGIT: 'DIGIT',
    C_NON_DIGIT: 'NON-DIGIT',
    C_WHITESPACE: 'WHITESPACE',
    C_NON_WHITESPACE: 'NON-WHITESPACE',
    C_WORD_CHAR: 'WORD CHARACTER',
    C_NON_WORD_CHAR: 'NON-WORD CHARACTER',
    /**
     * Parses input stream and returns abstract syntax tree.
     * @param {string} s Input stream.
     * @param {number=} opt_mode Parsing mode.
     * @return {Object}
     */
    parse: function(s, opt_mode) {
      mode = opt_mode === undefined ? this.M_RANGE_TOLERANT | this.M_SPECIAL_CHAR_VERBATIM : opt_mode;
      reset();
      stream = s;
      return parsePattern(stream);
    }
  };
})();
