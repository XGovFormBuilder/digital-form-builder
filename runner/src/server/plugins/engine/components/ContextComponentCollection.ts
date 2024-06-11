import { ComponentCollection } from "server/plugins/engine/components/ComponentCollection";
import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { FormComponent } from "server/plugins/engine/components/FormComponent";
import { reach } from "@hapi/hoek";
import _ from "lodash";
import { ContextComponent } from "server/plugins/engine/components/ContextComponent";
import { ComponentBase } from "server/plugins/engine/components/ComponentBase";

export class ContextComponentCollection extends ComponentCollection {
  items: (
    | ComponentBase
    | ComponentCollection
    | FormComponent
    | ContextComponent
  )[];
  constructor(model: FormModel) {
    const exposedComponentDefs = model.def.pages.flatMap((page) => {
      return (
        page.components
          ?.filter((component) => component.options?.exposeToContext)
          .map((component) => ({
            ...component,
            type: "ContextComponent",
            section: page.section,
          })) ?? []
      );
    });

    super(exposedComponentDefs, model);
  }

  getFormDataFromState(state: FormSubmissionState): any {
    const formData = {};

    this.items.forEach((item: ContextComponent) => {
      const path = `${item.section ?? ""}${item.section ? "." : ""}${
        item.name
      }`;
      const value = reach(state, path);
      if (value) {
        _.set(formData, path, value);
      }
    });

    return formData;
  }
}
