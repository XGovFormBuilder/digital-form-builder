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

    const { items } = this;

    if (options.conditionallyRevealedComponents) {
      this.conditionallyRevealedComponents =
        options.conditionallyRevealedComponents;

      for (const item of items) {
        const conditionallyRevealedComponent = this
          .conditionallyRevealedComponents![item.value];
        if (conditionallyRevealedComponent) {
          item.hasConditionallyRevealedComponents = true;
          item.conditionallyRevealedComponents = new ComponentCollection(
            [conditionallyRevealedComponent],
            item.model
          );
        }
      }
    }
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name, items } = this;
    const options: any = this.options;
    const viewModel = super.getViewModel(formData, errors);

    viewModel.fieldset = {
      legend: viewModel.label,
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

      Object.keys(conditionalSchemaKeys).forEach((key) => {
        Object.assign(schemaKeys, {
          [key]: joi.alternatives().conditional(joi.ref(conditionalName), {
            is: key,
            then: joi.string(), //TODO should work for other validations
            otherwise: joi.optional(),
          }),
        });
      });
    });

    //TODO should work for checkbox components

    return schemaKeys;
  }
}
