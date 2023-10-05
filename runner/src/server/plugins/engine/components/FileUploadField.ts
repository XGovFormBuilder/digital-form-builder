import { FileUploadFieldComponent } from "@xgovformbuilder/model";
import { FormModel } from "../models";
import { FormData, FormSubmissionErrors } from "../types";
import { FormComponent } from "./FormComponent";
import * as helpers from "./helpers";

import { DataType, ViewModel } from "./types";
import joi, { Schema } from "joi";

export class FileUploadField extends FormComponent {
  dataType = "file" as DataType;
  getFormSchemaKeys() {
    const { options } = this;
    let componentSchema = joi.string().required();
    if (options.required === false) {
      componentSchema = componentSchema.allow("").allow(null).optional();
    }
    componentSchema = componentSchema.label(this.title);
    return {
      [this.name]: componentSchema.when(`${this.name}__filename`, {
        is: joi.string().required(),
        then: joi.optional().allow(""),
      }),
      [`${this.name}__filename`]: joi.string().optional(),
    };
  }

  getStateSchemaKeys() {
    const { options } = this;
    let componentSchema = joi.string().required();
    if (options.required === false) {
      componentSchema = componentSchema.allow("").allow(null).optional();
    }
    componentSchema = componentSchema.label(this.title);
    return {
      [this.name]: componentSchema.when(`${this.name}__filename`, {
        is: joi.string().required(),
        then: joi.optional().allow(""),
      }),
      [`${this.name}__filename`]: joi.string().optional(),
    };
  }

  get attributes() {
    return {
      accept:
        "image/jpeg,image/gif,image/png,application/pdf,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.text,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  getFileNameFromState(state: FormData) {
    let fileName = state[this.name];
    if (typeof fileName !== "undefined") {
      let value = fileName.split("/");
      fileName = value[value.length - 1];
    }
    return fileName;
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { options } = this;
    const fileName = this.getFileNameFromState(formData) ?? "";
    let existingFileText = "You have already provided this file, " + fileName;
    let content =
      "Your file will upload when you select <strong>Save and continue</strong>.\n It may take some time so please wait a few seconds.";

    if (this.model?.def?.metadata?.isWelsh) {
      existingFileText = "Rydych eisoes wedi darparu'r ffeil hwn" + fileName;
      content =
        "Bydd eich ffeil yn uwchlwytho pan fyddwch yn dewis <strong>Cadw a pharhau</strong>.\n Gall gymryd peth amser felly arhoswch ychydig eiliadau";
    }
    const viewModel: ViewModel = {
      ...super.getViewModel(formData, errors),
      attributes: this.attributes,
      filename: this.getFileNameFromState(formData) ?? "",
      existingFileText: existingFileText,
    };

    viewModel.content = content;

    if ("multiple" in options && options.multiple) {
      viewModel.attributes.multiple = "multiple";
    }

    return viewModel;
  }
}
