"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.valueFrom = valueFrom;
exports.RelativeTimeValue = exports.dateTimeUnits = exports.timeUnits = exports.dateUnits = exports.dateDirections = exports.ConditionValue = exports.AbstractConditionValue = void 0;

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var conditionValueFactories = {};

var Registration = function Registration(type, factory) {
  (0, _classCallCheck2["default"])(this, Registration);
  conditionValueFactories[type] = factory;
  this.type = type;
};

var AbstractConditionValue = /*#__PURE__*/function () {
  function AbstractConditionValue(registration) {
    (0, _classCallCheck2["default"])(this, AbstractConditionValue);

    if ((this instanceof AbstractConditionValue ? this.constructor : void 0) === AbstractConditionValue) {
      throw new TypeError('Cannot construct ConditionValue instances directly');
    }

    if (!(registration instanceof Registration)) {
      throw new TypeError('You must register your value type! Call registerValueType!');
    }

    this.type = registration.type;
  }

  (0, _createClass2["default"])(AbstractConditionValue, [{
    key: "toPresentationString",
    value: function toPresentationString() {}
  }, {
    key: "toExpression",
    value: function toExpression() {}
  }]);
  return AbstractConditionValue;
}();

exports.AbstractConditionValue = AbstractConditionValue;
var valueType = registerValueType('Value', function (obj) {
  return ConditionValue.from(obj);
});

var ConditionValue = /*#__PURE__*/function (_AbstractConditionVal) {
  (0, _inherits2["default"])(ConditionValue, _AbstractConditionVal);

  var _super = _createSuper(ConditionValue);

  function ConditionValue(value, display) {
    var _this;

    (0, _classCallCheck2["default"])(this, ConditionValue);
    _this = _super.call(this, valueType);

    if (!value || typeof value !== 'string') {
      throw Error("value ".concat(value, " is not valid"));
    }

    if (display && typeof display !== 'string') {
      throw Error("display ".concat(display, " is not valid"));
    }

    _this.value = value;
    _this.display = display || value;
    return _this;
  }

  (0, _createClass2["default"])(ConditionValue, [{
    key: "toPresentationString",
    value: function toPresentationString() {
      return this.display;
    }
  }, {
    key: "toExpression",
    value: function toExpression() {
      return this.value;
    }
  }, {
    key: "clone",
    value: function clone() {
      return ConditionValue.from(this);
    }
  }], [{
    key: "from",
    value: function from(obj) {
      return new ConditionValue(obj.value, obj.display);
    }
  }]);
  return ConditionValue;
}(AbstractConditionValue);

exports.ConditionValue = ConditionValue;
var dateDirections = {
  FUTURE: 'in the future',
  PAST: 'in the past'
};
exports.dateDirections = dateDirections;
var dateUnits = {
  YEARS: {
    display: 'year(s)',
    value: 'years'
  },
  MONTHS: {
    display: 'month(s)',
    value: 'months'
  },
  DAYS: {
    display: 'day(s)',
    value: 'days'
  }
};
exports.dateUnits = dateUnits;
var timeUnits = {
  HOURS: {
    display: 'hour(s)',
    value: 'hours'
  },
  MINUTES: {
    display: 'minute(s)',
    value: 'minutes'
  },
  SECONDS: {
    display: 'second(s)',
    value: 'seconds'
  }
};
exports.timeUnits = timeUnits;
var dateTimeUnits = Object.assign({}, dateUnits, timeUnits);
exports.dateTimeUnits = dateTimeUnits;
var relativeTimeValueType = registerValueType('RelativeTime', function (obj) {
  return RelativeTimeValue.from(obj);
});

