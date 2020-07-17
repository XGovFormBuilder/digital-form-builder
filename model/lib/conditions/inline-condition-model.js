"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Field = exports.Condition = exports.GroupDef = exports.ConditionsModel = exports.coordinators = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _classPrivateFieldGet2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldGet"));

var _classPrivateFieldSet2 = _interopRequireDefault(require("@babel/runtime/helpers/classPrivateFieldSet"));

var _componentTypes = _interopRequireDefault(require("../component-types"));

var _inlineConditionOperators = require("./inline-condition-operators");

var _inlineConditionValues = require("./inline-condition-values");

var coordinators = {
  AND: 'and',
  OR: 'or'
};
exports.coordinators = coordinators;

var _groupedConditions = new WeakMap();

var _userGroupedConditions = new WeakMap();

var _conditionName = new WeakMap();

var ConditionsModel = /*#__PURE__*/function () {
  function ConditionsModel() {
    (0, _classCallCheck2["default"])(this, ConditionsModel);

    _groupedConditions.set(this, {
      writable: true,
      value: void 0
    });

    _userGroupedConditions.set(this, {
      writable: true,
      value: void 0
    });

    _conditionName.set(this, {
      writable: true,
      value: void 0
    });

    (0, _classPrivateFieldSet2["default"])(this, _groupedConditions, []);
    (0, _classPrivateFieldSet2["default"])(this, _userGroupedConditions, []);
  }

  (0, _createClass2["default"])(ConditionsModel, [{
    key: "clone",
    value: function clone() {
      var toReturn = new ConditionsModel();
      (0, _classPrivateFieldSet2["default"])(toReturn, _groupedConditions, (0, _classPrivateFieldGet2["default"])(this, _groupedConditions).map(function (it) {
        return it.clone();
      }));
      (0, _classPrivateFieldSet2["default"])(toReturn, _userGroupedConditions, (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).map(function (it) {
        return it.clone();
      }));
      (0, _classPrivateFieldSet2["default"])(toReturn, _conditionName, (0, _classPrivateFieldGet2["default"])(this, _conditionName));
      return toReturn;
    }
  }, {
    key: "clear",
    value: function clear() {
      (0, _classPrivateFieldSet2["default"])(this, _userGroupedConditions, []);
      (0, _classPrivateFieldSet2["default"])(this, _groupedConditions, []);
      (0, _classPrivateFieldSet2["default"])(this, _conditionName, undefined);
      return this;
    }
  }, {
    key: "add",
    value: function add(condition) {
      var coordinatorExpected = (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).length !== 0;

      if (condition.getCoordinator() && !coordinatorExpected) {
        throw Error('No coordinator allowed on the first condition');
      } else if (!condition.getCoordinator() && coordinatorExpected) {
        throw Error('Coordinator must be present on subsequent conditions');
      }

      (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).push(condition);
      (0, _classPrivateFieldSet2["default"])(this, _groupedConditions, this._applyGroups((0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions)));
      return this;
    }
  }, {
    key: "replace",
    value: function replace(index, condition) {
      var coordinatorExpected = index !== 0;

      if (condition.getCoordinator() && !coordinatorExpected) {
        throw Error('No coordinator allowed on the first condition');
      } else if (!condition.getCoordinator() && coordinatorExpected) {
        throw Error('Coordinator must be present on subsequent conditions');
      } else if (index >= (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).length) {
        throw Error("Cannot replace condition ".concat(index, " as no such condition exists"));
      }

      (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).splice(index, 1, condition);
      (0, _classPrivateFieldSet2["default"])(this, _groupedConditions, this._applyGroups((0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions)));
      return this;
    }
  }, {
    key: "remove",
    value: function remove(indexes) {
      (0, _classPrivateFieldSet2["default"])(this, _userGroupedConditions, (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).filter(function (condition, index) {
        return !indexes.includes(index);
      }).map(function (condition, index) {
        return index === 0 ? condition.asFirstCondition() : condition;
      }));
      (0, _classPrivateFieldSet2["default"])(this, _groupedConditions, this._applyGroups((0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions)));
      return this;
    }
  }, {
    key: "addGroups",
    value: function addGroups(groupDefs) {
      (0, _classPrivateFieldSet2["default"])(this, _userGroupedConditions, this._group((0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions), groupDefs));
      (0, _classPrivateFieldSet2["default"])(this, _groupedConditions, this._applyGroups((0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions)));
      return this;
    }
  }, {
    key: "splitGroup",
    value: function splitGroup(index) {
      (0, _classPrivateFieldSet2["default"])(this, _userGroupedConditions, this._ungroup((0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions), index));
      (0, _classPrivateFieldSet2["default"])(this, _groupedConditions, this._applyGroups((0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions)));
      return this;
    }
  }, {
    key: "moveEarlier",
    value: function moveEarlier(index) {
      if (index > 0 && index < (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).length) {
        (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).splice(index - 1, 0, (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).splice(index, 1)[0]);

        if (index === 1) {
          this.switchCoordinators();
        }

        (0, _classPrivateFieldSet2["default"])(this, _groupedConditions, this._applyGroups((0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions)));
      }

      return this;
    }
  }, {
    key: "moveLater",
    value: function moveLater(index) {
      if (index >= 0 && index < (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).length - 1) {
        (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).splice(index + 1, 0, (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).splice(index, 1)[0]);

        if (index === 0) {
          this.switchCoordinators();
        }

        (0, _classPrivateFieldSet2["default"])(this, _groupedConditions, this._applyGroups((0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions)));
      }

      return this;
    }
  }, {
    key: "switchCoordinators",
    value: function switchCoordinators() {
      (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions)[1].setCoordinator((0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions)[0].getCoordinator());
      (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions)[0].setCoordinator(undefined);
    }
  }, {
    key: "toPresentationString",
    value: function toPresentationString() {
      return (0, _classPrivateFieldGet2["default"])(this, _groupedConditions).map(function (condition) {
        return condition.toPresentationString();
      }).join(' ');
    }
  }, {
    key: "toExpression",
    value: function toExpression() {
      return (0, _classPrivateFieldGet2["default"])(this, _groupedConditions).map(function (condition) {
        return condition.toExpression();
      }).join(' ');
    }
  }, {
    key: "_applyGroups",
    value: function _applyGroups(userGroupedConditions) {
      var _this = this;

      var correctedUserGroups = userGroupedConditions.map(function (condition) {
        return condition instanceof ConditionGroup && condition.conditions.length > 2 ? new ConditionGroup(_this._group(condition.conditions, _this._autoGroupDefs(condition.conditions))) : condition;
      });
      return this._group(correctedUserGroups, this._autoGroupDefs(correctedUserGroups));
    }
  }, {
    key: "_group",
    value: function _group(conditions, groupDefs) {
      return conditions.reduce(function (groups, condition, index, conditions) {
        var groupDef = groupDefs.find(function (groupDef) {
          return groupDef.contains(index);
        });

        if (groupDef) {
          if (groupDef.startsWith(index)) {
            var groupConditions = groupDef.applyTo(conditions);
            groups.push(new ConditionGroup(groupConditions));
          }
        } else {
          groups.push(condition);
        }

        return groups;
      }, []);
    }
  }, {
    key: "_ungroup",
    value: function _ungroup(conditions, splitIndex) {
      if (conditions[splitIndex].isGroup()) {
        var copy = (0, _toConsumableArray2["default"])(conditions);
        copy.splice.apply(copy, [splitIndex, 1].concat((0, _toConsumableArray2["default"])(conditions[splitIndex].conditions)));
        return copy;
      }

      return conditions;
    }
  }, {
    key: "_autoGroupDefs",
    value: function _autoGroupDefs(conditions) {
      var orPositions = [];
      conditions.forEach(function (condition, index) {
        if (condition.getCoordinator() === coordinators.OR) {
          orPositions.push(index);
        }
      });
      var hasAnd = !!conditions.find(function (condition) {
        return condition.getCoordinator() === coordinators.AND;
      });
      var hasOr = orPositions.length > 0;

      if (hasAnd && hasOr) {
        var start = 0;
        var groupDefs = [];
        orPositions.forEach(function (position, index) {
          if (start < position - 1) {
            groupDefs.push(new GroupDef(start, position - 1));
          }

          var thisIsTheLastOr = orPositions.length === index + 1;
          var thereAreMoreConditions = conditions.length - 1 > position;

          if (thisIsTheLastOr && thereAreMoreConditions) {
            groupDefs.push(new GroupDef(position, conditions.length - 1));
          }

          start = position;
        });
        return groupDefs;
      }

      return [];
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      var name = (0, _classPrivateFieldGet2["default"])(this, _conditionName);
      var conditions = (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions);
      return {
        name: name,
        conditions: conditions.map(function (it) {
          return it.clone();
        })
      };
    }
  }, {
    key: "name",
    set: function set(name) {
      (0, _classPrivateFieldSet2["default"])(this, _conditionName, name);
    },
    get: function get() {
      return (0, _classPrivateFieldGet2["default"])(this, _conditionName);
    }
  }, {
    key: "asPerUserGroupings",
    get: function get() {
      return (0, _toConsumableArray2["default"])((0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions));
    }
  }, {
    key: "hasConditions",
    get: function get() {
      return (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).length > 0;
    }
  }, {
    key: "lastIndex",
    get: function get() {
      return (0, _classPrivateFieldGet2["default"])(this, _userGroupedConditions).length - 1;
    }
  }], [{
    key: "from",
    value: function from(obj) {
      var toReturn = new ConditionsModel();
      (0, _classPrivateFieldSet2["default"])(toReturn, _conditionName, obj.name);
      (0, _classPrivateFieldSet2["default"])(toReturn, _userGroupedConditions, obj.conditions.map(function (it) {
        return conditionFrom(it);
      }));
      (0, _classPrivateFieldSet2["default"])(toReturn, _groupedConditions, toReturn._applyGroups((0, _classPrivateFieldGet2["default"])(toReturn, _userGroupedConditions)));
      return toReturn;
    }
  }]);
  return ConditionsModel;
}();

