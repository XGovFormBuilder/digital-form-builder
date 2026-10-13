import joi from "joi";
import { ConditionalRadiosFieldComponent } from "@xgovformbuilder/model";

import { ListFormComponent } from "./ListFormComponent";
import { ListItem } from "./types";
import {
  FormData,
  FormPayload,
  FormSubmissionErrors,
  FormSubmissionState,
} from "../types";
import { FormModel } from "../models";

const customValue = "__custom";

export class ConditionalRadiosField extends ListFormComponent {
  constructor(def: ConditionalRadiosFieldComponent, model: FormModel) {
    const list = model.getList(def.list);
    const listItems = Array.isArray(list) ? [] : list.items;

    const normalizedList = {
      items: listItems.map((item) => {
        const value: string | number | boolean =
          item.type === "TextField"
            ? customValue
            : item.divider !== undefined
            ? "__divider"
            : item.value ?? "";

        return {
          ...item,
          value,
        };
      }),
    };

    super(def, {
      ...model,
      getList: () => normalizedList,
    } as unknown as FormModel);

    const radioItems = this.items.filter(
      (item) => item.type !== "TextField" && item.divider === undefined
    );

    const allowedValues = radioItems
      .map((item) => item.value)
      .filter((value) => value !== undefined);

    this.formSchema = joi
      .any()
      .custom((value, helpers) => {
        const values = Array.isArray(value) ? value : [value];

        const customText = values.find(
          (item) =>
            typeof item === "string" && item !== customValue && item.trim()
        );

        const hasCustomValue = values.includes(customValue);

        const hasRadioValue = values.some((item) =>
          allowedValues.includes(item)
        );

        const hasUnmarkedCustomText = values.some(
          (item) =>
            typeof item === "string" &&
            item !== customValue &&
            item.trim() &&
            !allowedValues.includes(item)
        );

        if (hasUnmarkedCustomText) {
          return value;
        }

        if (hasCustomValue) {
          return customText ? value : helpers.error("any.required");
        }

        if (hasRadioValue) {
          return value;
        }

        return helpers.error("any.required");
      })
      .required()
      .messages(def.options.customValidationMessages || {});

    this.stateSchema = this.formSchema;
    this.customValue = customValue;
  }

  private customValue: string;

  private isFixedValue(value: string | number | boolean | undefined): boolean {
    return this.items.some(
      (item) =>
        item.type !== "TextField" &&
        item.divider === undefined &&
        (item.value === value || item.label === value || item.text === value)
    );
  }

  getStateFromValidForm(payload: FormPayload) {
    const submittedValue = payload[this.name];

    const values = Array.isArray(submittedValue)
      ? submittedValue
      : [submittedValue];

    const selectedValue = values.find((value) => this.isFixedValue(value));

    const selectedItem = this.items.find(
      (item) =>
        item.value === selectedValue ||
        item.label === selectedValue ||
        item.text === selectedValue
    );
    const selectedLabel = selectedItem?.label ?? selectedItem?.text;

    const customText = values.find(
      (value) =>
        value !== this.customValue &&
        !this.values.includes(value) &&
        !this.isFixedValue(value)
    );

    if (values.includes(this.customValue)) {
      return { [this.name]: customText || null };
    }

    return {
      [this.name]: selectedLabel || selectedValue || customText || null,
    };
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);
    const submittedValue = formData[this.name];

    const values = Array.isArray(submittedValue)
      ? submittedValue
      : [submittedValue];

    const customText = values.find(
      (value) =>
        value !== this.customValue &&
        !this.values.includes(value) &&
        !this.isFixedValue(value)
    );

    viewModel.name = this.name;
    viewModel.id = this.name;

    const renderedItems: ListItem[] = [];

    this.items.forEach((item, index) => {
      if (item.divider !== undefined) {
        renderedItems.push({
          divider: item.divider,
          value: "",
        } as ListItem);

        return;
      }

      const isCustom = item.type === "TextField";

      const value: string | number | boolean = isCustom
        ? this.customValue
        : item.value ?? "";

      const label = item.label ?? item.text ?? "";

      const isSelected =
        values.includes(item.value ?? "") || values.includes(label);

      renderedItems.push({
        text: label,
        value,
        checked: isCustom ? Boolean(customText) : isSelected,
        ...(isCustom && {
          conditional: {
            html: `<input class="govuk-input govuk-!-width-one-third" id="${
              this.name
            }-custom" name="${this.name}" type="text" value="${
              customText ?? ""
            }">`,
          },
        }),
        ...(index === 0 && { id: this.name }),
      } as ListItem);
    });

    viewModel.items = renderedItems;

    return viewModel;
  }

  getDisplayStringFromState(state: FormSubmissionState): string | string[] {
    const value = state[this.name];

    return typeof value === "string" ? value : String(value ?? "");
  }
}
