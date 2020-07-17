"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Data = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _classPrivateFieldGet2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldGet"));

var _classPrivateFieldSet2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldSet"));

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

var _require = require('./helpers'),
    clone = _require.clone;

var yesNoList = {
  name: '__yesNo',
  title: 'Yes/No',
  type: 'boolean',
  items: [{
    text: 'Yes',
    value: true
  }, {
    text: 'No',
    value: false
  }]
};

var _conditions = new WeakMap();

var _listInputsFor = new WeakSet();

var Data = /*#__PURE__*/function () {
  function Data(rawData) {
    (0, _classCallCheck2["default"])(this, Data);

    _listInputsFor.add(this);

    _conditions.set(this, {
      writable: true,
      value: void 0
    });

    var rawDataClone = Object.assign({}, rawData);
    delete rawDataClone.conditions;
    Object.assign(this, rawDataClone);
    (0, _classPrivateFieldSet2["default"])(this, _conditions, (rawData.conditions || []).map(function (it) {
      return new Condition(it);
    }));
  }
  /* eslint-disable-next-line */


  (0, _createClass2["default"])(Data, [{
    key: "allInputs",
    value: function allInputs() {
      var _this = this;

      var inputs = (this.pages || []).flatMap(function (page) {
        return (page.components || []).filter(function (component) {
          return component.name;
        }).flatMap(function (it) {
          return [new Input(it, page)].concat(_classPrivateMethodGet(_this, _listInputsFor, _listInputsFor2).call(_this, page, it));
        });
      });
      var names = new Set();
      return inputs.filter(function (input) {
        var isPresent = !names.has(input.propertyPath);
        names.add(input.propertyPath);
        return isPresent;
      });
    }
  }, {
    key: "inputsAccessibleAt",
    value: function inputsAccessibleAt(path) {
      var precedingPages = this._allPathsLeadingTo(path);

      return this.allInputs().filter(function (it) {
        return precedingPages.includes(it.page.path) || path === it.page.path;
      });
    }
  }, {
    key: "findPage",
    value: function findPage(path) {
      return this.getPages().find(function (p) {
        return p.path === path;
      });
    }
  }, {
    key: "addLink",
    value: function addLink(from, to, condition) {
      var fromPage = this.pages.find(function (p) {
        return p.path === from;
      });
      var toPage = this.pages.find(function (p) {
        return p.path === to;
      });

      if (fromPage && toPage) {
        var _fromPage$next;

        var existingLink = (_fromPage$next = fromPage.next) === null || _fromPage$next === void 0 ? void 0 : _fromPage$next.find(function (it) {
          return it.path === to;
        });

        if (!existingLink) {
          var link = {
            path: to
          };

          if (condition) {
            link.condition = condition;
          }

          fromPage.next = fromPage.next || [];
          fromPage.next.push(link);
        }
      }

      return this;
    }
  }, {
    key: "updateLink",
    value: function updateLink(from, to, condition) {
      var fromPage = this.findPage(from);
      var toPage = this.pages.find(function (p) {
        return p.path === to;
      });

      if (fromPage && toPage) {
        var _fromPage$next2;

        var existingLink = (_fromPage$next2 = fromPage.next) === null || _fromPage$next2 === void 0 ? void 0 : _fromPage$next2.find(function (it) {
          return it.path === to;
        });

        if (existingLink) {
          if (condition) {
            existingLink.condition = condition;
          } else {
            delete existingLink.condition;
          }
        }
      }

      return this;
    }
  }, {
    key: "addPage",
    value: function addPage(page) {
      this.pages = this.pages || [];
      this.pages.push(page);
      return this;
    }
  }, {
    key: "getPages",
    value: function getPages() {
      return this.pages || [];
    }
  }, {
    key: "listFor",
    value: function listFor(input) {
      return (this.lists || []).find(function (it) {
        return it.name === (input.options || {}).list;
      }) || (input.type === 'YesNoField' ? yesNoList : undefined);
    }
  }, {
    key: "_allPathsLeadingTo",
    value: function _allPathsLeadingTo(path) {
      var _this2 = this;

      return (this.pages || []).filter(function (page) {
        return page.next && page.next.find(function (next) {
          return next.path === path;
        });
      }).flatMap(function (page) {
        return [page.path].concat(_this2._allPathsLeadingTo(page.path));
      });
    }
  }, {
    key: "addCondition",
    value: function addCondition(name, displayName, value) {
      (0, _classPrivateFieldSet2["default"])(this, _conditions, (0, _classPrivateFieldGet2["default"])(this, _conditions) || []);

      if ((0, _classPrivateFieldGet2["default"])(this, _conditions).find(function (it) {
        return it.name === name;
      })) {
        throw Error("A condition already exists with name ".concat(name));
      }

      (0, _classPrivateFieldGet2["default"])(this, _conditions).push({
        name: name,
        displayName: displayName,
        value: value
      });
      return this;
    }
  }, {
    key: "updateCondition",
    value: function updateCondition(name, displayName, value) {
      var condition = (0, _classPrivateFieldGet2["default"])(this, _conditions).find(function (condition) {
        return condition.name === name;
      });

      if (condition) {
        condition.displayName = displayName;
        condition.value = value;
      }

      return this;
    }
  }, {
    key: "removeCondition",
    value: function removeCondition(name) {
      var condition = this.findCondition(name);

      if (condition) {
        (0, _classPrivateFieldGet2["default"])(this, _conditions).splice((0, _classPrivateFieldGet2["default"])(this, _conditions).findIndex(function (condition) {
          return condition.name === name;
        }), 1); // Update any references to the condition

        this.getPages().forEach(function (p) {
          Array.isArray(p.next) && p.next.forEach(function (n) {
            if (n["if"] === name) {
              delete n["if"];
            }
          });
        });
      }

      return this;
    }
  }, {
    key: "findCondition",
    value: function findCondition(name) {
      return this.conditions.find(function (condition) {
        return condition.name === name;
      });
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Data(this._exposePrivateFields());
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      var withoutFunctions = Object.filter(this._exposePrivateFields(), function (field) {
        return typeof field !== 'function';
      });
      return Object.assign({}, withoutFunctions);
    }
  }, {
    key: "_exposePrivateFields",
    value: function _exposePrivateFields() {
      var toSerialize = Object.assign({}, this);
      toSerialize.conditions = this.conditions.map(function (it) {
        return clone(it);
      });
      return toSerialize;
    }
  }, {
    key: "hasConditions",
    get: function get() {
      return this.conditions.length > 0;
    }
  }, {
    key: "conditions",
    get: function get() {
      return (0, _classPrivateFieldGet2["default"])(this, _conditions).map(function (it) {
        return clone(it);
      });
    }
  }]);
  return Data;
}();