var RelativeTimeValue = /*#__PURE__*/function (_AbstractConditionVal2) {
  (0, _inherits2["default"])(RelativeTimeValue, _AbstractConditionVal2);

  var _super2 = _createSuper(RelativeTimeValue);

  function RelativeTimeValue(timePeriod, timeUnit, direction) {
    var _this2;

    var timeOnly = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    (0, _classCallCheck2["default"])(this, RelativeTimeValue);
    _this2 = _super2.call(this, relativeTimeValueType);

    if (typeof timePeriod !== 'string') {
      throw Error("time period ".concat(timePeriod, " is not valid"));
    }

    if (!Object.values(dateTimeUnits).map(function (it) {
      return it.value;
    }).includes(timeUnit)) {
      throw Error("time unit ".concat(timeUnit, " is not valid"));
    }

    if (!Object.values(dateDirections).includes(direction)) {
      throw Error("direction ".concat(direction, " is not valid"));
    }

    _this2.timePeriod = timePeriod;
    _this2.timeUnit = timeUnit;
    _this2.direction = direction;
    _this2.timeOnly = timeOnly;
    return _this2;
  }

  (0, _createClass2["default"])(RelativeTimeValue, [{
    key: "toPresentationString",
    value: function toPresentationString() {
      return "".concat(this.timePeriod, " ").concat(this.timeUnit, " ").concat(this.direction);
    }
  }, {
    key: "toExpression",
    value: function toExpression() {
      var timePeriod = this.direction === dateDirections.PAST ? 0 - Number(this.timePeriod) : this.timePeriod;
      return this.timeOnly ? "timeForComparison(".concat(timePeriod, ", '").concat(this.timeUnit, "')") : "dateForComparison(".concat(timePeriod, ", '").concat(this.timeUnit, "')");
    }
  }, {
    key: "clone",
    value: function clone() {
      return RelativeTimeValue.from(this);
    }
  }], [{
    key: "from",
    value: function from(obj) {
      return new RelativeTimeValue(obj.timePeriod, obj.timeUnit, obj.direction, obj.timeOnly);
    }
  }]);
  return RelativeTimeValue;
}(AbstractConditionValue);
/**
 * All value types should call this, and should be located in this file.
 * Furthermore the types should be registered without the classes needing to be instantiated.
 *
 * Otherwise we can't guarantee they've been registered for deserialization before
 * valueFrom is called
 */


exports.RelativeTimeValue = RelativeTimeValue;

function registerValueType(type, factory) {
  return new Registration(type, factory);
}

