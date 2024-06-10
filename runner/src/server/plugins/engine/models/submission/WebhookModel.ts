import { format } from "date-fns";
import config from "server/config";
import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { FeesModel } from "server/plugins/engine/models/submission/FeesModel";
import { FormComponent } from "server/plugins/engine/components";
import { Field } from "server/schemas/types";
import { PageControllerBase } from "server/plugins/engine/pageControllers";
import { SelectionControlField } from "server/plugins/engine/components/SelectionControlField";
export function WebhookModel(model: FormModel, state: FormSubmissionState) {
  let englishName = `${config.serviceName} ${model.basePath}`;

  if (model.name) {
    englishName = model.name.en ?? model.name;
  }

  let questions;

  const { relevantPages } = model.getRelevantPages(state);

  questions = relevantPages.map((page) => pagesToQuestions(page, state));
  const fees = FeesModel(model, state);

  return {
    metadata: model.def.metadata,
    name: englishName,
    questions: questions,
    ...(!!fees && { fees }),
  };
}

function createToFieldsMap(state: FormSubmissionState) {
  return function (component: FormComponent | SelectionControlField): Field {
    if (component.items?.childrenCollection?.formItems) {
      const toField = createToFieldsMap(state, component);

      /**
       * This is currently deprecated whilst GDS fix a known issue with accessibility and conditionally revealed fields
       */
      const nestedComponent = component?.items?.childrenCollection.formItems;
      const nestedFields = nestedComponent?.map(toField);

      return nestedFields;
    }
    return {
      key: component.name,
      title: component.title,
      type: component.dataType,
      answer: fieldAnswerFromComponent(component, state),
    };
  };
}

function pagesToQuestions(
  page: PageControllerBase,
  state: FormSubmissionState,
  index = 0
) {
  let sectionState = state;
  if (page.section) {
    sectionState = state[page.section.name];
  }

  const toFields = createToFieldsMap(sectionState);
  const components = page.components.formItems;

  return {
    category: page.section?.name,
    question: page.title,
    fields: components.flatMap(toFields),
    index,
  };
}

function fieldAnswerFromComponent(
  component: FormComponent,
  state: FormSubmissionState
) {
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
