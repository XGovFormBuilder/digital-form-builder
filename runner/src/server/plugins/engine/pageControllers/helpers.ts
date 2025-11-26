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
import { MiniSummaryPageController } from "./MiniSummaryPageController";
import { Page } from "@xgovformbuilder/model";
import { UploadPageController } from "server/plugins/engine/pageControllers/UploadPageController";
import { MultiStartPageController } from "server/plugins/engine/pageControllers/MultiStartPageController";
import { RepeatingSectionSummaryPageController } from "./RepeatingSectionSummaryPageController";
import { CheckpointSummaryPageController } from "src/server/plugins/engine/pageControllers/CheckpointSummaryPageController";
import { MagicLinkFirstSubmitPageController } from "./MagicLinkFirstSubmitPageController";
import { MagicLinkSecondSubmitPageController } from "./MagicLinkSecondSubmitPageController";
import { MagicLinkController } from "./MagicLinkController";
import { MagicLinkStartPageController } from "./MagicLinkStartPageController";
import { CustomSummaryPageController } from "./CustomSummaryPageController";
import { DateComparisonPageController } from "./DateComparisonPageController";
import { MagicLinkRedirectController } from "./MagicLinkRedirectController";

const PageControllers = {
  DobPageController,
  HomePageController,
  PageController,
  StartDatePageController,
  StartPageController,
  SummaryPageController,
  PageControllerBase,
  RepeatingFieldPageController,
  MiniSummaryPageController,
  UploadPageController,
  MultiStartPageController,
  RepeatingSectionSummaryPageController,
  CheckpointSummaryPageController,
  MagicLinkFirstSubmitPageController,
  MagicLinkSecondSubmitPageController,
  MagicLinkController,
  MagicLinkStartPageController,
  CustomSummaryPageController,
  DateComparisonPageController,
  MagicLinkRedirectController,
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
