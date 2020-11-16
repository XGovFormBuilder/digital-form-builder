import path from "path";
import { camelCase, upperFirst } from "lodash";
import { DobPageController } from "./dobPageController";
import { HomePageController } from "./homePageController";
import { PageController } from "./pageController";
import { StartDatePageController } from "./startDatePageController";
import { StartPageController } from "./startPageController";
import { SummaryPageController } from "./summaryPageController";
import { PageControllerBase } from "./pageControllerBase";

const PageControllers = {
  DobPageController,
  HomePageController,
  PageController,
  StartDatePageController,
  StartPageController,
  SummaryPageController,
  PageControllerBase,
};

export const controllerNameFromPath = (filePath: string) => {
  const fileName = path.basename(filePath).split(".")[0];
  return `${upperFirst(camelCase(fileName))}PageController`;
};

export const getPageController = (nameOrPath: string) => {
  const isPath = !!path.extname(nameOrPath);
  const controllerName = isPath
    ? controllerNameFromPath(nameOrPath)
    : nameOrPath;

  return PageControllers[controllerName];
};
