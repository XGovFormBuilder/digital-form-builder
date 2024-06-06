import { DetailItem } from "../types";
import { format } from "date-fns";
import config from "server/config";
import nunjucks from "nunjucks";
import { FeesModel } from "./FeesModel";
import { PageControllerBase } from "server/plugins/engine/pageControllers";
import { Component } from "server/plugins/engine/components";

function answerFromDetailItem(item) {
  if (!item) {
    return;
  }
  switch (item?.dataType) {
    case "list":
      return item.rawValue;
    case "date":
      return format(new Date(item.rawValue), "yyyy-MM-dd");
    case "monthYear":
      const [month, year] = Object.values(item.rawValue);
      return format(new Date(`${year}-${month}-1`), "yyyy-MM");
    default:
      return item.value;
  }
}

function detailItemToField(item: DetailItem) {
  return {
    key: item?.name,
    title: item?.title,
    type: item?.dataType,
    answer: answerFromDetailItem(item),
  };
}

export function WebhookModel(
  relevantPages,
  details,
  model,
  fees,
  contextState
) {
  const questions = relevantPages?.map((page) => {
    const isRepeatable = !!page?.repeatField;

    const itemsForPage = details.flatMap((detail) =>
      detail?.items?.filter((item) => item.path === page.path)
    );

    const detailItems = isRepeatable
      ? [itemsForPage].map((item) => ({ ...item, isRepeatable }))
      : itemsForPage;

    let index = 0;
    const fields = detailItems.flatMap((item, i) => {
      item?.isRepeatable ? (index = i) : 0;
      const fields = [detailItemToField(item)];

      /**
       * This is currently deprecated whilst GDS fix a known issue with accessibility and conditionally revealed fields
       */
      const nestedItems = item?.items?.childrenCollection.formItems;
      nestedItems &&
        fields.push(nestedItems.map((item) => detailItemToField(item)));

      return fields;
    });

    let pageTitle = page.title;

    if (pageTitle) {
      pageTitle = nunjucks.renderString(page.title.en ?? page.title, {
        ...contextState,
      });
    }

    return {
      category: page.section?.name,
      question:
        pageTitle ?? page.components.formItems.map((item) => item.title),
      fields,
      index,
    };
  });

  // default name if no name is provided
  let englishName = `${config.serviceName} ${model.basePath}`;
  if (model.name) {
    englishName = model.name.en ?? model.name;
  }
  return {
    metadata: model.def.metadata,
    name: englishName,
    questions: questions,
    ...(!!fees && { fees }),
  };
}

export function newWebhookModel(
  model,
  relevantPages: PageControllerBase[],
  state
) {
  let englishName = `${config.serviceName} ${model.basePath}`;
  if (model.name) {
    englishName = model.name.en ?? model.name;
  }

  let questions;

  questions = relevantPages.map((page) => pagesToQuestions(page, state));

  return {
    metadata: model.def.metadata,
    name: englishName,
    questions: questions,
    fees: FeesModel(model, state),
  };
}

function createToFieldsMap(state) {
  return function (component) {
    return {
      key: component.name,
      title: component.title,
      type: component.dataType,
      answer: fieldAnswerFromComponent(component, state),
    };
  };
}

function pagesToQuestions(page: PageControllerBase, state, index = 0) {
  let sectionState = state;
  if (page.section) {
    sectionState = state[page.section.name];
  }

  if (page.section?.repeating) {
    //TODO: repeated
    const isArray = Array.isArray(sectionState);
    if (isArray) {
      return sectionState.map(state, (i) => pagesToQuestions(page, state, i));
    }
  }

  const toFields = createToFieldsMap(sectionState);
  const components = page.components.formItems;

  return {
    category: page.section?.name,
    question: page.title,
    fields: components.map(toFields),
    index,
  };
}

function fieldAnswerFromComponent(component, state) {
  if (!component) {
    return;
  }
  const rawValue = state[component.name];

  switch (component.dataType) {
    case "list":
      return rawValue;
    case "date":
      return format(new Date(rawValue), "yyyy-MM-dd");
    case "monthYear":
      const [month, year] = Object.values(rawValue);
      return format(new Date(`${year}-${month}-1`), "yyyy-MM");
    default:
      return component.getDisplayStringFromState(state);
  }
}