function valueFrom(obj) {
  return conditionValueFactories[obj.type](obj);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25kaXRpb25zL2lubGluZS1jb25kaXRpb24tdmFsdWVzLmpzIl0sIm5hbWVzIjpbImNvbmRpdGlvblZhbHVlRmFjdG9yaWVzIiwiUmVnaXN0cmF0aW9uIiwidHlwZSIsImZhY3RvcnkiLCJBYnN0cmFjdENvbmRpdGlvblZhbHVlIiwicmVnaXN0cmF0aW9uIiwiVHlwZUVycm9yIiwidmFsdWVUeXBlIiwicmVnaXN0ZXJWYWx1ZVR5cGUiLCJvYmoiLCJDb25kaXRpb25WYWx1ZSIsImZyb20iLCJ2YWx1ZSIsImRpc3BsYXkiLCJFcnJvciIsImRhdGVEaXJlY3Rpb25zIiwiRlVUVVJFIiwiUEFTVCIsImRhdGVVbml0cyIsIllFQVJTIiwiTU9OVEhTIiwiREFZUyIsInRpbWVVbml0cyIsIkhPVVJTIiwiTUlOVVRFUyIsIlNFQ09ORFMiLCJkYXRlVGltZVVuaXRzIiwiT2JqZWN0IiwiYXNzaWduIiwicmVsYXRpdmVUaW1lVmFsdWVUeXBlIiwiUmVsYXRpdmVUaW1lVmFsdWUiLCJ0aW1lUGVyaW9kIiwidGltZVVuaXQiLCJkaXJlY3Rpb24iLCJ0aW1lT25seSIsInZhbHVlcyIsIm1hcCIsIml0IiwiaW5jbHVkZXMiLCJOdW1iZXIiLCJ2YWx1ZUZyb20iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQU1BLHVCQUF1QixHQUFHLEVBQWhDOztJQUVNQyxZLEdBQ0osc0JBQWFDLElBQWIsRUFBbUJDLE9BQW5CLEVBQTRCO0FBQUE7QUFDMUJILEVBQUFBLHVCQUF1QixDQUFDRSxJQUFELENBQXZCLEdBQWdDQyxPQUFoQztBQUNBLE9BQUtELElBQUwsR0FBWUEsSUFBWjtBQUNELEM7O0lBR1VFLHNCO0FBQ1gsa0NBQWFDLFlBQWIsRUFBMkI7QUFBQTs7QUFDekIsUUFBSSx5RUFBZUQsc0JBQW5CLEVBQTJDO0FBQ3pDLFlBQU0sSUFBSUUsU0FBSixDQUFjLG9EQUFkLENBQU47QUFDRDs7QUFDRCxRQUFJLEVBQUVELFlB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QXZCLENBQVA7QUFDRDs7O3lCQU5ZRixHLEVBQUs7QUFDaEIsYUFBTyxJQUFJcUIsaUJBQUosQ0FBc0JyQixHQUFHLENBQUNzQixVQUExQixFQUFzQ3RCLEdBQUcsQ0FBQ3VCLFFBQTFDLEVBQW9EdkIsR0FBRyxDQUFDd0IsU0FBeEQsRUFBbUV4QixHQUFHLENBQUN5QixRQUF2RSxDQUFQO0FBQ0Q7OztFQTdCb0M5QixzQjtBQW9DdkM7Ozs7Ozs7Ozs7O0FBT0EsU0FBU0ksaUJBQVQsQ0FBNEJOLElBQTVCLEVBQWtDQyxPQUFsQyxFQUEyQztBQUN6QyxTQUFPLElBQUlGLFlBQUosQ0FBaUJDLElBQWpCLEVBQXVCQyxPQUF2QixDQUFQO0FBQ0Q7O0FBRU0sU0FBU3FDLFNBQVQsQ0FBb0IvQixHQUFwQixFQUF5QjtBQUM5QixTQUFPVCx1QkFBdUIsQ0FBQ1MsR0FBRyxDQUFDUCxJQUFMLENBQXZCLENBQWtDTyxHQUFsQyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBjb25kaXRpb25WYWx1ZUZhY3RvcmllcyA9IHt9XG5cbmNsYXNzIFJlZ2lzdHJhdGlvbiB7XG4gIGNvbnN0cnVjdG9yICh0eXBlLCBmYWN0b3J5KSB7XG4gICAgY29uZGl0aW9uVmFsdWVGYWN0b3JpZXNbdHlwZV0gPSBmYWN0b3J5XG4gICAgdGhpcy50eXBlID0gdHlwZVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBYnN0cmFjdENvbmRpdGlvblZhbHVlIHtcbiAgY29uc3RydWN0b3IgKHJlZ2lzdHJhdGlvbikge1xuICAgIGlmIChuZXcudGFyZ2V0ID09PSBBYnN0cmFjdENvbmRpdGlvblZhbHVlKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29uc3RydWN0IENvbmRpdGlvblZhbHVlIGluc3RhbmNlcyBkaXJlY3RseScpXG4gICAgfVxuICAgIGlmICghKHJlZ2lzdHJhdGlvbiBpbnN0YW5jZW9mIFJlZ2lzdHJhdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHJlZ2lzdGVyIHlvdXIgdmFsdWUgdHlwZSEgQ2FsbCByZWdpc3RlclZhbHVlVHlwZSEnKVxuICAgIH1cbiAgICB0aGlzLnR5cGUgPSByZWdpc3RyYXRpb24udHlwZVxuICB9XG5cbiAgdG9QcmVzZW50YXRpb25TdHJpbmcgKCkge31cbiAgdG9FeHByZXNzaW9uICgpIHt9XG59XG5cbmNvbnN0IHZhbHVlVHlwZSA9IHJlZ2lzdGVyVmFsdWVUeXBlKCdWYWx1ZScsIG9iaiA9PiBDb25kaXRpb25WYWx1ZS5mcm9tKG9iaikpXG5leHBvcnQgY2xhc3MgQ29uZGl0aW9uVmFsdWUgZXh0ZW5kcyBBYnN0cmFjdENvbmRpdGlvblZhbHVlIHtcbiAgY29uc3RydWN0b3IgKHZhbHVlLCBkaXNwbGF5KSB7XG4gICAgc3VwZXIodmFsdWVUeXBlKVxuICAgIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgRXJyb3IoYHZhbHVlICR7dmFsdWV9IGlzIG5vdCB2YWxpZGApXG4gICAgfVxuICAgIGlmIChkaXNwbGF5ICYmIHR5cGVvZiBkaXNwbGF5ICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgRXJyb3IoYGRpc3BsYXkgJHtkaXNwbGF5fSBpcyBub3QgdmFsaWRgKVxuICAgIH1cbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcbiAgICB0aGlzLmRpc3BsYXkgPSBkaXNwbGF5IHx8IHZhbHVlXG4gIH1cblxuICB0b1ByZXNlbnRhdGlvblN0cmluZyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGxheVxuICB9XG5cbiAgdG9FeHByZXNzaW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZVxuICB9XG5cbiAgc3RhdGljIGZyb20gKG9iaikge1xuICAgIHJldHVybiBuZXcgQ29uZGl0aW9uVmFsdWUob2JqLnZhbHVlLCBvYmouZGlzcGxheSlcbiAgfVxuXG4gIGNsb25lICgpIHtcbiAgICByZXR1cm4gQ29uZGl0aW9uVmFsdWUuZnJvbSh0aGlzKVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBkYXRlRGlyZWN0aW9ucyA9IHtcbiAgRlVUVVJFOiAnaW4gdGhlIGZ1dHVyZScsXG4gIFBBU1Q6ICdpbiB0aGUgcGFzdCdcbn1cblxuZXhwb3J0IGNvbnN0IGRhdGVVbml0cyA9IHtcbiAgWUVBUlM6IHsgZGlzcGxheTogJ3llYXIocyknLCB2YWx1ZTogJ3llYXJzJyB9LFxuICBNT05USFM6IHsgZGlzcGxheTogJ21vbnRoKHMpJywgdmFsdWU6ICdtb250aHMnIH0sXG4gIERBWVM6IHsgZGlzcGxheTogJ2RheShzKScsIHZhbHVlOiAnZGF5cycgfVxufVxuZXhwb3J0IGNvbnN0IHRpbWVVbml0cyA9IHtcbiAgSE9VUlM6IHsgZGlzcGxheTogJ2hvdXIocyknLCB2YWx1ZTogJ2hvdXJzJyB9LFxuICBNSU5VVEVTOiB7IGRpc3BsYXk6ICdtaW51dGUocyknLCB2YWx1ZTogJ21pbnV0ZXMnIH0sXG4gIFNFQ09ORFM6IHsgZGlzcGxheTogJ3NlY29uZChzKScsIHZhbHVlOiAnc2Vjb25kcycgfVxufVxuZXhwb3J0IGNvbnN0IGRhdGVUaW1lVW5pdHMgPSBPYmplY3QuYXNzaWduKHt9LCBkYXRlVW5pdHMsIHRpbWVVbml0cylcblxuY29uc3QgcmVsYXRpdmVUaW1lVmFsdWVUeXBlID0gcmVnaXN0ZXJWYWx1ZVR5cGUoJ1JlbGF0aXZlVGltZScsIG9iaiA9PiBSZWxhdGl2ZVRpbWVWYWx1ZS5mcm9tKG9iaikpXG5leHBvcnQgY2xhc3MgUmVsYXRpdmVUaW1lVmFsdWUgZXh0ZW5kcyBBYnN0cmFjdENvbmRpdGlvblZhbHVlIHtcbiAgY29uc3RydWN0b3IgKHRpbWVQZXJpb2QsIHRpbWVVbml0LCBkaXJlY3Rpb24sIHRpbWVPbmx5ID0gZmFsc2UpIHtcbiAgICBzdXBlcihyZWxhdGl2ZVRpbWVWYWx1ZVR5cGUpXG4gICAgaWYgKHR5cGVvZiB0aW1lUGVyaW9kICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgRXJyb3IoYHRpbWUgcGVyaW9kICR7dGltZVBlcmlvZH0gaXMgbm90IHZhbGlkYClcbiAgICB9XG4gICAgaWYgKCFPYmplY3QudmFsdWVzKGRhdGVUaW1lVW5pdHMpLm1hcChpdCA9PiBpdC52YWx1ZSkuaW5jbHVkZXModGltZVVuaXQpKSB7XG4gICAgICB0aHJvdyBFcnJvcihgdGltZSB1bml0ICR7dGltZVVuaXR9IGlzIG5vdCB2YWxpZGApXG4gICAgfVxuICAgIGlmICghT2JqZWN0LnZhbHVlcyhkYXRlRGlyZWN0aW9ucykuaW5jbHVkZXMoZGlyZWN0aW9uKSkge1xuICAgICAgdGhyb3cgRXJyb3IoYGRpcmVjdGlvbiAke2RpcmVjdGlvbn0gaXMgbm90IHZhbGlkYClcbiAgICB9XG4gICAgdGhpcy50aW1lUGVyaW9kID0gdGltZVBlcmlvZFxuICAgIHRoaXMudGltZVVuaXQgPSB0aW1lVW5pdFxuICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uXG4gICAgdGhpcy50aW1lT25seSA9IHRpbWVPbmx5XG4gIH1cblxuICB0b1ByZXNlbnRhdGlvblN0cmluZyAoKSB7XG4gICAgcmV0dXJuIGAke3RoaXMudGltZVBlcmlvZH0gJHt0aGlzLnRpbWVVbml0fSAke3RoaXMuZGlyZWN0aW9ufWBcbiAgfVxuXG4gIHRvRXhwcmVzc2lvbiAoKSB7XG4gICAgY29uc3QgdGltZVBlcmlvZCA9IHRoaXMuZGlyZWN0aW9uID09PSBkYXRlRGlyZWN0aW9ucy5QQVNUID8gMCAtIE51bWJlcih0aGlzLnRpbWVQZXJpb2QpIDogdGhpcy50aW1lUGVyaW9kXG4gICAgcmV0dXJuIHRoaXMudGltZU9ubHkgPyBgdGltZUZvckNvbXBhcmlzb24oJHt0aW1lUGVyaW9kfSwgJyR7dGhpcy50aW1lVW5pdH0nKWAgOiBgZGF0ZUZvckNvbXBhcmlzb24oJHt0aW1lUGVyaW9kfSwgJyR7dGhpcy50aW1lVW5pdH0nKWBcbiAgfVxuXG4gIHN0YXRpYyBmcm9tIChvYmopIHtcbiAgICByZXR1cm4gbmV3IFJlbGF0aXZlVGltZVZhbHVlKG9iai50aW1lUGVyaW9kLCBvYmoudGltZVVuaXQsIG9iai5kaXJlY3Rpb24sIG9iai50aW1lT25seSlcbiAgfVxuXG4gIGNsb25lICgpIHtcbiAgICByZXR1cm4gUmVsYXRpdmVUaW1lVmFsdWUuZnJvbSh0aGlzKVxuICB9XG59XG5cbi8qKlxuICogQWxsIHZhbHVlIHR5cGVzIHNob3VsZCBjYWxsIHRoaXMsIGFuZCBzaG91bGQgYmUgbG9jYXRlZCBpbiB0aGlzIGZpbGUuXG4gKiBGdXJ0aGVybW9yZSB0aGUgdHlwZXMgc2hvdWxkIGJlIHJlZ2lzdGVyZWQgd2l0aG91dCB0aGUgY2xhc3NlcyBuZWVkaW5nIHRvIGJlIGluc3RhbnRpYXRlZC5cbiAqXG4gKiBPdGhlcndpc2Ugd2UgY2FuJ3QgZ3VhcmFudGVlIHRoZXkndmUgYmVlbiByZWdpc3RlcmVkIGZvciBkZXNlcmlhbGl6YXRpb24gYmVmb3JlXG4gKiB2YWx1ZUZyb20gaXMgY2FsbGVkXG4gKi9cbmZ1bmN0aW9uIHJlZ2lzdGVyVmFsdWVUeXBlICh0eXBlLCBmYWN0b3J5KSB7XG4gIHJldHVybiBuZXcgUmVnaXN0cmF0aW9uKHR5cGUsIGZhY3RvcnkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWx1ZUZyb20gKG9iaikge1xuICByZXR1cm4gY29uZGl0aW9uVmFsdWVGYWN0b3JpZXNbb2JqLnR5cGVdKG9iailcbn1cbiJdfQ==