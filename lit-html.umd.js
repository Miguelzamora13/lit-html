(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.litHtml = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.render = render;

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _templateObject = _taggedTemplateLiteral([''], ['']);

    function _taggedTemplateLiteral(strings, raw) {
        return Object.freeze(Object.defineProperties(strings, {
            raw: {
                value: Object.freeze(raw)
            }
        }));
    }

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * TypeScript has a problem with precompiling templates literals
     * https://github.com/Microsoft/TypeScript/issues/17956
     *
     * TODO(justinfagnani): Run tests compiled to ES5 with both Babel and
     * TypeScript to verify correctness.
     */
    var envCachesTemplates = function (t) {
        return t() === t();
    }(function () {
        return function (s) {
            return s;
        }(_templateObject);
    });
    // The first argument to JS template tags retain identity across multiple
    // calls to a tag for the same literal, so we can cache work done per literal
    // in a Map.
    var templates = new Map();
    var svgTemplates = new Map();
    /**
     * Interprets a template literal as an HTML template that can efficiently
     * render to and update a container.
     */
    var html = exports.html = function html(strings) {
        for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            values[_key - 1] = arguments[_key];
        }

        return litTag(strings, values, templates, false);
    };
    /**
     * Interprets a template literal as an SVG template that can efficiently
     * render to and update a container.
     */
    var svg = exports.svg = function svg(strings) {
        for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            values[_key2 - 1] = arguments[_key2];
        }

        return litTag(strings, values, svgTemplates, true);
    };
    function litTag(strings, values, templates, isSvg) {
        var key = envCachesTemplates ? strings : strings.join('{{--uniqueness-workaround--}}');
        var template = templates.get(key);
        if (template === undefined) {
            template = new Template(strings, isSvg);
            templates.set(key, template);
        }
        return new TemplateResult(template, values);
    }
    /**
     * The return type of `html`, which holds a Template and the values from
     * interpolated expressions.
     */

    var TemplateResult = exports.TemplateResult = function TemplateResult(template, values) {
        _classCallCheck(this, TemplateResult);

        this.template = template;
        this.values = values;
    };

    /**
     * Renders a template to a container.
     *
     * To update a container with new values, reevaluate the template literal and
     * call `render` with the new result.
     */
    function render(result, container) {
        var partCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultPartCallback;

        var instance = container.__templateInstance;
        // Repeat render, just call update()
        if (instance !== undefined && instance.template === result.template && instance._partCallback === partCallback) {
            instance.update(result.values);
            return;
        }
        // First render, create a new TemplateInstance and append it
        instance = new TemplateInstance(result.template, partCallback);
        container.__templateInstance = instance;
        var fragment = instance._clone();
        instance.update(result.values);
        removeNodes(container, container.firstChild);
        container.appendChild(fragment);
    }
    /**
     * An expression marker with embedded unique key to avoid
     * https://github.com/PolymerLabs/lit-html/issues/62
     */
    var marker = '{{lit-' + String(Math.random()).slice(2) + '}}';
    var nodeMarker = '<!--' + marker + '-->';
    var markerRegex = new RegExp(marker + '|' + nodeMarker);
    /**
     * This regex extracts the attribute name preceding an attribute-position
     * expression. It does this by matching the syntax allowed for attributes
     * against the string literal directly preceding the expression, assuming that
     * the expression is in an attribute-value position.
     *
     * See attributes in the HTML spec:
     * https://www.w3.org/TR/html5/syntax.html#attributes-0
     *
     * "\0-\x1F\x7F-\x9F" are Unicode control characters
     *
     * " \x09\x0a\x0c\x0d" are HTML space characters:
     * https://www.w3.org/TR/html5/infrastructure.html#space-character
     *
     * So an attribute is:
     *  * The name: any character except a control character, space character, ('),
     *    ("), ">", "=", or "/"
     *  * Followed by zero or more space characters
     *  * Followed by "="
     *  * Followed by zero or more space characters
     *  * Followed by:
     *    * Any character except space, ('), ("), "<", ">", "=", (`), or
     *    * (") then any non-("), or
     *    * (') then any non-(')
     */
    var lastAttributeNameRegex = /[ \x09\x0a\x0c\x0d]([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)[ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*)$/;
    /**
     * Finds the closing index of the last closed HTML tag.
     * This has 3 possible return values:
     *   - `-1`, meaning there is no tag in str.
     *   - `string.length`, meaning the last opened tag is unclosed.
     *   - Some positive number < str.length, meaning the index of the closing '>'.
     */
    function findTagClose(str) {
        var close = str.lastIndexOf('>');
        var open = str.indexOf('<', close + 1);
        return open > -1 ? str.length : close;
    }
    /**
     * A placeholder for a dynamic expression in an HTML template.
     *
     * There are two built-in part types: AttributePart and NodePart. NodeParts
     * always represent a single dynamic expression, while AttributeParts may
     * represent as many expressions are contained in the attribute.
     *
     * A Template's parts are mutable, so parts can be replaced or modified
     * (possibly to implement different template semantics). The contract is that
     * parts can only be replaced, not removed, added or reordered, and parts must
     * always consume the correct number of values in their `update()` method.
     *
     * TODO(justinfagnani): That requirement is a little fragile. A
     * TemplateInstance could instead be more careful about which values it gives
     * to Part.update().
     */

    var TemplatePart = exports.TemplatePart = function TemplatePart(type, index, name, rawName, strings) {
        _classCallCheck(this, TemplatePart);

        this.type = type;
        this.index = index;
        this.name = name;
        this.rawName = rawName;
        this.strings = strings;
    };

    var Template = exports.Template = function () {
        function Template(strings) {
            var svg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            _classCallCheck(this, Template);

            this.parts = [];
            var element = this.element = document.createElement('template');
            element.innerHTML = this._getHtml(strings, svg);
            var content = element.content;
            if (svg) {
                var svgElement = content.firstChild;
                content.removeChild(svgElement);
                reparentNodes(content, svgElement.firstChild);
            }
            // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
            var walker = document.createTreeWalker(content, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
                                                                NodeFilter.SHOW_TEXT */, null, false);
            var index = -1;
            var partIndex = 0;
            var nodesToRemove = [];
            // The actual previous node, accounting for removals: if a node is removed
            // it will never be the previousNode.
            var previousNode = void 0;
            // Used to set previousNode at the top of the loop.
            var currentNode = void 0;
            while (walker.nextNode()) {
                index++;
                previousNode = currentNode;
                var node = currentNode = walker.currentNode;
                if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                        if (!node.hasAttributes()) {
                            continue;
                        }
                        var attributes = node.attributes;
                        // Per https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                        // attributes are not guaranteed to be returned in document order. In
                        // particular, Edge/IE can return them out of order, so we cannot assume
                        // a correspondance between part index and attribute index.
                        var count = 0;
                        for (var i = 0; i < attributes.length; i++) {
                            if (attributes[i].value.indexOf(marker) >= 0) {
                                count++;
                            }
                        }
                        while (count-- > 0) {
                            // Get the template literal section leading up to the first
                            // expression in this attribute attribute
                            var stringForPart = strings[partIndex];
                            // Find the attribute name
                            var attributeNameInPart = lastAttributeNameRegex.exec(stringForPart)[1];
                            // Find the corresponding attribute
                            var attribute = attributes.getNamedItem(attributeNameInPart);
                            var stringsForAttributeValue = attribute.value.split(markerRegex);
                            this.parts.push(new TemplatePart('attribute', index, attribute.name, attributeNameInPart, stringsForAttributeValue));
                            node.removeAttribute(attribute.name);
                            partIndex += stringsForAttributeValue.length - 1;
                        }
                    } else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                        var nodeValue = node.nodeValue;
                        if (nodeValue.indexOf(marker) < 0) {
                            continue;
                        }
                        var parent = node.parentNode;
                        var _strings = nodeValue.split(markerRegex);
                        var lastIndex = _strings.length - 1;
                        // We have a part for each match found
                        partIndex += lastIndex;
                        // We keep this current node, but reset its content to the last
                        // literal part. We insert new literal nodes before this so that the
                        // tree walker keeps its position correctly.
                        node.textContent = _strings[lastIndex];
                        // Generate a new text node for each literal section
                        // These nodes are also used as the markers for node parts
                        for (var _i = 0; _i < lastIndex; _i++) {
                            parent.insertBefore(document.createTextNode(_strings[_i]), node);
                            this.parts.push(new TemplatePart('node', index++));
                        }
                    } else if (node.nodeType === 8 /* Node.COMMENT_NODE */ && node.nodeValue === marker) {
                    var _parent = node.parentNode;
                    // Add a new marker node to be the startNode of the Part if any of the
                    // following are true:
                    //  * We don't have a previousSibling
                    //  * previousSibling is being removed (thus it's not the
                    //    `previousNode`)
                    //  * previousSibling is not a Text node
                    //
                    // TODO(justinfagnani): We should be able to use the previousNode here
                    // as the marker node and reduce the number of extra nodes we add to a
                    // template. See https://github.com/PolymerLabs/lit-html/issues/147
                    var previousSibling = node.previousSibling;
                    if (previousSibling === null || previousSibling !== previousNode || previousSibling.nodeType !== Node.TEXT_NODE) {
                        _parent.insertBefore(document.createTextNode(''), node);
                    } else {
                        index--;
                    }
                    this.parts.push(new TemplatePart('node', index++));
                    nodesToRemove.push(node);
                    // If we don't have a nextSibling add a marker node.
                    // We don't have to check if the next node is going to be removed,
                    // because that node will induce a new marker if so.
                    if (node.nextSibling === null) {
                        _parent.insertBefore(document.createTextNode(''), node);
                    } else {
                        index--;
                    }
                    currentNode = previousNode;
                    partIndex++;
                }
            }
            // Remove text binding nodes after the walk to not disturb the TreeWalker
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = nodesToRemove[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var n = _step.value;

                    n.parentNode.removeChild(n);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
        /**
         * Returns a string of HTML used to create a <template> element.
         */


        _createClass(Template, [{
            key: '_getHtml',
            value: function _getHtml(strings, svg) {
                var l = strings.length - 1;
                var html = '';
                var isTextBinding = true;
                for (var i = 0; i < l; i++) {
                    var s = strings[i];
                    html += s;
                    // We're in a text position if the previous string closed its tags.
                    // If it doesn't have any tags, then we use the previous text position
                    // state.
                    var closing = findTagClose(s);
                    isTextBinding = closing > -1 ? closing < s.length : isTextBinding;
                    html += isTextBinding ? nodeMarker : marker;
                }
                html += strings[l];
                return svg ? '<svg>' + html + '</svg>' : html;
            }
        }]);

        return Template;
    }();

    /**
     * Returns a value ready to be inserted into a Part from a user-provided value.
     *
     * If the user value is a directive, this invokes the directive with the given
     * part. If the value is null, it's converted to undefined to work better
     * with certain DOM APIs, like textContent.
     */
    var getValue = exports.getValue = function getValue(part, value) {
        // `null` as the value of a Text node will render the string 'null'
        // so we convert it to undefined
        if (isDirective(value)) {
            value = value(part);
            return directiveValue;
        }
        return value === null ? undefined : value;
    };
    var directive = exports.directive = function directive(f) {
        f.__litDirective = true;
        return f;
    };
    var isDirective = function isDirective(o) {
        return typeof o === 'function' && o.__litDirective === true;
    };
    var directiveValue = {};

    var AttributePart = exports.AttributePart = function () {
        function AttributePart(instance, element, name, strings) {
            _classCallCheck(this, AttributePart);

            this.instance = instance;
            this.element = element;
            this.name = name;
            this.strings = strings;
            this.size = strings.length - 1;
        }

        _createClass(AttributePart, [{
            key: '_interpolate',
            value: function _interpolate(values, startIndex) {
                var strings = this.strings;
                var l = strings.length - 1;
                var text = '';
                for (var i = 0; i < l; i++) {
                    text += strings[i];
                    var v = getValue(this, values[startIndex + i]);
                    if (v && v !== directiveValue && (Array.isArray(v) || typeof v !== 'string' && v[Symbol.iterator])) {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = v[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var t = _step2.value;

                                // TODO: we need to recursively call getValue into iterables...
                                text += t;
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    } else {
                        text += v;
                    }
                }
                return text + strings[l];
            }
        }, {
            key: 'setValue',
            value: function setValue(values, startIndex) {
                var text = this._interpolate(values, startIndex);
                this.element.setAttribute(this.name, text);
            }
        }]);

        return AttributePart;
    }();

    var NodePart = exports.NodePart = function () {
        function NodePart(instance, startNode, endNode) {
            _classCallCheck(this, NodePart);

            this.instance = instance;
            this.startNode = startNode;
            this.endNode = endNode;
            this._previousValue = undefined;
        }

        _createClass(NodePart, [{
            key: 'setValue',
            value: function setValue(value) {
                value = getValue(this, value);
                if (value === directiveValue) {
                    return;
                }
                if (value === null || !((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' || typeof value === 'function')) {
                    // Handle primitive values
                    // If the value didn't change, do nothing
                    if (value === this._previousValue) {
                        return;
                    }
                    this._setText(value);
                } else if (value instanceof TemplateResult) {
                    this._setTemplateResult(value);
                } else if (Array.isArray(value) || value[Symbol.iterator]) {
                    this._setIterable(value);
                } else if (value instanceof Node) {
                    this._setNode(value);
                } else if (value.then !== undefined) {
                    this._setPromise(value);
                } else {
                    // Fallback, will render the string representation
                    this._setText(value);
                }
            }
        }, {
            key: '_insert',
            value: function _insert(node) {
                this.endNode.parentNode.insertBefore(node, this.endNode);
            }
        }, {
            key: '_setNode',
            value: function _setNode(value) {
                if (this._previousValue === value) {
                    return;
                }
                this.clear();
                this._insert(value);
                this._previousValue = value;
            }
        }, {
            key: '_setText',
            value: function _setText(value) {
                var node = this.startNode.nextSibling;
                value = value === undefined ? '' : value;
                if (node === this.endNode.previousSibling && node.nodeType === Node.TEXT_NODE) {
                    // If we only have a single text node between the markers, we can just
                    // set its value, rather than replacing it.
                    // TODO(justinfagnani): Can we just check if _previousValue is
                    // primitive?
                    node.textContent = value;
                } else {
                    this._setNode(document.createTextNode(value));
                }
                this._previousValue = value;
            }
        }, {
            key: '_setTemplateResult',
            value: function _setTemplateResult(value) {
                var instance = void 0;
                if (this._previousValue && this._previousValue.template === value.template) {
                    instance = this._previousValue;
                } else {
                    instance = new TemplateInstance(value.template, this.instance._partCallback);
                    this._setNode(instance._clone());
                    this._previousValue = instance;
                }
                instance.update(value.values);
            }
        }, {
            key: '_setIterable',
            value: function _setIterable(value) {
                // For an Iterable, we create a new InstancePart per item, then set its
                // value to the item. This is a little bit of overhead for every item in
                // an Iterable, but it lets us recurse easily and efficiently update Arrays
                // of TemplateResults that will be commonly returned from expressions like:
                // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
                // If _previousValue is an array, then the previous render was of an
                // iterable and _previousValue will contain the NodeParts from the previous
                // render. If _previousValue is not an array, clear this part and make a new
                // array for NodeParts.
                if (!Array.isArray(this._previousValue)) {
                    this.clear();
                    this._previousValue = [];
                }
                // Lets us keep track of how many items we stamped so we can clear leftover
                // items from a previous render
                var itemParts = this._previousValue;
                var partIndex = 0;
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = value[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var item = _step3.value;

                        // Try to reuse an existing part
                        var itemPart = itemParts[partIndex];
                        // If no existing part, create a new one
                        if (itemPart === undefined) {
                            // If we're creating the first item part, it's startNode should be the
                            // container's startNode
                            var itemStart = this.startNode;
                            // If we're not creating the first part, create a new separator marker
                            // node, and fix up the previous part's endNode to point to it
                            if (partIndex > 0) {
                                var previousPart = itemParts[partIndex - 1];
                                itemStart = previousPart.endNode = document.createTextNode('');
                                this._insert(itemStart);
                            }
                            itemPart = new NodePart(this.instance, itemStart, this.endNode);
                            itemParts.push(itemPart);
                        }
                        itemPart.setValue(item);
                        partIndex++;
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                if (partIndex === 0) {
                    this.clear();
                    this._previousValue = undefined;
                } else if (partIndex < itemParts.length) {
                    var lastPart = itemParts[partIndex - 1];
                    // Truncate the parts array so _previousValue reflects the current state
                    itemParts.length = partIndex;
                    this.clear(lastPart.endNode.previousSibling);
                    lastPart.endNode = this.endNode;
                }
            }
        }, {
            key: '_setPromise',
            value: function _setPromise(value) {
                var _this = this;

                this._previousValue = value;
                value.then(function (v) {
                    if (_this._previousValue === value) {
                        _this.setValue(v);
                    }
                });
            }
        }, {
            key: 'clear',
            value: function clear() {
                var startNode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.startNode;

                removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
            }
        }]);

        return NodePart;
    }();

    var defaultPartCallback = exports.defaultPartCallback = function defaultPartCallback(instance, templatePart, node) {
        if (templatePart.type === 'attribute') {
            return new AttributePart(instance, node, templatePart.name, templatePart.strings);
        } else if (templatePart.type === 'node') {
            return new NodePart(instance, node, node.nextSibling);
        }
        throw new Error('Unknown part type ' + templatePart.type);
    };
    /**
     * An instance of a `Template` that can be attached to the DOM and updated
     * with new values.
     */

    var TemplateInstance = exports.TemplateInstance = function () {
        function TemplateInstance(template) {
            var partCallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultPartCallback;

            _classCallCheck(this, TemplateInstance);

            this._parts = [];
            this.template = template;
            this._partCallback = partCallback;
        }

        _createClass(TemplateInstance, [{
            key: 'update',
            value: function update(values) {
                var valueIndex = 0;
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = this._parts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var part = _step4.value;

                        if (part.size === undefined) {
                            part.setValue(values[valueIndex]);
                            valueIndex++;
                        } else {
                            part.setValue(values, valueIndex);
                            valueIndex += part.size;
                        }
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }
            }
        }, {
            key: '_clone',
            value: function _clone() {
                var fragment = document.importNode(this.template.element.content, true);
                var parts = this.template.parts;
                if (parts.length > 0) {
                    // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
                    // null
                    var _walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
                                                                          NodeFilter.SHOW_TEXT */, null, false);
                    var _index = -1;
                    for (var i = 0; i < parts.length; i++) {
                        var part = parts[i];
                        while (_index < part.index) {
                            _index++;
                            _walker.nextNode();
                        }
                        this._parts.push(this._partCallback(this, part, _walker.currentNode));
                    }
                }
                return fragment;
            }
        }]);

        return TemplateInstance;
    }();

    /**
     * Reparents nodes, starting from `startNode` (inclusive) to `endNode`
     * (exclusive), into another container (could be the same container), before
     * `beforeNode`. If `beforeNode` is null, it appends the nodes to the
     * container.
     */
    var reparentNodes = exports.reparentNodes = function reparentNodes(container, start) {
        var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var before = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        var node = start;
        while (node !== end) {
            var n = node.nextSibling;
            container.insertBefore(node, before);
            node = n;
        }
    };
    /**
     * Removes nodes, starting from `startNode` (inclusive) to `endNode`
     * (exclusive), from `container`.
     */
    var removeNodes = exports.removeNodes = function removeNodes(container, startNode) {
        var endNode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        var node = startNode;
        while (node !== endNode) {
            var n = node.nextSibling;
            container.removeChild(node);
            node = n;
        }
    };
});
