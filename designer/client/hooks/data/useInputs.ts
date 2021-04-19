import { useContext } from "react";
import { DataContext } from "../../context";
import { Input, isNotContentType } from "./types";
import { UseGetAllPathsLeadingTo } from "./usePaths";

function allInputs(pages): Input[] {
  return pages.flatMap((page) => {
    const inputs = (page.components ?? []).filter(isNotContentType);
    return inputs.map((input) => {
      return {
        name: input.name,
        page: { path: page.path, section: page.section },
        propertyPath: !!page.section
          ? `${page.section}.${input.name}`
          : input.name,
        title: input.title,
        list: input.list,
        type: input.type,
      };
    });
  });
}

function UseGetAllInputs(): Input[] {
  const { data } = useContext(DataContext);
  return allInputs(data.pages);
}

function UseGetInputsAccessibleAt(path) {
  const pages = UseGetAllPathsLeadingTo(path);
  return allInputs(pages);
}