exports.Data = Data;

var _listInputsFor2 = function _listInputsFor2(page, input) {
  var list = this.listFor(input);
  return list ? list.items.flatMap(function (listItem) {
    var _listItem$conditional, _listItem$conditional2, _listItem$conditional3, _listItem$conditional4;

    return (_listItem$conditional = (_listItem$conditional2 = listItem.conditional) === null || _listItem$conditional2 === void 0 ? void 0 : (_listItem$conditional3 = _listItem$conditional2.components) === null || _listItem$conditional3 === void 0 ? void 0 : (_listItem$conditional4 = _listItem$conditional3.filter(function (it) {
      return it.name;
    })) === null || _listItem$conditional4 === void 0 ? void 0 : _listItem$conditional4.map(function (it) {
      return new Input(it, page, listItem.text);
    })) !== null && _listItem$conditional !== void 0 ? _listItem$conditional : [];
  }) : [];
};

Object.filter = function (obj, predicate) {
  var result = {};
  var key;

  for (key in obj) {
    if (obj[key] && predicate(obj[key])) {
      result[key] = obj[key];
    }
  }

  return result;
};

var _parentItemName = new WeakMap();

var Input = /*#__PURE__*/function () {
  function Input(rawData, page, parentItemName) {
    (0, _classCallCheck2["default"])(this, Input);

    _parentItemName.set(this, {
      writable: true,
      value: void 0
    });

    Object.assign(this, rawData);
    var myPage = clone(page);
    delete myPage.components;
    this.page = myPage;
    this.propertyPath = page.section ? "".concat(page.section, ".").concat(this.name) : this.name;
    (0, _classPrivateFieldSet2["default"])(this, _parentItemName, parentItemName);
  }

  (0, _createClass2["default"])(Input, [{
    key: "displayName",
    get: function get() {
      var titleWithContext = (0, _classPrivateFieldGet2["default"])(this, _parentItemName) ? "".concat(this.title, " under ").concat((0, _classPrivateFieldGet2["default"])(this, _parentItemName)) : this.title;
      return this.page.section ? "".concat(titleWithContext, " in ").concat(this.page.section) : titleWithContext;
    }
  }]);
  return Input;
}();

