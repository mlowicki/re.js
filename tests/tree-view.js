goog.provide('TreeView.TreeNode');
goog.provide('TreeView.TreeView');


/** 
 * Tree view's node.
 * @param {string} name Node's name.
 * @param {TreeView.Node=} opt_parentNode Parent node.
 * @constructor
 * @extends {goog.Disposable}
 */
TreeView.TreeNode = function(name, opt_parentNode) {
  goog.events.EventTarget.call(this);

  /**
   * @type {TreeView.Node.prototype.STATE}
   * @private
   */
  this.state_ = this.STATE.COLLAPSED;

  /**
   * Node's name.
   * @type {string}
   * @private
   */
  this.name_ = name;

  /**
   * Parent node.
   * @type {?TreeView.Node}
   * @private
   */
  this.parentNode_ = opt_parentNode;

  /**
   * Node's root element.
   * @type {Element}
   * @private
   */
  this.element_;

  /**
   * List of children nodes.
   * @type {Array}
   * @private
   */
  this.children_ = [];
};
goog.inherits(TreeView.TreeNode, goog.events.EventTarget);

/** @override */
TreeView.TreeNode.prototype.disposeInternal = function() {
  goog.events.EventTarget.prototype.disposeInternal.call(this);

  goog.array.forEach(this.children_, function(child) {
    child.dispose();
  });

  goog.isDef(this.element_) && goog.dom.removeChildren(this.element_);
};

/**
 * @return {TreeView.Node|undefined} Node's parent node.
 */
TreeView.TreeNode.prototype.getParentNode = function() {
  return this.parentNode_;
};

/**
 * Set node's parent node.
 * @param {TreeView.Node} parentNode parent node.
 */
TreeView.TreeNode.prototype.setParentNode = function(parentNode) {
  this.parentNode_ = parentNode;
};

/**
 * Returns container for node's child nodes.
 * @return {?Element} Node's element for children nodes.
 */
TreeView.TreeNode.prototype.getChildrenElement = function() {
  return this.childrenElement_;
};

/**
 * Returns node's element if it was already rendered.
 * @return {?Element} Node's root element.
 */
TreeView.TreeNode.prototype.getElement = function() {
  return this.element_;
};

/**
 * Creates toggler if necessary.
 * @private
 */
TreeView.TreeNode.prototype.maybeCreateToggler_ = function() {
  goog.asserts.assert(this.element_, 'Node hasn\'t been rednered yet');

  if (!this.toggler_ && this.children_.length) {
    this.toggler_ = document.createElement('span');
    this.toggler_.className = 'tv-toggler';
    this.element_.appendChild(this.toggler_);
  }
};

/**
 * Creates box for children nodes if necessary.
 * @private
 */
TreeView.TreeNode.prototype.maybeCreateChildrenBox_ = function() {
  goog.asserts.assert(this.element_, 'Node hasn\'t been rednered yet');

  if (!this.childrenElement_ && this.children_.length) {
    this.childrenElement_ = document.createElement('div');
    this.childrenElement_.className = 'tv-children';
    this.element_.appendChild(this.childrenElement_);
  }
};

/**
 * Creates node's name element.
 * @private
 */
TreeView.TreeNode.prototype.createNameElement_ = function() {
  goog.asserts.assert(this.element_, 'Node hasn\'t been rednered yet');

  this.nameElement_ = document.createElement('span');
  this.nameElement_.className = 'tv-name';
  this.nameElement_.innerHTML = this.name_;
  this.element_.appendChild(this.nameElement_);
};

/**
 * Renders node.
 * @param {Element=} opt_container Element where to put rendered node.
 */
TreeView.TreeNode.prototype.render = function(opt_container) {
  if (!goog.isDef(opt_container) && !goog.isDef(this.parentNode_)) {
    throw new Error('Parent node or container has to be set');
  }

  this.element_ = document.createElement('div');
  this.element_.className = 'tv-node';
  
  this.maybeCreateToggler_();
  this.createNameElement_();
  this.maybeCreateChildrenBox_();
  this.children_.forEach(function(child) {
    child.render();
  });
  this.recalcCSSClasses_();
  (!goog.isDef(opt_container) ? this.parentNode_.getChildrenElement() : opt_container).appendChild(this.element_);
  TreeView.Manager.registerNode(this);
};

