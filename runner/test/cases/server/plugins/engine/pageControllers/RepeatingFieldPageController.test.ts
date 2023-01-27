import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { RepeatingFieldPageController } from "server/plugins/engine/pageControllers";
import { FormModel } from "src/server/plugins/engine/models/FormModel";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

suite("PageControllerBase", () => {
  test("getErrors correctly parses ISO string to readable string", () => {
    const def = {
      title: "This is a test",
      path: "/first-page",
      name: "",
      components: [],
      next: [
        {
          path: "/second-page",
        },
      ],
    };

    const controller = new RepeatingFieldPageController(
      new FormModel(
        {
          pages: [],
          startPage: "/start",
          sections: [],
          lists: [],
          conditions: [],
        },
        {}
      ),
      def
    );

    const expected = [
      { "type-of-revenue-cost": "ABC : def", value: "£20002" },
      { "type-of-revenue-cost": "https://www.google.com", value: "£10552" },
      { "type-of-revenue-cost": "Town Funding", value: "£52" },
      { "type-of-revenue-cost": "This is a, test", value: "£8481" },
    ];

    const result = controller.convertMultiInputStringAnswers([
      "ABC : def : £20002",
      "https://www.google.com : £10552",
      "Town Funding : £52",
      "This is a, test : £8481",
    ]);

    expect(result).to.equal(expected);
  });
});
