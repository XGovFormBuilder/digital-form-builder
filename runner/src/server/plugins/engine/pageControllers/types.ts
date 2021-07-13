/**
 * Use this type for pages which do not need to conform to `PageController` this generally applies to special pages or pages that occur just once and do not need to be in the `FormDefinition["pages"]` array.
 */
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { PageControllerBase } from "server/plugins/engine/pageControllers/PageControllerBase";

/**
 * The SpecialPage type can be used for pages that do not occur in {@link FormDefinition#pages}
 * and/or do not need to conform to `PageControllerBase`. This generally applies to special pages or pages that occur just once.
 * This type has optional properties which match {@link PageController} to simplify/unify the developer experience
 */
export type SpecialPage = {
  getRouteHandler(request: HapiRequest, h: HapiResponseToolkit);
} & {
  postRouteHandler?(request: HapiRequest, h: HapiResponseToolkit);
} & Partial<Pick<PageControllerBase, "model" | "pageDef" | "components">>;
