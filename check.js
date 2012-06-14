/**
 * Small testing framework.
 */
var check = (function() {
  'use strict';

  /**
   * Output element.
   * @type {Element|undefined}
   */
  var out;

  /**
   * @param {*} value Input value.
   * @param {string} msg Message.
   */
  function assert(value, msg) {
    if (value !== true) {
      throw new Error(msg);
    }
  }

  /**
   * Creates message about successful test case.
   * @param {string} title Test case's title.
   */
  function success(title) {
    assert(out !== undefined, 'Output element not set');
    var box = document.createElement('div');
    box.className = 'success';
    box.innerHTML = title;
    out.appendChild(box);
  }

  /**
   * Creates message about failed test case.
   * @param {string} title Test case's title.
   */
  function failure(title) {
    assert(out !== undefined, 'Output element not set');
    var box = document.createElement('div');
    box.className = 'failure';
    box.innerHTML = title;
    out.appendChild(box);
  }

  /**
   * Returns value's type.
   * @param {*} value Input value.
   * @return {string} Value's type - one of 'primitive', 'array' or 'object'.
   */
  function type(value) {
    if (typeof value !== 'object' || value === null) {
      return 'primitive';
    }
    else if (Array.isArray(value)) {
      return 'array';
    }
    else {
      return 'object';
    }
  }

  /**
   * @param {*} a First input.
   * @param {*} b Second input.
   * @return {boolean} True if values are equal (===), false otherwise.
   */
  function areEqual(a, b) {
    if (type(a) !== type(b)) { return false; }

    if (type(a) === 'primitive') {
      return a === b;
    }

    if (type(a) === 'array') {
      if (a.length !== b.length) { return false; }

      return a.reduce(function(prev, cur, idx) {
        return prev && areEqual(cur, b[idx]);
      }, true);
    }

    var aKeys = Object.keys(a).sort(),
        bKeys = Object.keys(b).sort();

    if (!areEqual(aKeys, bKeys)) { return false; }

    return aKeys.reduce(function(prev, cur) {
      return prev && areEqual(a[cur], b[cur]);
    }, true);
  }

  return {
    /**
     * Initializer.
     * @param {Element} output Output element.
     */
    init: function(output) {
      out = output;
    },
    /**
     * Check is passed value equals (===) to true.
     * @param {string} title Test case's title.
     * @param {*} result Tested value.
     */
    true: function(title, result) {
      result === true ? success(title) : failure(title);
    },
    /**
     * Check if passed values are equal.
     * @parma {string} title Test case's title.
     * @param {*} a First input.
     * @param {*} b Second input.
     */
    eq: function(title, a, b) {
      areEqual(a, b) ? success(title) : failure(title);
    }
  };
})();
