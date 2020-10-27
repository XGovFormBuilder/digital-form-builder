import path from "path";
import joi from "joi";
import moment from "moment";
import { Parser } from "expr-eval";
import { Schema, clone, ConditionsModel } from "@xgovformbuilder/model";

import Page from "./page";

/**
 * TODO - convert references to this to using the shared Data class from the model library?
 */
export default class Model {
  constructor(def, options) {
    const result = Schema.validate(def, { abortEarly: false });

    if (result.error) {
      throw result.error;
    }

    // Make a clone of the shallow copy returned
    // by joi so as not to change the source data.
    def = clone(result.value);

    // Add default lists
    def.lists.push({
      name: "__yesNo",
      title: "Yes/No",
      type: "boolean",
      items: [
        {
          text: "Yes",
          value: true,
        },
        {
          text: "No",
          value: false,
        },
      ],
    });

    this.def = def;
    this.lists = def.lists;
    this.sections = def.sections;
    this.options = options;
    this.name = def.name;
    this.values = result.value;

    if (options.defaultPageController) {
      const defaultPageControllerPath = path.resolve(
        options.relativeTo,
        options.defaultPageController
      );
      this.DefaultPageController = require(defaultPageControllerPath);
    }

    this.basePath = options.basePath;

    this.conditions = {};
    def.conditions.forEach((conditionDef) => {
      const condition = this.makeCondition(conditionDef);
      this.conditions[condition.name] = condition;
    });

    // this.expressions = {}
    // def.expressions.forEach(expressionDef => {
    //   const expression = this.makeExpression(expressionDef)
    //   this.expressions[expression.name] = expression
    // })

    this.pages = def.pages.map((pageDef) => this.makePage(pageDef));
    this.startPage = this.pages.find((page) => page.path === def.startPage);
  }

  makeSchema(state) {
    // Build the entire model schema
    // from the individual pages/sections
    return this.makeFilteredSchema(state, this.pages);
  }

  makeFilteredSchema(state, relevantPages) {
    // Build the entire model schema
    // from the individual pages/sections
    let schema = joi.object().required();
    [undefined].concat(this.sections).forEach((section) => {
      const sectionPages = relevantPages.filter(
        (page) => page.section === section
      );

      if (sectionPages.length > 0) {
        if (section) {
          const isRepeatable = sectionPages.find(
            (page) => page.pageDef.repeatField
          );

          let sectionSchema = joi.object().required();
          sectionPages.forEach((sectionPage) => {
            sectionSchema = sectionSchema.concat(sectionPage.stateSchema);
          });
          if (isRepeatable) {
            sectionSchema = joi.array().items(sectionSchema);
          }
          schema = schema.append({
            [section.name]: sectionSchema,
          });
        } else {
          sectionPages.forEach((sectionPage) => {
            schema = schema.concat(sectionPage.stateSchema);
          });
        }
      }
    });

    return schema;
  }

  makePage(pageDef) {
    if (pageDef.controller) {
      const pageControllerPath = path.resolve(
        this.options.relativeTo,
        pageDef.controller
      );
      const PageController = require(pageControllerPath);
      return new PageController(this, pageDef);
    }
    if (this.DefaultPageController) {
      const DefaultPageController = this.DefaultPageController;
      return new DefaultPageController(this, pageDef);
    }
    return new Page(this, pageDef);
  }

  makeCondition(condition) {
    const parser = new Parser({
      operators: {
        logical: true,
      },
    });
    parser.functions.dateForComparison = function (timePeriod, timeUnit) {
      return moment().add(Number(timePeriod), timeUnit).toISOString();
    };

    parser.functions.timeForComparison = function (timePeriod, timeUnit) {
      const offsetTime = moment().add(Number(timePeriod), timeUnit);
      return `${offsetTime.hour()}:${offsetTime.minutes()}`;
    };

    const { name, value } = condition;
    const expr = this.toConditionExpression(value, parser);

    const fn = (value) => {
      const ctx = new EvaluationContext(this.conditions, value);
      try {
        return expr.evaluate(ctx);
      } catch (err) {
        return false;
      }
    };

    return {
      name,
      value,
      expr,
      fn,
    };
  }

  // TODO - remove the on-the-fly condition migration condition once all forms are converted to the new condition structure
  toConditionExpression(value, parser) {
    if (typeof value === "string") {
      return parser.parse(value);
    } else {
      const conditions = ConditionsModel.from(value);
      return parser.parse(conditions.toExpression());
    }
  }

  get conditionOptions() {
    return { allowUnknown: true, presence: "required" };
  }
}

class EvaluationContext {
  constructor(conditions, value) {
    Object.assign(this, value);

    for (const key in conditions) {
      Object.defineProperty(this, key, {
        get() {
          return conditions[key].fn(value);
        },
      });
    }
  }
}
