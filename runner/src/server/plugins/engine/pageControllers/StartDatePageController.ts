import joi from "joi";
import { PageController } from "./PageController";

export class StartDatePageController extends PageController {
  components: any;

  get stateSchema() {
    const keys = this.components.getStateSchemaKeys();
    const name = this.components.formItems[0].name;
    const d = new Date();
    d.setDate(d.getDate() + 28);
    const max = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;

    // Extend the key to validate that the date is
    // greater than today and less than today+28 days
    keys[name] = keys[name].min("now").max(max);

    return joi.object().keys(keys);
  }
}
