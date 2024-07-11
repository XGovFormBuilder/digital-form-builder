import { FormModel } from "server/plugins/engine/models/FormModel";
import { callbackValidation } from "server/plugins/initialiseSession/helpers";
export class ExitOptions {
  url: string;
  format?: "STATE" | "WEBHOOK";

  constructor(exitOptions: FormModel["exitOptions"]) {
    const { value, error } = callbackValidation().validate(exitOptions.url);
    if (error) {
      throw new Error(
        `FormModel.exitOptions initialisation failed, ${exitOptions.url} is not on the safelist`
      );
    }
    this.url = value;
    this.format = exitOptions.format;
  }
}
