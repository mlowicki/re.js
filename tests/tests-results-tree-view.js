goog.provide('TestsResultsTreeView.TreeView');


/** 
 * Tree view's node which represnts unit test results or group of unit tests.
 * @param {string} name Node's name.
 * @param {boolean=} opt_success True if test was successeful, false otherwise.
 * @param {TreeView.Node=} opt_parentNode Parent node.
 * @param {Object=} opt_reason Failure's reason.
 * @extends {TreeView.TreeNode}
 * @constructor
 */
TestsResultsTreeView.TreeNode = function(name, opt_success, opt_parentNode, opt_reason) {
  TreeView.TreeNode.call(this, name, opt_parentNode);

  /**
   * True if test results was succuesful or if it's group's node all its children are successful.
   * @type {?boolean}
   * @private
   */
  this.success_ = opt_success;

  /**
   * Failure's reason.
   * @type {?Object}
   */
  this.reason_ = opt_reason || null;
};
goog.inherits(TestsResultsTreeView.TreeNode, TreeView.TreeNode);

/**
 * @return {boolean|undefined} True if node represents successful test.
 */
TestsResultsTreeView.TreeNode.prototype.isSuccess = function() {
  return this.success_;
};

/**
 * @return {?Object} Failure's reason.
 */
TestsResultsTreeView.TreeNode.prototype.getReason = function() {
  return this.reason_;
};

/**
 * @inheritDoc
 */
TestsResultsTreeView.TreeNode.prototype.render = function(opt_container) {
  TreeView.TreeNode.prototype.render.call(this, opt_container);

  var success = true;

  if (goog.isDef(this.success_)) {
    success = this.success_;
  }
  else {
    success = goog.array.every(this.children_, function(child) {
      return /** @type {boolean} */child.isSuccess();
    });  

    this.success_ = success; 
  }

  goog.dom.classes.add(this.nameElement_, success ? 'success' : 'failure');
};

TestsResultsTreeView.TreeView = function() {
  TreeView.TreeView.call(this);
};
goog.inherits(TestsResultsTreeView.TreeView, TreeView.TreeView);
