import { ComponentBase } from "./ComponentBase";
import { ViewModel } from "./types";

export class InsetText extends ComponentBase {
  getViewModel(): ViewModel {
    return {
      ...super.getViewModel(),
      content: this.content,
    };
  }
}
