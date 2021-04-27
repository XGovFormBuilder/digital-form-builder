import { ConditionsWrapper } from "@xgovformbuilder/model/dist/browser/data-model";
import { Page } from "@xgovformbuilder/model";

type Path = Page["path"];
type ConditionName = ConditionsWrapper["name"];

function UseAddLink(from: Path, to: Path, condition?: ConditionName);
function UseUpdateLink(from: Path, to: Path, condition?: ConditionName);
