import joi from "joi";
import nunjucks from "nunjucks";

import { FormComponent } from "./FormComponent";
import { ComponentCollection } from "./ComponentCollection";
import { FormSubmissionState } from "../types";
import { FormModel } from "../formModel";

const getSchemaKeys = Symbol("getSchemaKeys");

export class ConditionalFormComponent extends FormComponent {
  itemValues: any;

  constructor(def, model: FormModel) {
    super(def, model);

    this.itemValues = this.values?.items.map((item) => item.value);
    this.createConditionalComponents(def, model);
  }

  getFormDataFromState(state: FormSubmissionState) {
    const formData = super.getFormDataFromState(state);
    if (formData) {
      const itemsWithConditionalComponents = this.values?.items.filter(
        (item) => item.childrenCollection
      );
      itemsWithConditionalComponents.forEach((item) => {
        const itemFormDataFromState = item.childrenCollection.getFormDataFromState(
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

  getFormSchemaKeys() {
    return this[getSchemaKeys]("form");
  }

  getStateFromValidForm(payload) {
    const state = super.getStateFromValidForm(payload);
    const itemsWithConditionalComponents = this.values.items.filter(
      (item) => item.childrenCollection
    );

    const selectedItemsWithConditionalComponents = itemsWithConditionalComponents.filter(
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
    selectedItemsWithConditionalComponents.forEach((item) =>
      Object.assign(
        state,
        item.childrenCollection.getStateFromValidForm(payload)
      )
    );

    // Add null values to the state for unselected form data associated with conditionally revealed content.
    // This will allow changes in the visibility of onditionally revealed content to be reflected in state correctly.
    const unselectedItemsWithConditionalComponents = itemsWithConditionalComponents.filter(
      (item) => !selectedItemsWithConditionalComponents.includes(item)
    );
    unselectedItemsWithConditionalComponents.forEach((item) => {
      const stateFromValidForm = item.childrenCollection.getStateFromValidForm(
        payload
      );
      Object.values(item.childrenCollection.items)
        .filter(
          // TODO: type
          (conditionalItem: any) => stateFromValidForm[conditionalItem.name]
        )
        // TODO: type
        .forEach((key: any) => {
          const conditionalItemToNull = key.name;
          Object.assign(stateFromValidForm, { [conditionalItemToNull]: null });
        });
      Object.assign(state, stateFromValidForm);
    });
    return state;
  }

  getStateSchemaKeys() {
    return this[getSchemaKeys]("state");
  }

  createConditionalComponents(_def, model) {
    const { values } = this;
    const items = values?.items;

    const filteredItems = items?.filter(
      (item) => item.children && item.children.length > 0
    );
    // Create a collection of conditional components that can be converted to a view model and rendered by Nunjucks
    // before primary view model rendering takes place.
    filteredItems?.map((item) => {
      item.childrenCollection = new ComponentCollection(item.children, model);
    });
  }

  addConditionalComponents(item, itemModel, formData, errors) {
    // The gov.uk design system Nunjucks examples for conditional reveal reference variables from macros. There does not appear to
    // to be a way to do this in JavaScript. As such, render the conditional components with Nunjucks before the main view is rendered.
    // The conditional html tag used by the gov.uk design system macro will reference HTML rarther than one or more additional
    // gov.uk design system macros.
    if (item.childrenCollection) {
      itemModel.conditional = {
        html: nunjucks.render("conditional-components.html", {
          components: item.childrenCollection.getViewModel(formData, errors),
        }),
      };
    }
    return itemModel;
  }

  [getSchemaKeys](schemaType) {
    const schemaName = `${schemaType}Schema`;
    const schemaKeysFunctionName = `get${schemaType
      .substring(0, 1)
      .toUpperCase()}${schemaType.substring(1)}SchemaKeys`;
    const filteredItems = this.values.items.filter(
      (item) => item.childrenCollection
    );
    const conditionalName = this.name;
    const schemaKeys = { [conditionalName]: this[schemaName] };
    const schema = this[schemaName];
    // All conditional component values are submitted regardless of their visibilty.
    // As such create Joi validation rules such that:
    // a) When a conditional component is visible it is required.
    // b) When a conditional component is not visible it is optional.
    filteredItems.forEach((item) => {
      const conditionalSchemaKeys = item.childrenCollection[
        schemaKeysFunctionName
      ]();
      // Iterate through the set of components handled by conditional reveal adding Joi validation rules
      // based on whether or not the component controlling the conditional reveal is selected.
      Object.keys(conditionalSchemaKeys).forEach((key) => {
        Object.assign(schemaKeys, {
          [key]: joi.alternatives().when(conditionalName, {
            is: item.value,
            then: conditionalSchemaKeys[key].required(),
            // If multiple checkboxes are selected their values will be held in an array. In this
            // case conditionally revealed content is required to be entered if the controlliing
            // checkbox value is a member of the array of selected checkbox values.
            otherwise: joi.alternatives().when(conditionalName, {
              is: joi
                .array()
                .items(schema.only(item.value), joi.any())
                .required(),
              then: conditionalSchemaKeys[key].required(),
              otherwise: conditionalSchemaKeys[key]
                .optional()
                .allow("")
                .allow(null),
            }),
          }),
        });
      });
    });
    return schemaKeys;
  }
}
