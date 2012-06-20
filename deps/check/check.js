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
   * Tests' summary.
   * @type {Element|undefined}
   */
  var summary,
  /**
   * Number of failed tests.
   * @type {Number}
   * @default {0}
   */
  numOfFails = 0,
  /**
   * Number of successful tests.
   * @type {Number}
   * @default {0}
   */
  numOfPasses = 0;

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
   * Refresh tests' summary.
   */
  function updateSummary() {
    summary.innerHTML = numOfPasses + '/' + (numOfFails + numOfPasses) + ' passed';
    numOfFails && summary.classList.add('failed');
  }

  /**
   * Creates message about successful test case.
   * @param {string} title Test case's title.
   */
  function success(title) {
    var box = document.createElement('div');
    box.className = 'success';
    box.innerHTML = title;
    out.appendChild(box);
    numOfPasses += 1;
    updateSummary();
  }

  /**
   * Creates message about failed test case.
   * @param {string} title Test case's title.
   */
  function failure(title) {
    var box = document.createElement('div');
    box.className = 'failure';
    box.innerHTML = title;
    out.appendChild(box);
    numOfFails += 1;
    updateSummary();
  }

  /**
   * Shows information about current group.
   * @param {string} name Group's name.
   */
  function group(name) {
    var el = document.createElement('h2');
    el.className = 'group';
    el.innerHTML = name;
    out.appendChild(el);
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
     * Set current group of tests.
     * @param {string} name Group's name.
     */
    group: function(name) {
      group(name);
    },
    /**
     * Initializer.
     * @param {Element} output Output element.
     */
    init: function(output) {
      out = output;
      summary = document.createElement('div');
      summary.className = 'summary';
      numOfPasses = numOfFails = 0;
      out.appendChild(summary);
    },
    /**
     * Check is passed value equals (===) to true.
     * @param {string} title Test case's title.
     * @param {*} result Tested value.
     */
    true: function(title, result) {
      assert(out !== undefined, 'Not initialized');
      result === true ? success(title) : failure(title);
    },
    /**
     * Check if passed values are equal.
     * @parma {string} title Test case's title.
     * @param {*} a First input.
     * @param {*} b Second input.
     */
    eq: function(title, a, b) {
      assert(out !== undefined, 'Not initialized');
      areEqual(a, b) ? success(title) : failure(title);
    },
    /**
     * @param {string} title Test case's title.
     * @param {Function} fn Function to test.
     * @param {Function} exc Exception's constructor function.
     * @param {string} excMsg Exception's message.
     */
    throws: function(title, fn, exc, excMsg) {
      try {
        fn();
      }
      catch (e) {
        e.constructor === exc && e.message === excMsg ? success(title) : failure(title);
        return;
      }
      failure(title);
    }
  };
})();