/**
 * Node's states.
 * @enum {string}
 */
TreeView.TreeNode.prototype.STATE = {
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed'
};

/**
 * Adds new child to node.
 * @param {TreeView.Node} child
 */
TreeView.TreeNode.prototype.addChild = function(child) {
  child.setParentNode(this);
  this.children_.push(child);
};

/**
 * Recalcutes which CSS classes should be attached to node's root element.
 * @private
 */
TreeView.TreeNode.prototype.recalcCSSClasses_ = function() {
  if (this.state_ === this.STATE.EXPANDED) {
    goog.dom.classes.add(this.element_, 'tv-node-expanded');
  }
  else {
    goog.dom.classes.remove(this.element_, 'tv-node-expanded');
  }
};

/**
 * Expandes node.
 */
TreeView.TreeNode.prototype.expand = function() {
  this.state_ = this.STATE.EXPANDED;
  this.recalcCSSClasses_();
};

/**
 * Collapses node.
 */
TreeView.TreeNode.prototype.collapse = function() {
  this.state_ = this.STATE.COLLAPSED;
  this.recalcCSSClasses_();
};

/**
 * Toggles node's state.
 */
TreeView.TreeNode.prototype.toggle = function() {
  if (this.state_ === this.STATE.EXPANDED) {
    this.collapse();
  }
  else {
    this.expand();
  }
};


/**
 * Tree view class.
 * @param {string} name Node's name.
 * @constructor
 * @extends {TreeView.TreeNode}
 */
TreeView.TreeView = function(name) {
  TreeView.TreeNode.call(this, name);
};
goog.inherits(TreeView.TreeView, TreeView.TreeNode);

/** @override */
TreeView.TreeView.prototype.disposeInternal = function() {
  TreeView.TreeNode.prototype.disposeInternal.call(this);

  goog.events.unlisten(
    this.element_,
    goog.events.EventType.CLICK,
    this.handleClick_,
    false,
    this
  );
};

/**
 * @enum {string}
 */
TreeView.TreeView.EventType = {
  NODE_CLICK: 'node click'
};

/**
 * Renders tree view.
 * @param {Element} container Container element.
 */
TreeView.TreeView.prototype.render = function(container) {
  this.element_ = document.createElement('div');
  this.element_.className = 'tv';
  this.maybeCreateChildrenBox_();
  this.children_.forEach(function(child) {
    child.render();
  });

  goog.events.listen(
    this.element_,
    goog.events.EventType.CLICK,
    this.handleClick_,
    false,
    this
  );

  container.appendChild(this.element_);
};

/**
 * Handles click on tree view's element.
 * @type {goog.events.Event} e Event.
 * @private
 */
TreeView.TreeView.prototype.handleClick_ = function(e) {
  var target = e.target;

  if (goog.dom.classes.has(target, 'tv-toggler')) {
    var node = TreeView.Manager.getNodeById(target.parentNode.id); 
    node && node.toggle();
  }
  else if (goog.dom.classes.has(target, 'tv-name')) {
    this.dispatchEvent({
      type: TreeView.TreeView.EventType.NODE_CLICK,
      node: TreeView.Manager.getNodeById(target.parentNode.id)
    });
  }
};

/**
 * Tree view manager.
 * @static
 */
TreeView.Manager = {
  /**
   * Register new tree view's node.
   * @param {TreeView.TreeNode} node Tree node.
   */
  registerNode: function(node) {
    var id = this.idGen_.getNextUniqueId();
    node.getElement().id = id;
    this.map_.set(id, node); 
  },
  /**
   * Returns tree view's node by specified id.
   * @param {string} id Node's id.
   * @return {TreeView.TreeNode|undefined}
   */
  getNodeById: function(id) {
    return this.map_.get(id);
  },
  /**
   * Identifier generator used for tree view's nodes.
   * @type {goog.ui.IdGenerator}
   * @private
   */
  idGen_: new goog.ui.IdGenerator(),
  /**
   * Maps identifiers to tree view's nodes.
   * @type {goog.structs.Map}
   * @private
   */
  map_: new goog.structs.Map()
};
