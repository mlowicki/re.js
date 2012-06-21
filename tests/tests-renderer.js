/**
 * @param {Element} parentEl Parent's element.
 * @constructor
 */
function TestsRenderer(parentEl) {
  /**
   * @type {Element}
   * @private
   */
  this.parentEl_ = parentEl;
  /**
   * @type {number}
   * @private
   */
  this.numOfTests_ = 0;
  /**
   * @type {number}
   * @private
   */
  this.numOfSuccess_ = 0;
  /**
   * @type {number}
   * @private
   */
  this.numOfFailures_ = 0;
  /**
   * @type {number}
   * @private
   */
  this.counter_ = 0;
  /**
   * @type {Object}
   * @private
   */
  this.id2TestData_ = {};
};

TestsRenderer.prototype = {
  /**
   * @return {string}
   * @private
   */
  getNextUniqueId_: function() {
    return 'tr' + this.counter_++;
  },
  /**
   * Creates table for results if it was already created.
   * @private
   */
  maybeCreateTable_: function() {
    if (!this.tableEl_) {
      this.summaryEl_ = document.createElement('h2');
      this.summaryEl_.className = 'summary';
      this.parentEl_.appendChild(this.summaryEl_);
      this.tableEl_ = document.createElement('table');
      this.tableEl_.className = 'table table-striped table-bordered';
      this.tableHeadEl_ = document.createElement('thead');
      this.tableHeadEl_.innerHTML = '<tr><th>Title</th><th>Result</th></tr>';
      this.tableEl_.appendChild(this.tableHeadEl_);
      this.tableBodyEl_ = document.createElement('tbody');
      this.tableEl_.appendChild(this.tableBodyEl_);
      this.parentEl_.appendChild(this.tableEl_);

      var that = this;

      $(this.tableBodyEl_).click(function(e) {
        var $target = $(e.target);

        if($target.hasClass('btn')) {
          var id = $target.parent().parent().attr('id'),
              testData = that.id2TestData_[id];

          that.showTestDetails_(
            testData.title,
            testData.reason
          );
        }
      });
    }
  },
  /**
   * @param {?Object} reason
   * @return {string}
   * @private
   */
  getFailureMessage_: function(reason) {
    if(reason === undefined) {
      return 'Everything is ok. What are you looking for man?';
    }

    switch(reason.type) {
    case test.T_PRIMITIVES_NOT_EQUAL:
      return 'Primitives not equal, ' + reason.found + ' !== ' + reason.expected;
    case test.T_TYPES_MISMATCH:
      return 'Types mismatch, ' + reason.found + ' !== ' + reason.expected;
    case test.T_LENGTHS_NOT_EQUAL:
      return 'Arrays have different length, ' + reason.found + ' !== ' + reason.expected;
    case test.T_MISSING_PROPERTY:
      return 'Property "' + reason.property + '" is missing';
    case test.T_EXTRA_PROPERTY:
      return 'Extra property "' + reason.property + '"';
    case test.T_WRONG_EXCEPTION:
      return 'Wrong exception thrown';
    case test.T_MISSING_EXCEPTION:
      return 'Expected exception not raised';
    }
  },
  /**
   * @param {?Object} reason
   * @return {string}
   * @private
   */
  getFailureLocation_: function(reason) {
    if(reason === undefined) { return ''; }

    return reason.where.length ? 'Where: ' + reason.where.map(function(value) { 
      return typeof value === 'string' ? '"' + value + '"' : '[' + value + ']';
    }).join(' &rarr; ') : '';
  },
  showTestDetails_: function(title,reason) {
    var $el = $('<div class="modal hide fade">' +
      '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal">×</button>' +
        '<h3>' + title + '</h3>' +
      '</div>' +
      '<div class="modal-body">' +
        '<p>' + this.getFailureMessage_(reason) + '</p>' +
        '<p>' + this.getFailureLocation_(reason) + '</p>' +
      '</div>' + 
      '<div class="modal-footer">' +
        '<a href="#" class="btn" data-dismiss="modal">Close</a>' +
      '</div>' +
    '</div>');
    $el.modal('show');
  },
  showTestResult: function(isSuccess, title, reason) {
    this.maybeCreateTable_(); 
    var rowEl = document.createElement('tr'),
        titleCell = document.createElement('td'),
        statusCell = document.createElement('td'),
        statusEl = document.createElement('button'),
        id = this.getNextUniqueId_(); 

    $(rowEl).attr('id', id);
    this.id2TestData_[id] = {
      title: title,
      reason: reason
    };

    titleCell.innerHTML = title;

    if(isSuccess) {
      statusEl.className = 'btn btn-success';
      statusEl.innerHTML = 'Success'; 
    }
    else {
      statusEl.className = 'btn btn-danger';
      statusEl.innerHTML = 'Failure';
    }

    statusCell.appendChild(statusEl);
    rowEl.appendChild(titleCell);
    rowEl.appendChild(statusCell);
    this.tableBodyEl_.appendChild(rowEl);

    this.numOfTests_ += 1;
    isSuccess ? this.numOfSuccess_++ : this.numOfFailures_++;
    this.summaryEl_.innerHTML = 'Score: ' + this.numOfSuccess_ + ' / ' + this.numOfTests_;
  } 
};
