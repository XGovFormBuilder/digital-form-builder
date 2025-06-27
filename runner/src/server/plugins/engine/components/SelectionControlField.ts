import joi from "joi";
import nunjucks from "nunjucks";

import { ListFormComponent } from "server/plugins/engine/components/ListFormComponent";
import { FormData, FormSubmissionErrors } from "server/plugins/engine/types";
import { ListItem } from "server/plugins/engine/components/types";

import { ComponentCollection } from "./ComponentCollection";

const getSchemaKeys = Symbol("getSchemaKeys");

/**
 * "Selection controls" are checkboxes and radios (and switches), as per Material UI nomenclature.
 */
export class SelectionControlField extends ListFormComponent {
  conditionallyRevealedComponents?: any;
  hasConditionallyRevealedComponents: boolean = false;

  constructor(def, model) {
    super(def, model);
    const { options } = def;
    this.options = options;

    const { items } = this;

    if (options.conditionallyRevealedComponents) {
      this.conditionallyRevealedComponents =
        options.conditionallyRevealedComponents;

      for (const item of items) {
        let conditionallyRevealedComponent = this
          .conditionallyRevealedComponents[item.value];

        if (conditionallyRevealedComponent != undefined) {
          // Pass custom validation messages to the conditionally revealed component
          if (options.customValidationMessages) {
            conditionallyRevealedComponent.options =
              conditionallyRevealedComponent.options || {};
            conditionallyRevealedComponent.options.customValidationMessages =
              conditionallyRevealedComponent.options.customValidationMessages ||
              {};

            // Merge parent validation messages with child validation messages
            Object.assign(
              conditionallyRevealedComponent.options.customValidationMessages,
              options.customValidationMessages
            );
          }

          item.hasConditionallyRevealedComponents = true;
          item.conditionallyRevealedComponents = new ComponentCollection(
            [conditionallyRevealedComponent],
            item.model
          );
        }
      }
    }
  }

  getStateFromValidForm(payload: FormPayload) {
    const state = super.getStateFromValidForm(payload);
    const itemsWithConditionalComponents = this.items.filter(
      (item: any) => item.conditionallyRevealedComponents
    );
    const selectedItemsWithConditionalComponents = itemsWithConditionalComponents?.filter(
      (item) => {
        if (payload[this.name] && Array.isArray(payload[this.name])) {
          return payload[this.name].find(
            (nestedItem) => item.value === nestedItem
          );
        } else {
          return item.value === payload[this.name];
        }
      }
    );
    // Add selected form data associated with conditionally revealed content to the state.
    selectedItemsWithConditionalComponents?.forEach((item: any) =>
      Object.assign(
        state,
        item.conditionallyRevealedComponents.getStateFromValidForm(payload)
      )
    );
    // Add null values to the state for unselected form data associated with conditionally revealed content.
    // This will allow changes in the visibility of conditionally revealed content to be reflected in state correctly.
    const unselectedItemsWithConditionalComponents = itemsWithConditionalComponents?.filter(
      (item) => !selectedItemsWithConditionalComponents?.includes(item)
    );
    unselectedItemsWithConditionalComponents?.forEach((item: any) => {
      const stateFromValidForm = item.conditionallyRevealedComponents.getStateFromValidForm(
        payload
      );
      Object.values(item.conditionallyRevealedComponents.items)
        .filter(
          (conditionalItem: any) => stateFromValidForm[conditionalItem.name]
        )
        .forEach((key: any) => {
          const conditionalItemToNull = key.name;
          Object.assign(stateFromValidForm, { [conditionalItemToNull]: null });
        });
      Object.assign(state, stateFromValidForm);
    });
    return state;
  }

  getFormDataFromState(state: FormSubmissionState) {
    const formData = super.getFormDataFromState(state);
    if (formData) {
      const itemsWithConditionalComponents = this.items.filter(
        (item: any) => item.conditionallyRevealedComponents
      );
      itemsWithConditionalComponents?.forEach((item: any) => {
        const itemFormDataFromState = item.conditionallyRevealedComponents.getFormDataFromState(
          state
        );
        if (
          itemFormDataFromState &&
          Object.keys(itemFormDataFromState).length > 0
        ) {
          Object.assign(formData, itemFormDataFromState);
        }
      });
    }

    return formData;
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name, items } = this;
    const options: any = this.options;
    const viewModel = super.getViewModel(formData, errors);

    const { label } = viewModel;

    viewModel.fieldset = {
      legend: {
        ...label,
        classes: "govuk-fieldset__legend govuk-fieldset__legend--s",
      },
    };

    viewModel.items = items.map((item: any) => {
      const itemModel: ListItem = {
        text: item.text,
        value: item.value,
        checked: `${item.value}` === `${formData[name]}`,
      };

      if (options.bold) {
        itemModel.label = {
          classes: "govuk-label--s",
        };
      }

      if (item.description) {
        itemModel.hint = {
          html: this.localisedString(item.description),
        };
      }

      if (options.conditionallyRevealedComponents?.[item.value]) {
        // The gov.uk design system Nunjucks examples for conditional reveal reference variables from macros. There does not appear to
        // to be a way to do this in JavaScript. As such, render the conditional components with Nunjucks before the main view is rendered.
        // The conditional html tag used by the gov.uk design system macro will reference HTML rarther than one or more additional
        // gov.uk design system macros.

        let viewModel = item.conditionallyRevealedComponents.getViewModel(
          formData,
          errors
        );

        viewModel.forEach((component) => {
          if (component.model.label) {
            component.model.label.classes = "govuk-label";
          }
        });

        itemModel.conditional = {
          html: nunjucks.render(
            "../views/partials/conditional-components.html",
            {
              components: viewModel,
            }
          ),
        };
      }

      return itemModel;
    });
    return viewModel;
  }

  getStateSchemaKeys() {
    return this[getSchemaKeys]("state");
  }

  getFormSchemaKeys() {
    return this[getSchemaKeys]("form");
  }

  [getSchemaKeys](schemaType) {
    const schemaName = `${schemaType}Schema`;
    const schemaKeysFunctionName = `get${schemaType
      .substring(0, 1)
      .toUpperCase()}${schemaType.substring(1)}SchemaKeys`;
    const filteredItems = this.items.filter(
      (item: any) => item.hasConditionallyRevealedComponents
    );
    const conditionalName = this.name;
    const schemaKeys = { [conditionalName]: this[schemaName] };
    // const schema = this[schemaName];
    // All conditional component values are submitted regardless of their visibilty.
    // As such create Joi validation rules such that:
    // a) When a conditional component is visible it is required.
    // b) When a conditional component is not visible it is optional.
    filteredItems?.forEach((item: any) => {
      const conditionalSchemaKeys = item.conditionallyRevealedComponents[
        schemaKeysFunctionName
      ]();

      const conditionalMessages =
        item.conditionallyRevealedComponents.items[0].options
          .customValidationMessages || {};

      Object.keys(conditionalSchemaKeys).forEach((key) => {
        let schema = joi.alternatives().conditional(joi.ref(conditionalName), {
          is: item.value,
          then: conditionalSchemaKeys[key].messages(conditionalMessages),
          otherwise: joi.optional(),
        });
        schemaKeys[key] = schema;
      });
    });

    return schemaKeys;
  }
}
