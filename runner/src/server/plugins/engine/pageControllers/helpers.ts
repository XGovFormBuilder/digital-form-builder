import path from "path";
import { camelCase, upperFirst } from "lodash";
import { DobPageController } from "./DobPageController";
import { HomePageController } from "./HomePageController";
import { PageController } from "./PageController";
import { StartDatePageController } from "./StartDatePageController";
import { StartPageController } from "./StartPageController";
import { SummaryPageController } from "./SummaryPageController";
import { PageControllerBase } from "./PageControllerBase";
import { RepeatingFieldPageController } from "./RepeatingFieldPageController";
import { Page } from "@xgovformbuilder/model";
import { UploadPageController } from "server/plugins/engine/pageControllers/UploadPageController";
import { MultiStartPageController } from "server/plugins/engine/pageControllers/MultiStartPageController";
import { CheckpointSummaryPageController } from "src/server/plugins/engine/pageControllers/CheckpointSummaryPageController";
import { ResubmitPageController } from "./ResubmitPageController";
import { MagicLinkController } from "./MagicLinkController";
import { MagicLinkStartPageController } from "./MagicLinkStartPageController";
import { CustomSummaryPageController } from "./CustomSummaryPageController";

const PageControllers = {
  DobPageController,
  HomePageController,
  PageController,
  StartDatePageController,
  StartPageController,
  SummaryPageController,
  PageControllerBase,
  RepeatingFieldPageController,
  UploadPageController,
  MultiStartPageController,
  CheckpointSummaryPageController,
  ResubmitPageController,
  MagicLinkController,
  MagicLinkStartPageController,
  CustomSummaryPageController,
};

export const controllerNameFromPath = (filePath: string) => {
  const fileName = path.basename(filePath).split(".")[0];
  return `${upperFirst(camelCase(fileName))}PageController`;
};

/**
 * Gets the class for the controller defined in a {@link Page}
 */
export const getPageController = (nameOrPath: Page["controller"]) => {
  const isPath = !!path.extname(nameOrPath);
  const controllerName = isPath
    ? controllerNameFromPath(nameOrPath)
    : nameOrPath;

  return PageControllers[controllerName ?? "PageControllerBase"];
};
