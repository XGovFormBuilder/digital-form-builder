import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors } from "../types";
import { ClientSideFileUploadFieldComponent } from "@xgovformbuilder/model";
import { FormModel } from "server/plugins/engine/models";
import { ClientSideFileUploadFieldViewModel } from "server/plugins/engine/components/types";
import joi from "joi";
export class ClientSideFileUploadField extends FormComponent {
  options: ClientSideFileUploadFieldComponent["options"];
  schema: ClientSideFileUploadFieldComponent["schema"];

  constructor(def: ClientSideFileUploadFieldComponent, model: FormModel) {
    super(def, model);
    this.options = def.options;
    this.schema = def.schema;
  }

  getFormSchemaKeys() {
    return {
      [this.name]: joi.allow("").allow(null),
      [`${this.name}__filename`]: joi.string().optional(),
      [`${this.name}__delete[]`]: joi.string().optional(),
    };
  }

  getAdditionalValidationFunctions(): Function[] {
    return [
      async (request, viewModel) => {
        const { uploadService, cacheService } = request.services([]);
        const state = await cacheService.getState(request);
        const form_session_identifier =
          state.metadata?.form_session_identifier ?? "";
        const clientSideUploadComponent = viewModel.components.find(
          (c) => c.type === "ClientSideFileUploadField"
        );

        let { id, path } = request.params as any;

        let currentPage;
        if (path === "summary") {
          currentPage = clientSideUploadComponent.model.pages.find((page) =>
            page.components.items.includes(clientSideUploadComponent)
          );
          path = currentPage.path.replace("/", "");
        }

        let componentKey = clientSideUploadComponent.model.id;
        if (!componentKey) {
          componentKey = clientSideUploadComponent.name;
        }

        const key = `${form_session_identifier}/${id}/${path}/${componentKey}`;

        // we wait an arbitrary amount of 1 second here, because of race conditions.
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const files = await uploadService.listFilesInBucketFolder(
          key,
          form_session_identifier
        );

        const maxFiles = this.options.dropzoneConfig.maxFiles;
        if (files.length > maxFiles) {
          return [
            {
              path: currentPage
                ? `${currentPage?.section?.name}.${componentKey}`
                : componentKey,
              name: componentKey,
              href: `#${componentKey}`,
              text:
                maxFiles > 1
                  ? `You can only upload ${maxFiles} files`
                  : `You can only upload a single file`,
            },
          ];
        }

        const hasRequiredFiles =
          files.length >= this.options.minimumRequiredFiles;
        if (hasRequiredFiles) {
          return [];
        }

        const error = {
          path: currentPage
            ? `${currentPage?.section?.name}.${componentKey}`
            : componentKey,
          name: componentKey,
          href: `#${componentKey}`,
        };

        if (this.options.minimumRequiredFiles === 1) {
          const labelText = clientSideUploadComponent.model?.label?.text || "";
          const fullErrorText = `${labelText} is required`;
          return [
            {
              ...error,
              ...{
                text: fullErrorText,
              },
            },
          ];
        }

        const labelText = clientSideUploadComponent.model?.label?.text || "";
        const fullErrorText = `${labelText} requires ${this.options.minimumRequiredFiles} files`;
        return [
          {
            ...error,
            ...{
              text: fullErrorText,
            },
          },
        ];
      },
    ];
  }

  getViewModel(
    formData: FormData,
    errors: FormSubmissionErrors
  ): ClientSideFileUploadFieldViewModel {
    const isRequired = this.options.minimumRequiredFiles > 0;
    const displayOptionaltext = this.options.optionalText;
    this.options.required = isRequired;
    this.options.optionalText = !isRequired && displayOptionaltext;
    const viewModel = {
      ...super.getViewModel(formData, errors),
      dropzoneConfig: this.options.dropzoneConfig,
      existingFiles: [], // this is populated afterwards.
      showNoScriptWarning: this.options.showNoScriptWarning || false,
      totalOverallFilesize: this.options.totalOverallFilesize,
      minimumRequiredFiles: this.options.minimumRequiredFiles,
      hideTitle: this.options.hideTitle || false,
    } as ClientSideFileUploadFieldViewModel;
    viewModel.label = {
      text: this.title,
      classes: "govuk-label--s",
    };
    return viewModel;
  }
}