exports.ConditionsModel = ConditionsModel;

function conditionFrom(it) {
  return it.conditions ? new ConditionGroup(it.conditions.map(function (condition) {
    return conditionFrom(condition);
  })) : new Condition(Field.from(it.field), it.operator, (0, _inlineConditionValues.valueFrom)(it.value), it.coordinator);
}

var GroupDef = /*#__PURE__*/function () {
  function GroupDef(first, last) {
    (0, _classCallCheck2["default"])(this, GroupDef);

    if (typeof first !== 'number' || typeof last !== 'number') {
      throw Error("Cannot construct a group from ".concat(first, " and ").concat(last));
    } else if (first >= last) {
      throw Error("Last (".concat(last, ") must be greater than first (").concat(first, ")"));
    }

    this.first = first;
    this.last = last;
  }

  (0, _createClass2["default"])(GroupDef, [{
    key: "contains",
    value: function contains(index) {
      return this.first <= index && this.last >= index;
    }
  }, {
    key: "startsWith",
    value: function startsWith(index) {
      return this.first === index;
    }
  }, {
    key: "applyTo",
    value: function applyTo(conditions) {
      return (0, _toConsumableArray2["default"])(conditions).splice(this.first, this.last - this.first + 1);
    }
  }]);
  return GroupDef;
}();

exports.GroupDef = GroupDef;

var ConditionGroup = /*#__PURE__*/function () {
  function ConditionGroup(conditions) {
    (0, _classCallCheck2["default"])(this, ConditionGroup);

    if (!Array.isArray(conditions) || conditions.length < 2) {
      throw Error("Cannot construct a condition group from ".concat(conditions));
    }

    this.conditions = conditions;
  }

  (0, _createClass2["default"])(ConditionGroup, [{
    key: "toPresentationString",
    value: function toPresentationString() {
      var copy = (0, _toConsumableArray2["default"])(this.conditions);
      copy.splice(0, 1);
      return "".concat(this.coordinatorString()).concat(this.conditionString());
    }
  }, {
    key: "toExpression",
    value: function toExpression() {
      var copy = (0, _toConsumableArray2["default"])(this.conditions);
      copy.splice(0, 1);
      return "".concat(this.coordinatorString()).concat(this.conditionExpression());
    }
  }, {
    key: "coordinatorString",
    value: function coordinatorString() {
      return this.conditions[0].coordinatorString();
    }
  }, {
    key: "conditionString",
    value: function conditionString() {
      var copy = (0, _toConsumableArray2["default"])(this.conditions);
      copy.splice(0, 1);
      return "(".concat(this.conditions[0].conditionString(), " ").concat(copy.map(function (condition) {
        return condition.toPresentationString();
      }).join(' '), ")");
    }
  }, {
    key: "conditionExpression",
    value: function conditionExpression() {
      var copy = (0, _toConsumableArray2["default"])(this.conditions);
      copy.splice(0, 1);
      return "(".concat(this.conditions[0].conditionExpression(), " ").concat(copy.map(function (condition) {
        return condition.toExpression();
      }).join(' '), ")");
    }
  }, {
    key: "asFirstCondition",
    value: function asFirstCondition() {
      this.conditions[0].asFirstCondition();
      return this;
    }
  }, {
    key: "getCoordinator",
    value: function getCoordinator() {
      return this.conditions[0].getCoordinator();
    }
  }, {
    key: "setCoordinator",
    value: function setCoordinator(coordinator) {
      this.conditions[0].setCoordinator(coordinator);
    }
  }, {
    key: "isGroup",
    value: function isGroup() {
      return true;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new ConditionGroup(this.conditions.map(function (condition) {
        return condition.clone();
      }));
    }
  }]);
  return ConditionGroup;
}();

