/**
 * Test renderer compatible with test.js which used tree view.
 * @author mlowicki@gmail.com (Michał Łowicki)
 */


/**
 * Test renderer.
 * @interface
 */
function ITestRenderer() {};
/**
 * @param {string} groupName Group's name.
 */
ITestRenderer.prototype.beginGroup = function(name) {};

ITestRenderer.prototype.endGroup = function() {};

/**
 * @param {boolean} success True if results was successful.
 * @param {string} title Test's title.
 * @param {Object} reason Failure's reason.
 */
ITestRenderer.prototype.showTestResult = function(success, title, reason) {};


/**
 * @constructor
 * @extends {goog.Disposable}
 * @implements {ITestRenderer}
 */
function TreeViewTestRenderer() {
  goog.Disposable.call(this);

  /**
   * @type {TestsResultsTreeView.TreeView}
   * @private
   */
  this.tv_ = new TestsResultsTreeView.TreeView();
  this.registerDisposable(this.tv_);

  /**
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.eventHandler_);

  /**
   * @type {TreeView.TreeNode}
   * @private
   */
  this.currentParent_ = this.tv_;

  /**
   * Number of all tests.
   * @type {number}
   * @private
   */
  this.numOfTests_ = 0;

  /**
   * Number of success tests.
   * @type {number}
   * @private
   */
  this.numOfSuccess_ = 0;

  this.initEvents_();
};
goog.inherits(TreeViewTestRenderer, goog.Disposable);

/**
 * Initializes all event listeners.
 * @private
 */
TreeViewTestRenderer.prototype.initEvents_ = function() {
  this.eventHandler_.listen(
    this.tv_,
    TreeView.TreeView.EventType.NODE_CLICK,
    this.handleNodeClick_
  );
};

/**
 * Handles click on tree view's nodes.
 * @param {goog.events.Event} e Event.
 * @private
 */
TreeViewTestRenderer.prototype.handleNodeClick_ = function(e) {
  var reason = e.node.getReason();

  if (reason) {
    alert(this.getPrettyFailureMessage_(reason) + '\n' + this.getFailureLocation_(reason));
  }
};

/**
 * @param {Object} reason Failure's object.
 * @private
 */
TreeViewTestRenderer.prototype.getFailureLocation_ = function(reason) {
  return reason.where.length ? 'Where: ' + reason.where.map(function(value) { 
    return typeof value === 'string' ? '"' + value + '"' : '[' + value + ']';
  }).join(' &rarr; ') : '';
};

/**
 * @param {Object} reason Failure's object.
 * @private
 */
TreeViewTestRenderer.prototype.getPrettyFailureMessage_ = function(reason) {
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
  default:
    throw new Error('Unrecognized type: ' + reason.type);
  }
};

/**
 * Starts new group.
 * @param {string} name Group's name.
 */
TreeViewTestRenderer.prototype.beginGroup = function(name) {
  var node = new TestsResultsTreeView.TreeNode(name, undefined, this.currentParent_);
  this.currentParent_.addChild(node);
  this.currentParent_ = node;
};

/**
 * Ends currently active group.
 */
TreeViewTestRenderer.prototype.endGroup = function() {
  this.currentParent_ = this.currentParent_.getParentNode();
};

/**
 * @inheritDoc
 */
TreeViewTestRenderer.prototype.showTestResult = function(success, title, reason) {
  var node = new TestsResultsTreeView.TreeNode(title, success, this.currentParent_, reason);
  this.currentParent_.addChild(node);

  this.numOfTests_ += 1;
  success && this.numOfSuccess_++;
};

/**
 * Shows test results.
 */
TreeViewTestRenderer.prototype.show = function() {
  var parentElement = document.body,
      scoreElement = goog.dom.createDom('h2', {'class': 'tv-test-renderer-score'},
        'Score: ' + this.numOfSuccess_ + '/' + this.numOfTests_);

  parentElement.appendChild(scoreElement);
  this.tv_.render(parentElement);
};
