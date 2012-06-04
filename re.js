/**
 * @license Public Domain.
 */


/**
 * JavaScript regular expression parser.
 */
var re = (function() {
  'use strict';

  /**
   * Parse tree.
   * @param {Node=} opt_root Tree's root node.
   * @constructor
   */
  function Tree(opt_root) {
    this.root_ = opt_root || null;
  };

  Tree.prototype = {
    constructor: Tree,
    toString: function() {
      return '[object Tree]';
    },
    /**
     * @return {?Node} tree's root.
     */
    get root() { return this.root_; },
    /**
     * @param {?Node} Root node.
     */
    set root(root) { this.root_ = root; },
    /**
     * @return {Array} List of tree nodes in infix order.
     */
    infix: function() {
      return this.root ? this.root.infix() : [];
    }
  };

  /**
   * Parse tree node.
   * @param {string} type Node's type.
   * @param {*=} opt_value Node's value.
   * @param {Node=} opt_left Left child.
   * @param {Node=} opt_right Right child.
   * @constructor
   */
  function Node(type, opt_value, opt_left, opt_right) {
    this.type_ = type;
    this.value_ = opt_value;
    this.left_ = opt_left || null;
    this.right_ = opt_right || null;
  };

  // Node types.
  Node.T_OR = 'OR';
  Node.T_CONCAT = 'CONCATENATION';
  Node.T_EMPTY = 'EMPTY';
  Node.T_CHAR = 'CHAR';
  Node.T_DOT = 'DOT';
  Node.T_NON_CAPTURE_GROUP = 'NON-CAPTURE GROUP';
  Node.T_CAPTURE_GROUP = 'CAPTURE GROUP';
  Node.T_CHAR_CLASS_ESCAPE = 'CHARACTER CLASS ESCAPE';
  Node.T_DECIMAL_ESCAPE = 'DECIMAL ESCAPE';
  Node.T_DECIMAL_INTEGER = 'DECIMAL INTEGER';
  Node.T_CONTROL_ESCAPE = 'CONTROL ESCAPE';
  Node.T_CONTROL_LETTER = 'CONTROL LETTER';
  Node.T_HEX_ESCAPE = 'HEX ESCAPE';
  Node.T_UNICODE_ESCAPE = 'UNICODE ESCAPE';
  Node.T_HEX_DIGIT = 'HEX DIGIT';
  Node.T_ASSERT = 'ASSERT';
  Node.T_CHAR_CLASS = 'CHARACTER CLASS';
  Node.T_RANGE = 'RANGE';
  Node.T_REPEAT = 'REPEAT';
  Node.T_QUANTIFIER = 'QUANTIFIER';
  // Character classes.
  Node.C_DIGIT = 'DIGIT';
  Node.C_NON_DIGIT = 'NON-DIGIT';
  Node.C_WHITESPACE = 'WHITESPACE';
  Node.C_NON_WHITESPACE = 'NON-WHITESPACE';
  Node.C_WORD_CHAR = 'WORD CHARACTER';
  Node.C_NON_WORD_CHAR = 'NON-WORD CHARACTER';

  Node.prototype = {
    constructor: Node,
    toString: function() {
      return '[object Node (' + this.type + (this.value !== undefined) ? ', ' + this.value : '' + ')]';
    },
    /**
     * @return {*} Node's value.
     */
    get value() { return this.value_; },
    /**
     * @return {string} Node's type.
     */ 
    get type() { return this.type_; },
    /**
     * @param {?Node} left child.
     */
    set left(left) { this.left_ = left; },
    /**
     * @return {?Node} Left child.  
     */
    get left() { return this.left_; },
    /**
     * @param {?Node} Right child.
     */
    set right(right) { this.right_ = right; },
    /**
     * @return {?Node} Right child.
     */
    get right() { return this.right_; },
    /**
     * @return {Array} Nodes list in infix order of tree rooted in the current node.
     */
    infix: function() {
      var res = [];

      if (this.left) {
        res = res.concat(this.left.infix());
      }

      res.push(this);

      if (this.right) {
        res = res.concat(this.right.infix());
      }

      return res;
    }
  };

  var pos, // Current position in input stream.
      stream, // Input stream.
      HEX_DIGIT = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F',],
      CONTROL_ESCAPE = ['f', 'n', 'r', 't', 'v'],
      NON_PATTERN_CHARACTER = ['^', '$', '\\', '.', '*', '+', '?', '(', ')', '[', ']', '{', '}', '|'];

  function reset() {
    pos = 0;
  }

  function lookAhead(numOfChars) {
    return stream.substr(pos, numOfChars);
  }

  function assert(character) {
    if (stream[pos] !== character) {
      throw new Error("Expected '" + character + "' found " +
        (pos < stream.length ? "'" + stream[pos] + "'" : 'end of stream'));
    }
  }

  /**
   * Pattern :: Disjunction
   *
   * @return {Tree}
   */
  function parsePattern() {
    var alternatives = parseDisjunction(),
        tree;

    if (pos < stream.length) {
      throw new Error('Cannot parse remaining characters: ' + stream.substr(pos));
    }

    tree = new Tree(alternatives);
    return tree;
  };

  /**
   * Disjunction ::
   *    Alternative
   *    Alternative | Disjunction
   *
   * @return {Node}
   */
  function parseDisjunction() {
    var alternatives = [];

    alternatives.push(parseAlternative());

    while (lookAhead(1) === '|') {
      pos += 1;
      alternatives.push(parseAlternative());
    }

    return alternatives.reduceRight(function(prev, cur) {
      return new Node(Node.T_OR, undefined, cur, prev);
    });
  }

  /**
   * Alternative ::
   *    [empty]
   *    Alternative Term
   *
   * @return {Node}
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
      return new Node(Node.OP_EMPTY);
    }

    return terms.reduceRight(function(prev, cur) {
      return new Node(Node.T_CONCAT, undefined, prev, cur); 
    });
  }

  /**
   * Term ::
   *    Assertion
   *    Atom
   *    Atom Quantifier
   *
   * @return {?Node}
   */
  function parseTerm() {
    var res = parseAssertion(),
        quantifier;

    if (res !== null) { return res; }

    res = parseAtom();

    if (res !== null) {
      quantifier = parseQuantifier();

      if (quantifier !== null) {
        return new Node(Node.T_REPEAT, undefined, res, quantifier);
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
   * @return {?Node}
   */
  function parseQuantifier() {
    var prefix = parseQuantifierPrefix();

    if (prefix && lookAhead(1) === '?') {
      pos += 1;
      prefix.value.greedy = false;
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
   * @return {?Node}
   */
  function parseQuantifierPrefix() {
    var from, to;

    if (lookAhead(1) === '*') {
      pos += 1;
      return new Node(Node.T_QUANTIFIER, {from: 0, to: Infinity, greedy: true});
    }
    else if (lookAhead(1) === '+') {
      pos += 1;
      return new Node(Node.T_QUANTIFIER, {from: 1, to: Infinity, greedy: true});
    }
    else if (lookAhead(1) === '?') {
      pos += 1;
      return new Node(Node.T_QUANTIFIER, {from: 0, to: 1, greedy: true});
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
      else {
        to = from;
      }

      assert('}');
      pos += 1;
      return new Node(Node.T_QUANTIFIER, {from: from, to: to, greedy: true});
    }

    return null;
  }

  /**
   * DecimalDigits ::
   *    DecimalDigit
   *    DecimalDigits DecimalDigits
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
   * @return {?Node}
   */
  function parseAssertion() {
    var disjunction;

    if (lookAhead(1) === '^') {
      pos += 1;
      return new Node(Node.T_ASSERT, '^');
    }
    else if (lookAhead(1) === '$') {
      pos += 1;
      return new Node(Node.T_ASSERT, '$');
    }
    else if (lookAhead(2) === '\\b') {
      pos += 2;
      return Node(Node.T_ASSERT, '\\b');
    }
    else if (lookAhead(2) === '\\B') {
      pos += 2;
      return Node(Node.T_ASSERT, '\\B');
    }
    else if (lookAhead(3) === '(?=') {
      pos += 3;
      disjunction = parseDisjunction();
      assert(')');
      pos += 1;
      return Node(Node.T_ASSERT, '?=');
    }
    else if (lookAhead(3) === '(?!') {
      pos += 3;
      disjunction = parseDisjunction();
      assert(')');
      pos += 1;
      return Node(Node.T_ASSERT, '?!');
    }

    return null;
  }

  /**
   * PatternCharacter::
   *    SourceCharacter but not one of - ^ $ \ . * + ? ( ) [ ] { } |
   *
   * SourceCharacter::
   *    any Unicode code unit
   */
  function isPatternCharacter(character) {
    return NON_PATTERN_CHARACTER.indexOf(character) == -1; 
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
   * @return {?Node}
   */
  function parseAtom() {
    var character,
        disjunction,
        atomEscape;

    if (isPatternCharacter(lookAhead(1))) {
      character = lookAhead(1);
      pos += 1;
      return new Node(Node.T_CHAR, character);
    }
    else if (lookAhead(1) === '.') {
      pos += 1;
      return new Node(Node.T_DOT);
    }
    else if (lookAhead(3) === '(?:') {
      pos += 3;
      disjunction = parseDisjunction();
      assert(')');
      pos += 1;
      return new Node(Node.T_NON_CAPTURE_GROUP, undefined, disjunction);
    }
    else if (lookAhead(1) === '(') {
      pos += 1;
      disjunction = parseDisjunction();
      assert(')');
      pos += 1;
      return new Node(Node.T_CAPTURE_GROUP, undefined, disjunction);
    }
    else if (lookAhead(1) === '\\') {
      pos += 1;
      atomEscape = parseAtomEscape();
      return atomEscape;
    }

    return parseCharacterClass();
  }

  /**
   * CharacterClass::
   *    [ [lookahead ∉ {^}] ClassRanges ]
   *    [ ^ ClassRanges ]
   *
   * @return {?Node}
   */
  function parseCharacterClass() {
    var negated = false,  
        ranges;

    if (lookAhead(1) === '[') {
      pos += 1;

      if (lookAhead(1) === '^') {
        pos += 1;
        negated = true;
      }

      ranges = parseClassRanges(); 

      assert(']');
      pos += 1;
      return new Node(Node.T_CHAR_CLASS, negated, ranges);
    }

    return null;
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
   * @return {?Node}
   */
  function parseClassRanges() {
    var from,
        to,
        ranges,
        last,
        beforeLast;

    if (lookAhead(1) === ']') {
      return new Node(Node.T_EMPTY);
    }

    from = parseClassAtom();

    if (lookAhead(1) === ']') {
      return from;
    }

    if (lookAhead(1) === '-') {
      pos += 1;
      to = parseClassAtom();

      if (to === null) {
        return new Node(Node.T_CONCAT, undefined, from, new Node(Node.T_CHAR, '-'));
      }

      ranges = parseClassRanges();

      if (ranges !== null && ranges.type !== Node.T_EMPTY) {
        return new Node(Node.T_CONCAT, undefined, new Node(Node.T_RANGE, undefined, from, to), ranges);
      }

      return new Node(Node.T_RANGE, undefined, from, to); 
    }
    else {
      ranges = [from];

      while (true) {
        to = parseClassAtom();

        if (to === null) {
          break;
        }
        else if (to.type === Node.T_CHAR && to.value === '-') {
          if (lookAhead(1) === ']') {
            ranges.push(to);
            break;
          }
          else {
            beforeLast = ranges.pop();
            last = to;
            to = parseClassAtom();

            // TODO beforeLast can be e.g. \b .What to do then with range \b - a ?
            ranges.push(new Node(Node.T_RANGE, undefined, beforeLast, to));

            if (lookAhead(1) !== ']') {
              // TODO can parseClassRanges return here null ?
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

        ranges.push(new Node(Node.T_CONCAT, undefined, beforeLast, last)); 
      }

      return ranges[0]; 
    }

    return null;
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
   * @return {?Node}
   */
  function parseClassAtom() {
    var classEscape;

    if (['\\', ']', '-'].indexOf(lookAhead(1)) === -1) {
      return new Node(Node.T_CHAR, stream[pos++]);
    }
    else if (lookAhead(1) === '\\') {
      pos += 1;
      classEscape = parseClassEscape();
      // TODO: What is parseClassEscape fails?
      return classEscape;
    }
    else if (lookAhead(1) === '-') {
      pos += 1;
      return new Node(Node.T_CHAR, '-');
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
   * @return {?Node}
   */
  function parseClassEscape() {
    var res = parseDecimalEscape();

    if (res !== null) { return res; }

    if (lookAhead(1) === 'b') {
      pos += 1;
      return new Node(Node.T_CHAR, '\\b');
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
   * @return {?Node}
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
   * @return {?Node}
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
   * IdentityEscape::
   *    SourceCharacter but not IdentifierPart
   *    <ZWJ>
   *    <ZWNJ>
   *
   * IdentifierPart::
   *    IdentifierStart
   *    UnicodeCombiningMark
   *    UnicodeDigit
   *    UnicodeConnectorPunctuation
   *    <ZWNJ>
   *    <ZWJ>
   *
   * IdentifierStart::
   *    UnicodeLetter
   *    $
   *    _
   *    \ UnicodeEscapeSequence
   *
   * UnicodeLetter::
   *    any character in the Unicode categories "Uppercase letter (Lu)", "Lowercase letter (Ll)",
   *    "Titlecase letter (Lt)", "Modifier letter (Lm)", "Other letter (Lo)", or "Letter number (Nl)".
   *
   * UnicodeCombiningMark::
   *    any character in the Unicode categories "Non-spacing mark (Mn)" or "Combining spacing mark (Mc)"
   *
   * UnicodeDigit::
   *    any character in the Unicode category "Decimal number (Nd)"
   *
   * UnicodeConnectorPunctuation::
   *    any character in the Unicode category "Connector punctuation (Pc)"
   *
   * @return {?Node}
   */
  function parseIdentityEscape() {
    // TODO
    return null;
  }

  /**
   * HexEscapeSequence::
   *    x HexDigit HexDigit
   *
   * @return {?Node}
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

      return new Node(Node.T_HEX_ESCAPE, first.value + second.value);
    }

    return null;
  }

  /**
   * UnicodeEscapeSequence::
   *    u HexDigit HexDigit HexDigit HexDigit
   *
   * @return {?Node}
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

        sequence += res.value;
      }

      return new Node(Node.T_UNICODE_ESCAPE, sequence);
    }

    return null;
  }

  /**
   * HexDigit:: one of
   *    0 1 2 3 4 5 6 7 8 9 a b c d e f A B C D E F
   *
   * @return {?Node}
   */
  function parseHexDigit() {
    var c = lookAhead(1);

    if (HEX_DIGIT.indexOf(c) !== -1) {
      pos += 1;
      return new Node(Node.T_HEX_DIGIT, c);
    }

    return null;
  }

  /**
   * ControlLetter:: one of
   *    a b c d e f g h i j k l m n o p q r s t u v w x y z
   *    A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
   *
   * @return {?Node}
   */
  function parseControlLetter() {
    var c = lookAhead(1);

    if (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z') {
      pos += 1;
      return new Node(Node.T_CONTROL_LETTER, c);
    }

    return null;
  }

  /**
   * ControlEscape:: one of
   *    f n r t v
   *
   * @return {?Node}
   */
  function parseControlEscape() {
    var character;

    if (CONTROL_ESCAPE.indexOf(lookAhead(1)) !== -1) {
      character = lookAhead(1);
      pos += 1;
      return new Node(Node.T_CONTROL_ESCAPE, character);
    }

    return null;
  }

  /**
   * DecimalEscape::
   *    DecimalIntegerLiteral [lookahead not DecimalDigit]
   *
   * @return {?Node}
   */
  function parseDecimalEscape() {
    var res = parseDecimalIntegerLiteral();

    if (res !== null) {
      return new Node(Node.T_DECIMAL_ESCAPE, undefined, res);
    }

    return null;
  }

  /**
   * DecimalIntegerLiteral::
   *    0
   *    NonZeroDigit DecimalDigits_opt
   *
   * @return {?Node}
   */
  function parseDecimalIntegerLiteral() {
    var head,
        tail;

    if (lookAhead(1) === '0') {
      return new Node(Node.T_DECIMAL_INTEGER, 0);
    }
    else if (lookAhead(1) >= '1' && lookAhead(1) <= '9') {
      head = Number(lookAhead(1));
      pos += 1;
      tail = parseDecimalDigits();

      if (tail === null) {
        return new Node(Node.T_DECIMAL_INTEGER, head);
      }
      else {
        return new Node(Node.T_DECIMAL_INTEGER, Number(head.toString() + tail.value.toString()));
      }
    }

    return null;
  }

  /**
   * CharacterClassEscape:: one of
   *    d D s S w W
   *
   * @return {?Node}
   */
  function parseCharacterClassEscape() {
    switch (lookAhead(1)) {
      case 'd':
        pos += 1;
        return new Node(Node.T_CHAR_CLASS_ESCAPE, Node.C_DIGIT);
      case 'D':
        pos += 1;
        return new Node(Node.T_CHAR_CLASS_ESCAPE, Node.C_NON_DIGIT);
      case 's':
        pos += 1;
        return new Node(Node.T_CHAR_CLASS_ESCAPE, Node.C_WHITESPACE);
      case 'S':
        pos += 1;
        return new Node(Node.T_CHAR_CLASS_ESCAPE, Node.C_NON_WHITESPACE);
      case 'w':
        pos += 1;
        return new Node(Node.T_CHAR_CLASS_ESCAPE, Node.C_WORD_CHAR);
      case 'W':
        pos += 1;
        return new Node(Node.T_CHAR_CLASS_ESCAPE, Node.C_NON_WORD_CHAR);
      default:
        return null;
    }
  }

  return {
    Tree: Tree,
    Node: Node,
    /**
     * Parses input stream
     * @param {string} s Input stream.
     * @return {Tree}
     */
    parse: function(s) {
      reset();
      stream = s;
      return parsePattern(stream);
    }
  };
})();
