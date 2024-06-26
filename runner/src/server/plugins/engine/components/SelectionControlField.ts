import { ListFormComponent } from "server/plugins/engine/components/ListFormComponent";
import { FormData, FormSubmissionErrors } from "server/plugins/engine/types";
import { ListItem, ViewModel } from "server/plugins/engine/components/types";
import joi from "joi";

/**
 * "Selection controls" are checkboxes and radios (and switches), as per Material UI nomenclature.
 */
export class SelectionControlField extends ListFormComponent {
  formSchema;

  constructor(def: any, model: any) {
    super(def, model);
    const { options, schema = {} } = def;
    this.options = options;
    this.schema = schema;

    let componentSchema = joi.string().required();

    if (options.required === false) {
      componentSchema = componentSchema.optional().allow("").allow(null);
    }

    componentSchema = componentSchema.label(
      def.title.en ?? def.title ?? def.name
    );

    if (options.customValidationMessage) {
      componentSchema = componentSchema.messages({
        "any.required": options.customValidationMessage,
      });
    }

    this.formSchema = componentSchema;
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name, items } = this;
    const options: any = this.options;
    const viewModel: ViewModel = super.getViewModel(formData, errors);
    viewModel.label!.classes = "govuk-fieldset__legend--s";

    viewModel.fieldset = {
      legend: viewModel.label,
    };

    viewModel.items = items.map((item) => {
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

      return itemModel;

      // FIXME:- add this back when GDS fix accessibility issues involving conditional reveal fields
      //return super.addConditionalComponents(item, itemModel, formData, errors);
    });
    return viewModel;
  }
}