var Condition = /*#__PURE__*/function () {
  function Condition(field, operator, value, coordinator) {
    (0, _classCallCheck2["default"])(this, Condition);

    if (!(field instanceof Field)) {
      throw Error("field ".concat(field, " is not a valid Field object"));
    }

    if (typeof operator !== 'string') {
      throw Error("operator ".concat(operator, " is not a valid operator"));
    }

    if (!(value instanceof _inlineConditionValues.AbstractConditionValue)) {
      throw Error("value ".concat(value, " is not a valid value type"));
    }

    if (coordinator && !Object.values(coordinators).includes(coordinator)) {
      throw Error("coordinator ".concat(coordinator, " is not a valid coordinator"));
    }

    this.field = field;
    this.operator = operator;
    this.value = value;
    this.coordinator = coordinator;
  }

  (0, _createClass2["default"])(Condition, [{
    key: "toPresentationString",
    value: function toPresentationString() {
      return "".concat(this.coordinatorString()).concat(this.conditionString());
    }
  }, {
    key: "toExpression",
    value: function toExpression() {
      return "".concat(this.coordinatorString()).concat(this.conditionExpression());
    }
  }, {
    key: "conditionString",
    value: function conditionString() {
      return "'".concat(this.field.display, "' ").concat(this.operator, " '").concat(this.value.toPresentationString(), "'");
    }
  }, {
    key: "conditionExpression",
    value: function conditionExpression() {
      return (0, _inlineConditionOperators.getExpression)(this.field.type, this.field.name, this.operator, this.value);
    }
  }, {
    key: "coordinatorString",
    value: function coordinatorString() {
      return this.coordinator ? "".concat(this.coordinator, " ") : '';
    }
  }, {
    key: "getCoordinator",
    value: function getCoordinator() {
      return this.coordinator;
    }
  }, {
    key: "setCoordinator",
    value: function setCoordinator(coordinator) {
      this.coordinator = coordinator;
    }
  }, {
    key: "asFirstCondition",
    value: function asFirstCondition() {
      delete this.coordinator;
      return this;
    }
  }, {
    key: "isGroup",
    value: function isGroup() {
      return false;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Condition(Field.from(this.field), this.operator, this.value.clone(), this.coordinator);
    }
  }]);
  return Condition;
}();

exports.Condition = Condition;

var Field = /*#__PURE__*/function () {
  function Field(name, type, display) {
    (0, _classCallCheck2["default"])(this, Field);

    if (!name || typeof name !== 'string') {
      throw Error("name ".concat(name, " is not valid"));
    }

    if (!_componentTypes["default"].find(function (componentType) {
      return componentType.name === type;
    })) {
      throw Error("type ".concat(type, " is not valid"));
    }

    if (!display || typeof display !== 'string') {
      throw Error("display ".concat(display, " is not valid"));
    }

    this.name = name;
    this.type = type;
    this.display = display;
  }

  (0, _createClass2["default"])(Field, null, [{
    key: "from",
    value: function from(obj) {
      return new Field(obj.name, obj.type, obj.display);
    }
  }]);
  return Field;
}();

