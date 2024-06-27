import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { UploadPageController } from "../../../../../../src/server/plugins/engine/pageControllers/UploadPageController";
import { FormModel } from "../../../../../../src/server/plugins/engine/models";
import * as sinon from "sinon";
import * as PlaybackUploadPageController from "../../../../../../src/server/plugins/engine/pageControllers/PlaybackUploadPageController";
import { Page } from "@xgovformbuilder/model";
import { FormComponent } from "../../../../../../src/server/plugins/engine/components";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

const def = {
  title: "Your birth certificate",
  path: "/your-birth-certificate",
  name: "",
  components: [
    {
      name: "imageUpload",
      options: {
        required: true,
      },
      type: "FileUploadField",
      title: "Birth certificate",
      schema: {},
    },
  ],
  next: [
    {
      path: "/second-page",
    },
  ],
  controller: "UploadPageController",
};

const model = new FormModel(
  {
    pages: [],
    startPage: "/start",
    sections: [],
    lists: [],
    conditions: [],
  },
  {}
);

suite("UploadPageController", () => {
  lab.before(() => {
    class mockPlaybackPageController {
      constructor(
        _model: FormModel,
        _pageDef: Page,
        _inputComponent: FormComponent
      ) {}
      makePostRouteHandler() {
        return sinon.stub().returns(true);
      }
      makeGetRouteHandler() {
        return sinon.stub().returns(true);
      }
    }
    sinon
      .stub(PlaybackUploadPageController, "PlaybackUploadPageController")
      .callsFake((model, pageDef, inputComponent) => {
        return new mockPlaybackPageController(model, pageDef, inputComponent);
      });
  });

  test("Redirects post handler to the playback page post handler when view=playback", async () => {
    const pageController = new UploadPageController(model, def);
    const request = {
      query: {
        view: "playback",
      },
    };
    const result = await pageController.makePostRouteHandler()(request, {});
    expect(result).to.be.true();
  });
  test("Redirects get handler to the playback page get handler when view=playback", async () => {
    const pageController = new UploadPageController(model, def);
    const request = {
      query: {
        view: "playback",
      },
    };
    const result = await pageController.makeGetRouteHandler()(request, {});
    expect(result).to.be.true();
  });
});
