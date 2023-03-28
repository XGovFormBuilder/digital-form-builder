import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { FreeTextField } from "@xgovformbuilder/runner/src/server/plugins/engine/components/FreeTextField";
import { componentSchema } from "@xgovformbuilder/model";
import { messages } from "@xgovformbuilder/runner/src/server/plugins/engine/pageControllers/validationOptions";

const lab = Lab.script();
exports.lab = lab;

const { expect } = Code;
const { suite, describe, it } = lab;

suite("FreeTextField", () => {
  describe("Generated schema", () => {
    let def, model;

    def = {
      type: "TextField",
      name: "example-field",
      title: "Example Field",
      schema: {},
      options: {},
    };

    const formModel = {
      makePage: () => sinon.stub(),
    };

    const component = new FreeTextField(def, formModel);

    it("is required by default", () => {
      expect(component.formSchema.describe().flags.presence).to.equal(
        "required"
      );
    });
  });
});