exports.Field = Field;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25kaXRpb25zL2lubGluZS1jb25kaXRpb24tbW9kZWwuanMiXSwibmFtZXMiOlsiY29vcmRpbmF0b3JzIiwiQU5EIiwiT1IiLCJDb25kaXRpb25zTW9kZWwiLCJ0b1JldHVybiIsIm1hcCIsIml0IiwiY2xvbmUiLCJ1bmRlZmluZWQiLCJjb25kaXRpb24iLCJjb29yZGluYXRvckV4cGVjdGVkIiwibGVuZ3RoIiwiZ2V0Q29vcmRpbmF0b3IiLCJFcnJvciIsInB1c2giLCJfYXBwbHlHcm91cHMiLCJpbmRleCIsInNwbGljZSIsImluZGV4ZXMiLCJmaWx0ZXIiLCJpbmNsdWRlcyIsImFzRmlyc3RDb25kaXRpb24iLCJncm91cERlZnMiLCJfZ3JvdXAiLCJfdW5ncm91cCIsInN3aXRjaENvb3JkaW5hdG9ycyIsInNldENvb3JkaW5hdG9yIiwidG9QcmVzZW50YXRpb25TdHJpbmciLCJqb2luIiwidG9FeHByZXNzaW9uIiwidXNlckdyb3VwZWRDb25kaXRpb25zIiwiY29ycmVjdGVkVXNlckdyb3VwcyIsIkNvbmRpdGlvbkdyb3VwIiwiY29uZGl0aW9ucyIsIl9hdXRvR3JvdXBEZWZzIiwicmVkdWNlIiwiZ3JvdXBzIiwiZ3JvdXBEZWYiLCJmaW5kIiwiY29udGFpbnMiLCJzdGFydHNXaXRoIiwiZ3JvdXBDb25kaXRpb25zIiwiYXBwbHlUbyIsInNwbGl0SW5kZXgiLCJpc0dyb3VwIiwiY29weSIsIm9yUG9zaXRpb25zIiwiZm9yRWFjaCIsImhhc0FuZCIsImhhc09yIiwic3RhcnQiLCJwb3NpdGlvbiIsIkdyb3VwRGVmIiwidGhpc0lzVGhlTGFzdE9yIiwidGhlcmVBcmVNb3JlQ29uZGl0aW9ucyIsIm5hbWUiLCJvYmoiLCJjb25kaXRpb25Gcm9tIiwiQ29uZGl0aW9uIiwiRmllbGQiLCJmcm9tIiwiZmllbGQiLCJvcGVyYXRvciIsInZhbHVlIiwiY29vcmRpbmF0b3IiLCJmaXJzdCIsImxhc3QiLCJBcnJheSIsImlzQXJyYXkiLCJjb29yZGluYXRvclN0cmluZyIsImNvbmRpdGlvblN0cmluZyIsImNvbmRpdGlvbkV4cHJlc3Npb24iLCJBYnN0cmFjdENvbmRpdGlvblZhbHVlIiwiT2JqZWN0IiwidmFsdWVzIiwiZGlzcGxheSIsInR5cGUiLCJDb21wb25lbnRUeXBlcyIsImNvbXBvbmVudFR5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFFTyxJQUFNQSxZQUFZLEdBQUc7QUFDMUJDLEVBQUFBLEdBQUcsRUFBRSxLQURxQjtBQUUxQkMsRUFBQUEsRUFBRSxFQUFFO0FBRnNCLENBQXJCOzs7Ozs7Ozs7SUFLTUMsZTtBQUtYLDZCQUFlO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQ2IscUVBQTBCLEVBQTFCO0FBQ0EseUVBQThCLEVBQTlCO0FBQ0Q7Ozs7NEJBRVE7QUFDUCxVQUFNQyxRQUFRLEdBQUcsSUFBSUQsZUFBSixFQUFqQjtBQUNBLDZDQUFBQyxRQUFRLHNCQUFzQixpRUFBd0JDLEdBQXhCLENBQTRCLFVBQUFDLEVBQUU7QUFBQSxlQUFJQSxFQUFFLENBQUNDLEtBQUgsRUFBSjtBQUFBLE9BQTlCLENBQXRCLENBQVI7QUFDQSw2Q0FBQUgsUUFBUSwwQkFBMEIscUVBQTRCQyxHQUE1QixDQUFnQyxVQUFBQyxFQUFFO0FBQUEsZUFBSUEsRUFBRSxDQUFDQyxLQUFILEVBQUo7QUFBQSxPQUFsQyxDQUExQixDQUFSO0FBQ0EsNkNBQUFILFFBQVEseURBQWtCLElBQWxCLGtCQUFSO0FBQ0EsYUFBT0EsUUFBUDtBQUNEOzs7NEJBRVE7QUFDUCwyRUFBOEIsRUFBOUI7QUFDQSx1RUFBMEIsRUFBMUI7QUFDQSxtRUFBc0JJLFNBQXRCO0FBQ0EsYUFBTyxJQUFQO0FBQ0Q7Ozt3QkFVSUMsUyxFQUFXO0FBQ2QsVUFBTUMsbUJBQW1CLEdBQUcscUVBQTRCQyxNQUE1QixLQUF1QyxDQUFuRTs7QUFDQSxVQUFJ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IjpbImltcG9ydCBDb21wb25lbnRUeXBlcyBmcm9tICcuLi9jb21wb25lbnQtdHlwZXMnXG5pbXBvcnQgeyBnZXRFeHByZXNzaW9uIH0gZnJvbSAnLi9pbmxpbmUtY29uZGl0aW9uLW9wZXJhdG9ycydcbmltcG9ydCB7IEFic3RyYWN0Q29uZGl0aW9uVmFsdWUsIHZhbHVlRnJvbSB9IGZyb20gJy4vaW5saW5lLWNvbmRpdGlvbi12YWx1ZXMnXG5cbmV4cG9ydCBjb25zdCBjb29yZGluYXRvcnMgPSB7XG4gIEFORDogJ2FuZCcsXG4gIE9SOiAnb3InXG59XG5cbmV4cG9ydCBjbGFzcyBDb25kaXRpb25zTW9kZWwge1xuICAjZ3JvdXBlZENvbmRpdGlvbnNcbiAgI3VzZXJHcm91cGVkQ29uZGl0aW9uc1xuICAjY29uZGl0aW9uTmFtZVxuXG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLiNncm91cGVkQ29uZGl0aW9ucyA9IFtdXG4gICAgdGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zID0gW11cbiAgfVxuXG4gIGNsb25lICgpIHtcbiAgICBjb25zdCB0b1JldHVybiA9IG5ldyBDb25kaXRpb25zTW9kZWwoKVxuICAgIHRvUmV0dXJuLiNncm91cGVkQ29uZGl0aW9ucyA9IHRoaXMuI2dyb3VwZWRDb25kaXRpb25zLm1hcChpdCA9PiBpdC5jbG9uZSgpKVxuICAgIHRvUmV0dXJuLiN1c2VyR3JvdXBlZENvbmRpdGlvbnMgPSB0aGlzLiN1c2VyR3JvdXBlZENvbmRpdGlvbnMubWFwKGl0ID0+IGl0LmNsb25lKCkpXG4gICAgdG9SZXR1cm4uI2NvbmRpdGlvbk5hbWUgPSB0aGlzLiNjb25kaXRpb25OYW1lXG4gICAgcmV0dXJuIHRvUmV0dXJuXG4gIH1cblxuICBjbGVhciAoKSB7XG4gICAgdGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zID0gW11cbiAgICB0aGlzLiNncm91cGVkQ29uZGl0aW9ucyA9IFtdXG4gICAgdGhpcy4jY29uZGl0aW9uTmFtZSA9IHVuZGVmaW5lZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXQgbmFtZSAobmFtZSkge1xuICAgIHRoaXMuI2NvbmRpdGlvbk5hbWUgPSBuYW1lXG4gIH1cblxuICBnZXQgbmFtZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2NvbmRpdGlvbk5hbWVcbiAgfVxuXG4gIGFkZCAoY29uZGl0aW9uKSB7XG4gICAgY29uc3QgY29vcmRpbmF0b3JFeHBlY3RlZCA9IHRoaXMuI3VzZXJHcm91cGVkQ29uZGl0aW9ucy5sZW5ndGggIT09IDBcbiAgICBpZiAoY29uZGl0aW9uLmdldENvb3JkaW5hdG9yKCkgJiYgIWNvb3JkaW5hdG9yRXhwZWN0ZWQpIHtcbiAgICAgIHRocm93IEVycm9yKCdObyBjb29yZGluYXRvciBhbGxvd2VkIG9uIHRoZSBmaXJzdCBjb25kaXRpb24nKVxuICAgIH0gZWxzZSBpZiAoIWNvbmRpdGlvbi5nZXRDb29yZGluYXRvcigpICYmIGNvb3JkaW5hdG9yRXhwZWN0ZWQpIHtcbiAgICAgIHRocm93IEVycm9yKCdDb29yZGluYXRvciBtdXN0IGJlIHByZXNlbnQgb24gc3Vic2VxdWVudCBjb25kaXRpb25zJylcbiAgICB9XG4gICAgdGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zLnB1c2goY29uZGl0aW9uKVxuICAgIHRoaXMuI2dyb3VwZWRDb25kaXRpb25zID0gdGhpcy5fYXBwbHlHcm91cHModGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICByZXBsYWNlIChpbmRleCwgY29uZGl0aW9uKSB7XG4gICAgY29uc3QgY29vcmRpbmF0b3JFeHBlY3RlZCA9IGluZGV4ICE9PSAwXG4gICAgaWYgKGNvbmRpdGlvbi5nZXRDb29yZGluYXRvcigpICYmICFjb29yZGluYXRvckV4cGVjdGVkKSB7XG4gICAgICB0aHJvdyBFcnJvcignTm8gY29vcmRpbmF0b3IgYWxsb3dlZCBvbiB0aGUgZmlyc3QgY29uZGl0aW9uJylcbiAgICB9IGVsc2UgaWYgKCFjb25kaXRpb24uZ2V0Q29vcmRpbmF0b3IoKSAmJiBjb29yZGluYXRvckV4cGVjdGVkKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ29vcmRpbmF0b3IgbXVzdCBiZSBwcmVzZW50IG9uIHN1YnNlcXVlbnQgY29uZGl0aW9ucycpXG4gICAgfSBlbHNlIGlmIChpbmRleCA+PSB0aGlzLiN1c2VyR3JvdXBlZENvbmRpdGlvbnMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBFcnJvcihgQ2Fubm90IHJlcGxhY2UgY29uZGl0aW9uICR7aW5kZXh9IGFzIG5vIHN1Y2ggY29uZGl0aW9uIGV4aXN0c2ApXG4gICAgfVxuICAgIHRoaXMuI3VzZXJHcm91cGVkQ29uZGl0aW9ucy5zcGxpY2UoaW5kZXgsIDEsIGNvbmRpdGlvbilcbiAgICB0aGlzLiNncm91cGVkQ29uZGl0aW9ucyA9IHRoaXMuX2FwcGx5R3JvdXBzKHRoaXMuI3VzZXJHcm91cGVkQ29uZGl0aW9ucylcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcmVtb3ZlIChpbmRleGVzKSB7XG4gICAgdGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zID0gdGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zLmZpbHRlcigoY29uZGl0aW9uLCBpbmRleCkgPT4gIWluZGV4ZXMuaW5jbHVkZXMoaW5kZXgpKVxuICAgICAgLm1hcCgoY29uZGl0aW9uLCBpbmRleCkgPT4gaW5kZXggPT09IDAgPyBjb25kaXRpb24uYXNGaXJzdENvbmRpdGlvbigpIDogY29uZGl0aW9uKVxuXG4gICAgdGhpcy4jZ3JvdXBlZENvbmRpdGlvbnMgPSB0aGlzLl9hcHBseUdyb3Vwcyh0aGlzLiN1c2VyR3JvdXBlZENvbmRpdGlvbnMpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGFkZEdyb3VwcyAoZ3JvdXBEZWZzKSB7XG4gICAgdGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zID0gdGhpcy5fZ3JvdXAodGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zLCBncm91cERlZnMpXG4gICAgdGhpcy4jZ3JvdXBlZENvbmRpdGlvbnMgPSB0aGlzLl9hcHBseUdyb3Vwcyh0aGlzLiN1c2VyR3JvdXBlZENvbmRpdGlvbnMpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNwbGl0R3JvdXAgKGluZGV4KSB7XG4gICAgdGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zID0gdGhpcy5fdW5ncm91cCh0aGlzLiN1c2VyR3JvdXBlZENvbmRpdGlvbnMsIGluZGV4KVxuICAgIHRoaXMuI2dyb3VwZWRDb25kaXRpb25zID0gdGhpcy5fYXBwbHlHcm91cHModGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBtb3ZlRWFybGllciAoaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPiAwICYmIGluZGV4IDwgKHRoaXMuI3VzZXJHcm91cGVkQ29uZGl0aW9ucy5sZW5ndGgpKSB7XG4gICAgICB0aGlzLiN1c2VyR3JvdXBlZENvbmRpdGlvbnMuc3BsaWNlKGluZGV4IC0gMSwgMCwgdGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zLnNwbGljZShpbmRleCwgMSlbMF0pXG4gICAgICBpZiAoaW5kZXggPT09IDEpIHtcbiAgICAgICAgdGhpcy5zd2l0Y2hDb29yZGluYXRvcnMoKVxuICAgICAgfVxuICAgICAgdGhpcy4jZ3JvdXBlZENvbmRpdGlvbnMgPSB0aGlzLl9hcHBseUdyb3Vwcyh0aGlzLiN1c2VyR3JvdXBlZENvbmRpdGlvbnMpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBtb3ZlTGF0ZXIgKGluZGV4KSB7XG4gICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCAodGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zLmxlbmd0aCAtIDEpKSB7XG4gICAgICB0aGlzLiN1c2VyR3JvdXBlZENvbmRpdGlvbnMuc3BsaWNlKGluZGV4ICsgMSwgMCwgdGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zLnNwbGljZShpbmRleCwgMSlbMF0pXG4gICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgdGhpcy5zd2l0Y2hDb29yZGluYXRvcnMoKVxuICAgICAgfVxuICAgICAgdGhpcy4jZ3JvdXBlZENvbmRpdGlvbnMgPSB0aGlzLl9hcHBseUdyb3Vwcyh0aGlzLiN1c2VyR3JvdXBlZENvbmRpdGlvbnMpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzd2l0Y2hDb29yZGluYXRvcnMgKCkge1xuICAgIHRoaXMuI3VzZXJHcm91cGVkQ29uZGl0aW9uc1sxXS5zZXRDb29yZGluYXRvcih0aGlzLiN1c2VyR3JvdXBlZENvbmRpdGlvbnNbMF0uZ2V0Q29vcmRpbmF0b3IoKSlcbiAgICB0aGlzLiN1c2VyR3JvdXBlZENvbmRpdGlvbnNbMF0uc2V0Q29vcmRpbmF0b3IodW5kZWZpbmVkKVxuICB9XG5cbiAgZ2V0IGFzUGVyVXNlckdyb3VwaW5ncyAoKSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLiN1c2VyR3JvdXBlZENvbmRpdGlvbnNdXG4gIH1cblxuICBnZXQgaGFzQ29uZGl0aW9ucyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuI3VzZXJHcm91cGVkQ29uZGl0aW9ucy5sZW5ndGggPiAwXG4gIH1cblxuICBnZXQgbGFzdEluZGV4ICgpIHtcbiAgICByZXR1cm4gdGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zLmxlbmd0aCAtIDFcbiAgfVxuXG4gIHRvUHJlc2VudGF0aW9uU3RyaW5nICgpIHtcbiAgICByZXR1cm4gdGhpcy4jZ3JvdXBlZENvbmRpdGlvbnMubWFwKGNvbmRpdGlvbiA9PiBjb25kaXRpb24udG9QcmVzZW50YXRpb25TdHJpbmcoKSkuam9pbignICcpXG4gIH1cblxuICB0b0V4cHJlc3Npb24gKCkge1xuICAgIHJldHVybiB0aGlzLiNncm91cGVkQ29uZGl0aW9ucy5tYXAoY29uZGl0aW9uID0+IGNvbmRpdGlvbi50b0V4cHJlc3Npb24oKSkuam9pbignICcpXG4gIH1cblxuICBfYXBwbHlHcm91cHMgKHVzZXJHcm91cGVkQ29uZGl0aW9ucykge1xuICAgIGNvbnN0IGNvcnJlY3RlZFVzZXJHcm91cHMgPSB1c2VyR3JvdXBlZENvbmRpdGlvbnNcbiAgICAgIC5tYXAoY29uZGl0aW9uID0+XG4gICAgICAgIGNvbmRpdGlvbiBpbnN0YW5jZW9mIENvbmRpdGlvbkdyb3VwICYmIGNvbmRpdGlvbi5jb25kaXRpb25zLmxlbmd0aCA+IDJcbiAgICAgICAgICA/IG5ldyBDb25kaXRpb25Hcm91cCh0aGlzLl9ncm91cChjb25kaXRpb24uY29uZGl0aW9ucywgdGhpcy5fYXV0b0dyb3VwRGVmcyhjb25kaXRpb24uY29uZGl0aW9ucykpKVxuICAgICAgICAgIDogY29uZGl0aW9uXG4gICAgICApXG4gICAgcmV0dXJuIHRoaXMuX2dyb3VwKGNvcnJlY3RlZFVzZXJHcm91cHMsIHRoaXMuX2F1dG9Hcm91cERlZnMoY29ycmVjdGVkVXNlckdyb3VwcykpXG4gIH1cblxuICBfZ3JvdXAgKGNvbmRpdGlvbnMsIGdyb3VwRGVmcykge1xuICAgIHJldHVybiBjb25kaXRpb25zLnJlZHVjZSgoZ3JvdXBzLCBjb25kaXRpb24sIGluZGV4LCBjb25kaXRpb25zKSA9PiB7XG4gICAgICBjb25zdCBncm91cERlZiA9IGdyb3VwRGVmcy5maW5kKGdyb3VwRGVmID0+IGdyb3VwRGVmLmNvbnRhaW5zKGluZGV4KSlcbiAgICAgIGlmIChncm91cERlZikge1xuICAgICAgICBpZiAoZ3JvdXBEZWYuc3RhcnRzV2l0aChpbmRleCkpIHtcbiAgICAgICAgICBjb25zdCBncm91cENvbmRpdGlvbnMgPSBncm91cERlZi5hcHBseVRvKGNvbmRpdGlvbnMpXG4gICAgICAgICAgZ3JvdXBzLnB1c2gobmV3IENvbmRpdGlvbkdyb3VwKGdyb3VwQ29uZGl0aW9ucykpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdyb3Vwcy5wdXNoKGNvbmRpdGlvbilcbiAgICAgIH1cbiAgICAgIHJldHVybiBncm91cHNcbiAgICB9LCBbXSlcbiAgfVxuXG4gIF91bmdyb3VwIChjb25kaXRpb25zLCBzcGxpdEluZGV4KSB7XG4gICAgaWYgKGNvbmRpdGlvbnNbc3BsaXRJbmRleF0uaXNHcm91cCgpKSB7XG4gICAgICBjb25zdCBjb3B5ID0gWy4uLmNvbmRpdGlvbnNdXG4gICAgICBjb3B5LnNwbGljZShzcGxpdEluZGV4LCAxLCAuLi4oY29uZGl0aW9uc1tzcGxpdEluZGV4XS5jb25kaXRpb25zKSlcbiAgICAgIHJldHVybiBjb3B5XG4gICAgfVxuICAgIHJldHVybiBjb25kaXRpb25zXG4gIH1cblxuICBfYXV0b0dyb3VwRGVmcyAoY29uZGl0aW9ucykge1xuICAgIGNvbnN0IG9yUG9zaXRpb25zID0gW11cbiAgICBjb25kaXRpb25zLmZvckVhY2goKGNvbmRpdGlvbiwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChjb25kaXRpb24uZ2V0Q29vcmRpbmF0b3IoKSA9PT0gY29vcmRpbmF0b3JzLk9SKSB7XG4gICAgICAgIG9yUG9zaXRpb25zLnB1c2goaW5kZXgpXG4gICAgICB9XG4gICAgfSlcbiAgICBjb25zdCBoYXNBbmQgPSAhIWNvbmRpdGlvbnMuZmluZChjb25kaXRpb24gPT4gY29uZGl0aW9uLmdldENvb3JkaW5hdG9yKCkgPT09IGNvb3JkaW5hdG9ycy5BTkQpXG4gICAgY29uc3QgaGFzT3IgPSBvclBvc2l0aW9ucy5sZW5ndGggPiAwXG4gICAgaWYgKGhhc0FuZCAmJiBoYXNPcikge1xuICAgICAgbGV0IHN0YXJ0ID0gMFxuICAgICAgY29uc3QgZ3JvdXBEZWZzID0gW11cbiAgICAgIG9yUG9zaXRpb25zLmZvckVhY2goKHBvc2l0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgICBpZiAoc3RhcnQgPCBwb3NpdGlvbiAtIDEpIHtcbiAgICAgICAgICBncm91cERlZnMucHVzaChuZXcgR3JvdXBEZWYoc3RhcnQsIHBvc2l0aW9uIC0gMSkpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGhpc0lzVGhlTGFzdE9yID0gb3JQb3NpdGlvbnMubGVuZ3RoID09PSBpbmRleCArIDFcbiAgICAgICAgY29uc3QgdGhlcmVBcmVNb3JlQ29uZGl0aW9ucyA9IGNvbmRpdGlvbnMubGVuZ3RoIC0gMSA+IHBvc2l0aW9uXG4gICAgICAgIGlmICh0aGlzSXNUaGVMYXN0T3IgJiYgdGhlcmVBcmVNb3JlQ29uZGl0aW9ucykge1xuICAgICAgICAgIGdyb3VwRGVmcy5wdXNoKG5ldyBHcm91cERlZihwb3NpdGlvbiwgY29uZGl0aW9ucy5sZW5ndGggLSAxKSlcbiAgICAgICAgfVxuICAgICAgICBzdGFydCA9IHBvc2l0aW9uXG4gICAgICB9KVxuICAgICAgcmV0dXJuIGdyb3VwRGVmc1xuICAgIH1cbiAgICByZXR1cm4gW11cbiAgfVxuXG4gIHRvSlNPTiAoKSB7XG4gICAgY29uc3QgbmFtZSA9IHRoaXMuI2NvbmRpdGlvbk5hbWVcbiAgICBjb25zdCBjb25kaXRpb25zID0gdGhpcy4jdXNlckdyb3VwZWRDb25kaXRpb25zXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICBjb25kaXRpb25zOiBjb25kaXRpb25zLm1hcChpdCA9PiBpdC5jbG9uZSgpKVxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBmcm9tIChvYmopIHtcbiAgICBjb25zdCB0b1JldHVybiA9IG5ldyBDb25kaXRpb25zTW9kZWwoKVxuICAgIHRvUmV0dXJuLiNjb25kaXRpb25OYW1lID0gb2JqLm5hbWVcbiAgICB0b1JldHVybi4jdXNlckdyb3VwZWRDb25kaXRpb25zID0gb2JqLmNvbmRpdGlvbnMubWFwKGl0ID0+IGNvbmRpdGlvbkZyb20oaXQpKVxuICAgIHRvUmV0dXJuLiNncm91cGVkQ29uZGl0aW9ucyA9IHRvUmV0dXJuLl9hcHBseUdyb3Vwcyh0b1JldHVybi4jdXNlckdyb3VwZWRDb25kaXRpb25zKVxuICAgIHJldHVybiB0b1JldHVyblxuICB9XG59XG5cbmZ1bmN0aW9uIGNvbmRpdGlvbkZyb20gKGl0KSB7XG4gIHJldHVybiBpdC5jb25kaXRpb25zXG4gICAgPyBuZXcgQ29uZGl0aW9uR3JvdXAoaXQuY29uZGl0aW9ucy5tYXAoY29uZGl0aW9uID0+IGNvbmRpdGlvbkZyb20oY29uZGl0aW9uKSkpXG4gICAgOiBuZXcgQ29uZGl0aW9uKEZpZWxkLmZyb20oaXQuZmllbGQpLCBpdC5vcGVyYXRvciwgdmFsdWVGcm9tKGl0LnZhbHVlKSwgaXQuY29vcmRpbmF0b3IpXG59XG5cbmV4cG9ydCBjbGFzcyBHcm91cERlZiB7XG4gIGNvbnN0cnVjdG9yIChmaXJzdCwgbGFzdCkge1xuICAgIGlmICh0eXBlb2YgZmlyc3QgIT09ICdudW1iZXInIHx8IHR5cGVvZiBsYXN0ICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgRXJyb3IoYENhbm5vdCBjb25zdHJ1Y3QgYSBncm91cCBmcm9tICR7Zmlyc3R9IGFuZCAke2xhc3R9YClcbiAgICB9IGVsc2UgaWYgKGZpcnN0ID49IGxhc3QpIHtcbiAgICAgIHRocm93IEVycm9yKGBMYXN0ICgke2xhc3R9KSBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBmaXJzdCAoJHtmaXJzdH0pYClcbiAgICB9XG4gICAgdGhpcy5maXJzdCA9IGZpcnN0XG4gICAgdGhpcy5sYXN0ID0gbGFzdFxuICB9XG5cbiAgY29udGFpbnMgKGluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuZmlyc3QgPD0gaW5kZXggJiYgdGhpcy5sYXN0ID49IGluZGV4XG4gIH1cblxuICBzdGFydHNXaXRoIChpbmRleCkge1xuICAgIHJldHVybiB0aGlzLmZpcnN0ID09PSBpbmRleFxuICB9XG5cbiAgYXBwbHlUbyAoY29uZGl0aW9ucykge1xuICAgIHJldHVybiBbLi4uY29uZGl0aW9uc10uc3BsaWNlKHRoaXMuZmlyc3QsICh0aGlzLmxhc3QgLSB0aGlzLmZpcnN0KSArIDEpXG4gIH1cbn1cblxuY2xhc3MgQ29uZGl0aW9uR3JvdXAge1xuICBjb25zdHJ1Y3RvciAoY29uZGl0aW9ucykge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShjb25kaXRpb25zKSB8fCBjb25kaXRpb25zLmxlbmd0aCA8IDIpIHtcbiAgICAgIHRocm93IEVycm9yKGBDYW5ub3QgY29uc3RydWN0IGEgY29uZGl0aW9uIGdyb3VwIGZyb20gJHtjb25kaXRpb25zfWApXG4gICAgfVxuICAgIHRoaXMuY29uZGl0aW9ucyA9IGNvbmRpdGlvbnNcbiAgfVxuXG4gIHRvUHJlc2VudGF0aW9uU3RyaW5nICgpIHtcbiAgICBjb25zdCBjb3B5ID0gWy4uLnRoaXMuY29uZGl0aW9uc11cbiAgICBjb3B5LnNwbGljZSgwLCAxKVxuICAgIHJldHVybiBgJHt0aGlzLmNvb3JkaW5hdG9yU3RyaW5nKCl9JHt0aGlzLmNvbmRpdGlvblN0cmluZygpfWBcbiAgfVxuXG4gIHRvRXhwcmVzc2lvbiAoKSB7XG4gICAgY29uc3QgY29weSA9IFsuLi50aGlzLmNvbmRpdGlvbnNdXG4gICAgY29weS5zcGxpY2UoMCwgMSlcbiAgICByZXR1cm4gYCR7dGhpcy5jb29yZGluYXRvclN0cmluZygpfSR7dGhpcy5jb25kaXRpb25FeHByZXNzaW9uKCl9YFxuICB9XG5cbiAgY29vcmRpbmF0b3JTdHJpbmcgKCkge1xuICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnNbMF0uY29vcmRpbmF0b3JTdHJpbmcoKVxuICB9XG5cbiAgY29uZGl0aW9uU3RyaW5nICgpIHtcbiAgICBjb25zdCBjb3B5ID0gWy4uLnRoaXMuY29uZGl0aW9uc11cbiAgICBjb3B5LnNwbGljZSgwLCAxKVxuICAgIHJldHVybiBgKCR7dGhpcy5jb25kaXRpb25zWzBdLmNvbmRpdGlvblN0cmluZygpfSAke2NvcHkubWFwKGNvbmRpdGlvbiA9PiBjb25kaXRpb24udG9QcmVzZW50YXRpb25TdHJpbmcoKSkuam9pbignICcpfSlgXG4gIH1cblxuICBjb25kaXRpb25FeHByZXNzaW9uICgpIHtcbiAgICBjb25zdCBjb3B5ID0gWy4uLnRoaXMuY29uZGl0aW9uc11cbiAgICBjb3B5LnNwbGljZSgwLCAxKVxuICAgIHJldHVybiBgKCR7dGhpcy5jb25kaXRpb25zWzBdLmNvbmRpdGlvbkV4cHJlc3Npb24oKX0gJHtjb3B5Lm1hcChjb25kaXRpb24gPT4gY29uZGl0aW9uLnRvRXhwcmVzc2lvbigpKS5qb2luKCcgJyl9KWBcbiAgfVxuXG4gIGFzRmlyc3RDb25kaXRpb24gKCkge1xuICAgIHRoaXMuY29uZGl0aW9uc1swXS5hc0ZpcnN0Q29uZGl0aW9uKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZ2V0Q29vcmRpbmF0b3IgKCkge1xuICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnNbMF0uZ2V0Q29vcmRpbmF0b3IoKVxuICB9XG5cbiAgc2V0Q29vcmRpbmF0b3IgKGNvb3JkaW5hdG9yKSB7XG4gICAgdGhpcy5jb25kaXRpb25zWzBdLnNldENvb3JkaW5hdG9yKGNvb3JkaW5hdG9yKVxuICB9XG5cbiAgaXNHcm91cCAoKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGNsb25lICgpIHtcbiAgICByZXR1cm4gbmV3IENvbmRpdGlvbkdyb3VwKHRoaXMuY29uZGl0aW9ucy5tYXAoY29uZGl0aW9uID0+IGNvbmRpdGlvbi5jbG9uZSgpKSlcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29uZGl0aW9uIHtcbiAgY29uc3RydWN0b3IgKGZpZWxkLCBvcGVyYXRvciwgdmFsdWUsIGNvb3JkaW5hdG9yKSB7XG4gICAgaWYgKCEoZmllbGQgaW5zdGFuY2VvZiBGaWVsZCkpIHtcbiAgICAgIHRocm93IEVycm9yKGBmaWVsZCAke2ZpZWxkfSBpcyBub3QgYSB2YWxpZCBGaWVsZCBvYmplY3RgKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wZXJhdG9yICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgRXJyb3IoYG9wZXJhdG9yICR7b3BlcmF0b3J9IGlzIG5vdCBhIHZhbGlkIG9wZXJhdG9yYClcbiAgICB9XG4gICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBBYnN0cmFjdENvbmRpdGlvblZhbHVlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoYHZhbHVlICR7dmFsdWV9IGlzIG5vdCBhIHZhbGlkIHZhbHVlIHR5cGVgKVxuICAgIH1cbiAgICBpZiAoY29vcmRpbmF0b3IgJiYgIU9iamVjdC52YWx1ZXMoY29vcmRpbmF0b3JzKS5pbmNsdWRlcyhjb29yZGluYXRvcikpIHtcbiAgICAgIHRocm93IEVycm9yKGBjb29yZGluYXRvciAke2Nvb3JkaW5hdG9yfSBpcyBub3QgYSB2YWxpZCBjb29yZGluYXRvcmApXG4gICAgfVxuICAgIHRoaXMuZmllbGQgPSBmaWVsZFxuICAgIHRoaXMub3BlcmF0b3IgPSBvcGVyYXRvclxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICAgIHRoaXMuY29vcmRpbmF0b3IgPSBjb29yZGluYXRvclxuICB9XG5cbiAgdG9QcmVzZW50YXRpb25TdHJpbmcgKCkge1xuICAgIHJldHVybiBgJHt0aGlzLmNvb3JkaW5hdG9yU3RyaW5nKCl9JHt0aGlzLmNvbmRpdGlvblN0cmluZygpfWBcbiAgfVxuXG4gIHRvRXhwcmVzc2lvbiAoKSB7XG4gICAgcmV0dXJuIGAke3RoaXMuY29vcmRpbmF0b3JTdHJpbmcoKX0ke3RoaXMuY29uZGl0aW9uRXhwcmVzc2lvbigpfWBcbiAgfVxuXG4gIGNvbmRpdGlvblN0cmluZyAoKSB7XG4gICAgcmV0dXJuIGAnJHt0aGlzLmZpZWxkLmRpc3BsYXl9JyAke3RoaXMub3BlcmF0b3J9ICcke3RoaXMudmFsdWUudG9QcmVzZW50YXRpb25TdHJpbmcoKX0nYFxuICB9XG5cbiAgY29uZGl0aW9uRXhwcmVzc2lvbiAoKSB7XG4gICAgcmV0dXJuIGdldEV4cHJlc3Npb24odGhpcy5maWVsZC50eXBlLCB0aGlzLmZpZWxkLm5hbWUsIHRoaXMub3BlcmF0b3IsIHRoaXMudmFsdWUpXG4gIH1cblxuICBjb29yZGluYXRvclN0cmluZyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29vcmRpbmF0b3IgPyBgJHt0aGlzLmNvb3JkaW5hdG9yfSBgIDogJydcbiAgfVxuXG4gIGdldENvb3JkaW5hdG9yICgpIHtcbiAgICByZXR1cm4gdGhpcy5jb29yZGluYXRvclxuICB9XG5cbiAgc2V0Q29vcmRpbmF0b3IgKGNvb3JkaW5hdG9yKSB7XG4gICAgdGhpcy5jb29yZGluYXRvciA9IGNvb3JkaW5hdG9yXG4gIH1cblxuICBhc0ZpcnN0Q29uZGl0aW9uICgpIHtcbiAgICBkZWxldGUgdGhpcy5jb29yZGluYXRvclxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBpc0dyb3VwICgpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGNsb25lICgpIHtcbiAgICByZXR1cm4gbmV3IENvbmRpdGlvbihGaWVsZC5mcm9tKHRoaXMuZmllbGQpLCB0aGlzLm9wZXJhdG9yLCB0aGlzLnZhbHVlLmNsb25lKCksIHRoaXMuY29vcmRpbmF0b3IpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZpZWxkIHtcbiAgY29uc3RydWN0b3IgKG5hbWUsIHR5cGUsIGRpc3BsYXkpIHtcbiAgICBpZiAoIW5hbWUgfHwgdHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBFcnJvcihgbmFtZSAke25hbWV9IGlzIG5vdCB2YWxpZGApXG4gICAgfVxuICAgIGlmICghQ29tcG9uZW50VHlwZXMuZmluZChjb21wb25lbnRUeXBlID0+IGNvbXBvbmVudFR5cGUubmFtZSA9PT0gdHlwZSkpIHtcbiAgICAgIHRocm93IEVycm9yKGB0eXBlICR7dHlwZX0gaXMgbm90IHZhbGlkYClcbiAgICB9XG4gICAgaWYgKCFkaXNwbGF5IHx8IHR5cGVvZiBkaXNwbGF5ICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgRXJyb3IoYGRpc3BsYXkgJHtkaXNwbGF5fSBpcyBub3QgdmFsaWRgKVxuICAgIH1cbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMuZGlzcGxheSA9IGRpc3BsYXlcbiAgfVxuXG4gIHN0YXRpYyBmcm9tIChvYmopIHtcbiAgICByZXR1cm4gbmV3IEZpZWxkKG9iai5uYW1lLCBvYmoudHlwZSwgb2JqLmRpc3BsYXkpXG4gIH1cbn1cbiJdfQ==