var Condition = function Condition(rawData) {
  (0, _classCallCheck2["default"])(this, Condition);
  Object.assign(this, rawData);
  this.displayName = rawData.displayName || rawData.name;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kYXRhLW1vZGVsLmpzIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJjbG9uZSIsInllc05vTGlzdCIsIm5hbWUiLCJ0aXRsZSIsInR5cGUiLCJpdGVtcyIsInRleHQiLCJ2YWx1ZSIsIkRhdGEiLCJyYXdEYXRhIiwicmF3RGF0YUNsb25lIiwiT2JqZWN0IiwiYXNzaWduIiwiY29uZGl0aW9ucyIsIm1hcCIsIml0IiwiQ29uZGl0aW9uIiwiaW5wdXRzIiwicGFnZXMiLCJmbGF0TWFwIiwicGFnZSIsImNvbXBvbmVudHMiLCJmaWx0ZXIiLCJjb21wb25lbnQiLCJJbnB1dCIsImNvbmNhdCIsIm5hbWVzIiwiU2V0IiwiaW5wdXQiLCJpc1ByZXNlbnQiLCJoYXMiLCJwcm9wZXJ0eVBhdGgiLCJhZGQiLCJwYXRoIiwicHJlY2VkaW5nUGFnZXMiLCJfYWxsUGF0aHNMZWFkaW5nVG8iLCJhbGxJbnB1dHMiLCJpbmNsdWRlcyIsImdldFBhZ2VzIiwiZmluZCIsInAiLCJmcm9tIiwidG8iLCJjb25kaXRpb24iLCJmcm9tUGFnZSIsInRvUGFnZSIsImV4aXN0aW5nTGluayIsIm5leHQiLCJsaW5rIiwicHVzaCIsImZpbmRQYWdlIiwibGlzdHMiLCJvcHRpb25zIiwibGlzdCIsInVuZGVmaW5lZCIsImRpc3BsYXlOYW1lIiwiRXJyb3IiLCJmaW5kQ29uZGl0aW9uIiwic3BsaWNlIiwiZmluZEluZGV4IiwiZm9yRWFjaCIsIkFycmF5IiwiaXNBcnJheSIsIm4iLCJfZXhwb3NlUHJpdmF0ZUZpZWxkcyIsIndpdGhvdXRGdW5jdGlvbnMiLCJmaWVsZCIsInRvU2VyaWFsaXplIiwibGVuZ3RoIiwibGlzdEZvciIsImxpc3RJdGVtIiwiY29uZGl0aW9uYWwiLCJvYmoiLCJwcmVkaWNhdGUiLCJyZXN1bHQiLCJrZXkiLCJwYXJlbnRJdGVtTmFtZSIsIm15UGFnZSIsInNlY3Rpb24iLCJ0aXRsZVdpdGhDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7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ZXNDb250ZW50IjpbImNvbnN0IHsgY2xvbmUgfSA9IHJlcXVpcmUoJy4vaGVscGVycycpXG5cbmNvbnN0IHllc05vTGlzdCA9IHtcbiAgbmFtZTogJ19feWVzTm8nLFxuICB0aXRsZTogJ1llcy9ObycsXG4gIHR5cGU6ICdib29sZWFuJyxcbiAgaXRlbXM6IFtcbiAgICB7XG4gICAgICB0ZXh0OiAnWWVzJyxcbiAgICAgIHZhbHVlOiB0cnVlXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiAnTm8nLFxuICAgICAgdmFsdWU6IGZhbHNlXG4gICAgfVxuICBdXG59XG5cbmV4cG9ydCBjbGFzcyBEYXRhIHtcbiAgI2NvbmRpdGlvbnNcblxuICBjb25zdHJ1Y3RvciAocmF3RGF0YSkge1xuICAgIGNvbnN0IHJhd0RhdGFDbG9uZSA9IE9iamVjdC5hc3NpZ24oe30sIHJhd0RhdGEpXG4gICAgZGVsZXRlIHJhd0RhdGFDbG9uZS5jb25kaXRpb25zXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCByYXdEYXRhQ2xvbmUpXG4gICAgdGhpcy4jY29uZGl0aW9ucyA9IChyYXdEYXRhLmNvbmRpdGlvbnMgfHwgW10pLm1hcChpdCA9PiBuZXcgQ29uZGl0aW9uKGl0KSlcbiAgfVxuICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgKi9cbiAgI2xpc3RJbnB1dHNGb3IocGFnZSwgaW5wdXQpIHtcbiAgICBjb25zdCBsaXN0ID0gdGhpcy5saXN0Rm9yKGlucHV0KTtcbiAgICByZXR1cm4gbGlzdCA/IGxpc3QuaXRlbXMuZmxhdE1hcChsaXN0SXRlbSA9Pmxpc3RJdGVtLmNvbmRpdGlvbmFsPy5jb21wb25lbnRzXG4gICAgICAgID8uZmlsdGVyKGl0ID0+IGl0Lm5hbWUpXG4gICAgICAgID8ubWFwKGl0ID0+IG5ldyBJbnB1dChpdCwgcGFnZSwgbGlzdEl0ZW0udGV4dCkpPz9bXSkgOiBbXVxuICB9XG5cbiAgYWxsSW5wdXRzICgpIHtcbiAgICBjb25zdCBpbnB1dHMgPSAodGhpcy5wYWdlcyB8fCBbXSlcbiAgICAgIC5mbGF0TWFwKHBhZ2UgPT4gKHBhZ2UuY29tcG9uZW50cyB8fCBbXSlcbiAgICAgICAgLmZpbHRlcihjb21wb25lbnQgPT4gY29tcG9uZW50Lm5hbWUpXG4gICAgICAgIC5mbGF0TWFwKGl0ID0+IFtuZXcgSW5wdXQoaXQsIHBhZ2UpXS5jb25jYXQodGhpcy4jbGlzdElucHV0c0ZvcihwYWdlLCBpdCkpKVxuICAgICAgKVxuICAgIGNvbnN0IG5hbWVzID0gbmV3IFNldCgpXG4gICAgcmV0dXJuIGlucHV0cy5maWx0ZXIoaW5wdXQgPT4ge1xuICAgICAgY29uc3QgaXNQcmVzZW50ID0gIW5hbWVzLmhhcyhpbnB1dC5wcm9wZXJ0eVBhdGgpXG4gICAgICBuYW1lcy5hZGQoaW5wdXQucHJvcGVydHlQYXRoKVxuICAgICAgcmV0dXJuIGlzUHJlc2VudFxuICAgIH0pXG4gIH1cblxuICBpbnB1dHNBY2Nlc3NpYmxlQXQgKHBhdGgpIHtcbiAgICBjb25zdCBwcmVjZWRpbmdQYWdlcyA9IHRoaXMuX2FsbFBhdGhzTGVhZGluZ1RvKHBhdGgpXG4gICAgcmV0dXJuIHRoaXMuYWxsSW5wdXRzKCkuZmlsdGVyKGl0ID0+IHByZWNlZGluZ1BhZ2VzLmluY2x1ZGVzKGl0LnBhZ2UucGF0aCkgfHwgcGF0aCA9PT0gaXQucGFnZS5wYXRoKVxuICB9XG5cbiAgZmluZFBhZ2UgKHBhdGgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYWdlcygpLmZpbmQocCA9PiBwLnBhdGggPT09IHBhdGgpXG4gIH1cblxuICBhZGRMaW5rIChmcm9tLCB0bywgY29uZGl0aW9uKSB7XG4gICAgY29uc3QgZnJvbVBhZ2UgPSB0aGlzLnBhZ2VzLmZpbmQocCA9PiBwLnBhdGggPT09IGZyb20pXG4gICAgY29uc3QgdG9QYWdlID0gdGhpcy5wYWdlcy5maW5kKHAgPT4gcC5wYXRoID09PSB0bylcbiAgICBpZiAoZnJvbVBhZ2UgJiYgdG9QYWdlKSB7XG4gICAgICBjb25zdCBleGlzdGluZ0xpbmsgPSBmcm9tUGFnZS5uZXh0Py5maW5kKGl0ID0+IGl0LnBhdGggPT09IHRvKVxuICAgICAgaWYgKCFleGlzdGluZ0xpbmspIHtcbiAgICAgICAgY29uc3QgbGluayA9IHsgcGF0aDogdG8gfVxuICAgICAgICBpZiAoY29uZGl0aW9uKSB7XG4gICAgICAgICAgbGluay5jb25kaXRpb24gPSBjb25kaXRpb25cbiAgICAgICAgfVxuXG4gICAgICAgIGZyb21QYWdlLm5leHQgPSBmcm9tUGFnZS5uZXh0IHx8IFtdXG4gICAgICAgIGZyb21QYWdlLm5leHQucHVzaChsaW5rKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdXBkYXRlTGluayAoZnJvbSwgdG8sIGNvbmRpdGlvbikge1xuICAgIGNvbnN0IGZyb21QYWdlID0gdGhpcy5maW5kUGFnZShmcm9tKVxuICAgIGNvbnN0IHRvUGFnZSA9IHRoaXMucGFnZXMuZmluZChwID0+IHAucGF0aCA9PT0gdG8pXG4gICAgaWYgKGZyb21QYWdlICYmIHRvUGFnZSkge1xuICAgICAgY29uc3QgZXhpc3RpbmdMaW5rID0gZnJvbVBhZ2UubmV4dD8uZmluZChpdCA9PiBpdC5wYXRoID09PSB0bylcbiAgICAgIGlmIChleGlzdGluZ0xpbmspIHtcbiAgICAgICAgaWYgKGNvbmRpdGlvbikge1xuICAgICAgICAgIGV4aXN0aW5nTGluay5jb25kaXRpb24gPSBjb25kaXRpb25cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgZXhpc3RpbmdMaW5rLmNvbmRpdGlvblxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBhZGRQYWdlIChwYWdlKSB7XG4gICAgdGhpcy5wYWdlcyA9IHRoaXMucGFnZXMgfHwgW11cbiAgICB0aGlzLnBhZ2VzLnB1c2gocGFnZSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0UGFnZXMgKCkge1xuICAgIHJldHVybiB0aGlzLnBhZ2VzIHx8IFtdXG4gIH1cblxuICBsaXN0Rm9yIChpbnB1dCkge1xuICAgIHJldHVybiAodGhpcy5saXN0cyB8fCBbXSkuZmluZChpdCA9PiBpdC5uYW1lID09PSAoaW5wdXQub3B0aW9ucyB8fCB7fSkubGlzdCkgfHwgKGlucHV0LnR5cGUgPT09ICdZZXNOb0ZpZWxkJyA/IHllc05vTGlzdCA6IHVuZGVmaW5lZClcbiAgfVxuXG4gIF9hbGxQYXRoc0xlYWRpbmdUbyAocGF0aCkge1xuICAgIHJldHVybiAodGhpcy5wYWdlcyB8fCBbXSkuZmlsdGVyKHBhZ2UgPT4gcGFnZS5uZXh0ICYmIHBhZ2UubmV4dC5maW5kKG5leHQgPT4gbmV4dC5wYXRoID09PSBwYXRoKSlcbiAgICAgIC5mbGF0TWFwKHBhZ2UgPT4gW3BhZ2UucGF0aF0uY29uY2F0KHRoaXMuX2FsbFBhdGhzTGVhZGluZ1RvKHBhZ2UucGF0aCkpKVxuICB9XG5cbiAgYWRkQ29uZGl0aW9uIChuYW1lLCBkaXNwbGF5TmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLiNjb25kaXRpb25zID0gdGhpcy4jY29uZGl0aW9ucyB8fCBbXVxuICAgIGlmICh0aGlzLiNjb25kaXRpb25zLmZpbmQoaXQgPT4gaXQubmFtZSA9PT0gbmFtZSkpIHtcbiAgICAgIHRocm93IEVycm9yKGBBIGNvbmRpdGlvbiBhbHJlYWR5IGV4aXN0cyB3aXRoIG5hbWUgJHtuYW1lfWApXG4gICAgfVxuICAgIHRoaXMuI2NvbmRpdGlvbnMucHVzaCh7IG5hbWUsIGRpc3BsYXlOYW1lLCB2YWx1ZSB9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICB1cGRhdGVDb25kaXRpb24gKG5hbWUsIGRpc3BsYXlOYW1lLCB2YWx1ZSkge1xuICAgIGNvbnN0IGNvbmRpdGlvbiA9IHRoaXMuI2NvbmRpdGlvbnMuZmluZChjb25kaXRpb24gPT4gY29uZGl0aW9uLm5hbWUgPT09IG5hbWUpXG4gICAgaWYgKGNvbmRpdGlvbikge1xuICAgICAgY29uZGl0aW9uLmRpc3BsYXlOYW1lID0gZGlzcGxheU5hbWVcbiAgICAgIGNvbmRpdGlvbi52YWx1ZSA9IHZhbHVlXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICByZW1vdmVDb25kaXRpb24gKG5hbWUpIHtcbiAgICBjb25zdCBjb25kaXRpb24gPSB0aGlzLmZpbmRDb25kaXRpb24obmFtZSlcbiAgICBpZiAoY29uZGl0aW9uKSB7XG4gICAgICB0aGlzLiNjb25kaXRpb25zLnNwbGljZSh0aGlzLiNjb25kaXRpb25zLmZpbmRJbmRleChjb25kaXRpb24gPT4gY29uZGl0aW9uLm5hbWUgPT09IG5hbWUpLCAxKVxuICAgICAgLy8gVXBkYXRlIGFueSByZWZlcmVuY2VzIHRvIHRoZSBjb25kaXRpb25cbiAgICAgIHRoaXMuZ2V0UGFnZXMoKS5mb3JFYWNoKHAgPT4ge1xuICAgICAgICBBcnJheS5pc0FycmF5KHAubmV4dCkgJiYgcC5uZXh0LmZvckVhY2gobiA9PiB7XG4gICAgICAgICAgaWYgKG4uaWYgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBuLmlmXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGZpbmRDb25kaXRpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zLmZpbmQoY29uZGl0aW9uID0+IGNvbmRpdGlvbi5uYW1lID09PSBuYW1lKVxuICB9XG5cbiAgZ2V0IGhhc0NvbmRpdGlvbnMgKCkge1xuICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnMubGVuZ3RoID4gMFxuICB9XG5cbiAgZ2V0IGNvbmRpdGlvbnMgKCkge1xuICAgIHJldHVybiB0aGlzLiNjb25kaXRpb25zLm1hcChpdCA9PiBjbG9uZShpdCkpXG4gIH1cblxuICBjbG9uZSAoKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRhKHRoaXMuX2V4cG9zZVByaXZhdGVGaWVsZHMoKSlcbiAgfVxuXG4gIHRvSlNPTiAoKSB7XG4gICAgY29uc3Qgd2l0aG91dEZ1bmN0aW9ucyA9IE9iamVjdC5maWx0ZXIodGhpcy5fZXhwb3NlUHJpdmF0ZUZpZWxkcygpLCBmaWVsZCA9PiB0eXBlb2YgZmllbGQgIT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHdpdGhvdXRGdW5jdGlvbnMpXG4gIH1cblxuICBfZXhwb3NlUHJpdmF0ZUZpZWxkcyAoKSB7XG4gICAgY29uc3QgdG9TZXJpYWxpemUgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzKVxuICAgIHRvU2VyaWFsaXplLmNvbmRpdGlvbnMgPSB0aGlzLmNvbmRpdGlvbnMubWFwKGl0ID0+IGNsb25lKGl0KSlcbiAgICByZXR1cm4gdG9TZXJpYWxpemVcbiAgfVxufVxuXG5PYmplY3QuZmlsdGVyID0gZnVuY3Rpb24gKG9iaiwgcHJlZGljYXRlKSB7XG4gIGNvbnN0IHJlc3VsdCA9IHt9XG4gIGxldCBrZXlcbiAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgaWYgKG9ialtrZXldICYmIHByZWRpY2F0ZShvYmpba2V5XSkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gb2JqW2tleV1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5jbGFzcyBJbnB1dCB7XG4gICNwYXJlbnRJdGVtTmFtZVxuXG4gIGNvbnN0cnVjdG9yIChyYXdEYXRhLCBwYWdlLCBwYXJlbnRJdGVtTmFtZSkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcywgcmF3RGF0YSlcbiAgICBjb25zdCBteVBhZ2UgPSBjbG9uZShwYWdlKVxuICAgIGRlbGV0ZSBteVBhZ2UuY29tcG9uZW50c1xuICAgIHRoaXMucGFnZSA9IG15UGFnZVxuICAgIHRoaXMucHJvcGVydHlQYXRoID0gcGFnZS5zZWN0aW9uID8gYCR7cGFnZS5zZWN0aW9ufS4ke3RoaXMubmFtZX1gIDogdGhpcy5uYW1lXG4gICAgdGhpcy4jcGFyZW50SXRlbU5hbWUgPSBwYXJlbnRJdGVtTmFtZVxuICB9XG5cbiAgZ2V0IGRpc3BsYXlOYW1lICgpIHtcbiAgICBjb25zdCB0aXRsZVdpdGhDb250ZXh0ID0gdGhpcy4jcGFyZW50SXRlbU5hbWUgPyBgJHt0aGlzLnRpdGxlfSB1bmRlciAke3RoaXMuI3BhcmVudEl0ZW1OYW1lfWAgOiB0aGlzLnRpdGxlXG4gICAgcmV0dXJuIHRoaXMucGFnZS5zZWN0aW9uID8gYCR7dGl0bGVXaXRoQ29udGV4dH0gaW4gJHt0aGlzLnBhZ2Uuc2VjdGlvbn1gIDogdGl0bGVXaXRoQ29udGV4dFxuICB9XG59XG5cbmNsYXNzIENvbmRpdGlvbiB7XG4gIGNvbnN0cnVjdG9yIChyYXdEYXRhKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCByYXdEYXRhKVxuICAgIHRoaXMuZGlzcGxheU5hbWUgPSByYXdEYXRhLmRpc3BsYXlOYW1lIHx8IHJhd0RhdGEubmFtZVxuICB9XG59XG4iXX0=