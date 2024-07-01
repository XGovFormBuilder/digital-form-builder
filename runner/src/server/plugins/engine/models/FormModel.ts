import joi from "joi";
import { add } from "date-fns";
import { Parser } from "expr-eval";
import {
  Schema,
  clone,
  ConditionsModel,
  FormDefinition,
  Page,
  ConditionRawData,
  List,
} from "@xgovformbuilder/model";

import { FormSubmissionState } from "../types";
import {
  PageControllerBase,
  getPageController,
  SummaryPageController,
} from "../pageControllers";
import { PageController } from "../pageControllers/PageController";
import { ExecutableCondition } from "server/plugins/engine/models/types";
import { DEFAULT_FEE_OPTIONS } from "server/plugins/engine/models/FormModel.feeOptions";
import { ComponentCollection } from "server/plugins/engine/components";
import { ContextComponentCollection } from "server/plugins/engine/components/ContextComponentCollection";

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

export class FormModel {
  /**
   * Responsible for instantiating the {@link PageControllerBase} and {@link EvaluationContext} from a form JSON
   */

  /** the entire form JSON as an object */
  def: FormDefinition;

  lists: FormDefinition["lists"];
  sections: FormDefinition["sections"] = [];
  options: any;
  name: any;
  values: any;
  DefaultPageController: any = PageController;
  /** the id of the form used for the first url parameter eg localhost:3009/test */
  basePath: string;
  conditions: Record<string, ExecutableCondition> | {};
  fieldsForContext: ContextComponentCollection;
  fieldsForPrePopulation: Record<string, any>;
  pages: any;
  startPage: any;
  customErrors: any;

  feeOptions: FormDefinition["feeOptions"];
  specialPages: FormDefinition["specialPages"];

  constructor(def, options) {
    const result = Schema.validate(def, { abortEarly: false, convert: false });

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
    this.customErrors = def.customErrors;

    if (options.defaultPageController) {
      this.DefaultPageController = getPageController(
        options.defaultPageController
      );
    }

    this.basePath = options.basePath;

    this.conditions = {};
    def.conditions.forEach((conditionDef) => {
      const condition = this.makeCondition(conditionDef);
      this.conditions[condition.name] = condition;
    });
    this.fieldsForContext = new ContextComponentCollection(this);
    this.fieldsForPrePopulation = {};

    // @ts-ignore
    this.pages = def.pages.map((pageDef) => this.makePage(pageDef));
    this.startPage = this.pages.find((page) => page.path === def.startPage);
    this.specialPages = def.specialPages;
    this.feeOptions = { ...DEFAULT_FEE_OPTIONS, ...def.feeOptions };
  }

  /**
   * build the entire model schema from individual pages/sections
   */
  makeSchema(state: FormSubmissionState) {
    return this.makeFilteredSchema(state, this.pages);
  }

  /**
   * build the entire model schema from individual pages/sections and filter out answers
   * for pages which are no longer accessible due to an answer that has been changed
   */
  makeFilteredSchema(_state: FormSubmissionState, relevantPages) {
    // Build the entire model schema
    // from the individual pages/sections
    let schema = joi.object().required();
    // @ts-ignore
    [undefined, ...this.sections].forEach((section) => {
      const sectionPages = relevantPages.filter(
        (page) => page.section === section
      );

      if (sectionPages.length > 0) {
        if (section) {
          const isRepeatable = sectionPages.find(
            (page) => page.pageDef.repeatField
          );

          let sectionSchema:
            | joi.ObjectSchema<any>
            | joi.ArraySchema = joi.object().required();

          sectionPages.forEach((sectionPage) => {
            sectionSchema = sectionSchema.concat(sectionPage.stateSchema);
          });

          if (isRepeatable) {
            sectionSchema = joi.array().items(sectionSchema);
          }

          schema = schema.append({
            // @ts-ignore
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

  /**
   * instantiates a Page based on {@link Page}
   */
  makePage(pageDef: Page) {
    if (pageDef.controller) {
      const PageController = getPageController(pageDef.controller);

      if (!PageController) {
        throw new Error(`PageController for ${pageDef.controller} not found`);
      }

      return new PageController(this, pageDef);
    }

    if (this.DefaultPageController) {
      const DefaultPageController = this.DefaultPageController;
      return new DefaultPageController(this, pageDef);
    }

    return new PageControllerBase(this, pageDef);
  }

  /**
   * Instantiates a Condition based on {@link ConditionRawData}
   * @param condition
   */
  makeCondition(condition: ConditionRawData) {
    const parser = new Parser({
      operators: {
        logical: true,
      },
    });

    parser.functions.dateForComparison = function (timePeriod, timeUnit) {
      return add(new Date(), { [timeUnit]: timePeriod }).toISOString();
    };

    /**
     * TODO:- this is most definitely broken.
     */
    parser.functions.timeForComparison = function (timePeriod, timeUnit) {
      const offsetTime = add(Number(timePeriod), timeUnit);
      return `${offsetTime.getHours()}:${offsetTime.getMinutes()}`;
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

  toConditionExpression(value, parser) {
    if (typeof value === "string") {
      return parser.parse(value);
    }

    const conditions = ConditionsModel.from(value);
    return parser.parse(conditions.toExpression());
  }

  get conditionOptions() {
    return { allowUnknown: true, presence: "required" };
  }

  getList(name: string): List | [] {
    return this.lists.find((list) => list.name === name) ?? [];
  }

  getContextState(state: FormSubmissionState) {
    return this.fieldsForContext.getFormDataFromState(state);
  }

  getRelevantPages(state: FormSubmissionState) {
    let nextPage = this.startPage;
    const relevantPages: any[] = [];
    let endPage = null;

    while (nextPage != null) {
      if (nextPage.hasFormComponents) {
        relevantPages.push(nextPage);
      } else if (
        !nextPage.hasNext &&
        !(nextPage instanceof SummaryPageController)
      ) {
        endPage = nextPage;
      }
      nextPage = nextPage.getNextPage(state, true);
    }

    return { relevantPages, endPage };
  }
}
