import { format } from "date-fns";
import config from "server/config";
import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { FeesModel } from "server/plugins/engine/models/submission/FeesModel";
import { FormComponent } from "server/plugins/engine/components";
import { Field } from "server/schemas/types";
import { PageControllerBase } from "server/plugins/engine/pageControllers";
import { SelectionControlField } from "server/plugins/engine/components/SelectionControlField";
import nunjucks from "nunjucks";

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
  return function (component: FormComponent | SelectionControlField): Field[] {
    if (component instanceof SelectionControlField) {
      const selectedValue = state[component.name];
      const baseField = {
        key: component.name,
        title: component.title,
        type: "list",
        answer: fieldAnswerFromComponent(component, state),
      };

      // Check if there are conditional components for the selected value
      const selectedItem = component.items.find(
        (item) =>
          item.value === selectedValue &&
          item.hasConditionallyRevealedComponents
      );

      if (selectedItem?.conditionallyRevealedComponents) {
        const toField = createToFieldsMap(state);
        const nestedFields = selectedItem.conditionallyRevealedComponents.formItems.flatMap(
          toField
        );

        return [baseField, ...nestedFields];
      }

      return [baseField];
    }

    return [
      {
        key: component.name,
        title: component.title,
        type: component.dataType,
        answer: fieldAnswerFromComponent(component, state),
      },
    ];
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

  const pageTitle = nunjucks.renderString(page.title.en ?? page.title, {
    ...state,
  });

  return {
    category: page.section?.name,
    question: pageTitle,
    fields: components.flatMap(toFields),
    index,
  };
}

function fieldAnswerFromComponent(
  component: FormComponent | SelectionControlField,
  state: FormSubmissionState = {}
) {
  if (!component) {
    return;
  }
  const rawValue = state?.[component.name];

  // Handle SelectionControlField
  if (component instanceof SelectionControlField) {
    // If it's a selection control, we want to return both the selected value
    // and any conditional component values
    const selectedValue = rawValue;

    // Find the selected item to get its display text
    const selectedItem = component.items.find(
      (item) => item.value === selectedValue
    );

    return selectedItem ? selectedItem.text : selectedValue;
  }

  switch (component.dataType) {
    case "list":
      return rawValue;
    case "date":
      return rawValue ? format(new Date(rawValue), "yyyy-MM-dd") : undefined;
    case "monthYear":
      if (!rawValue) return undefined;
      const [month, year] = Object.values(rawValue);
      return format(new Date(`${year}-${month}-1`), "yyyy-MM");
    default:
      if (typeof component.getDisplayStringFromState === "function") {
        return component.getDisplayStringFromState(state);
      }
      return rawValue;
  }
}
