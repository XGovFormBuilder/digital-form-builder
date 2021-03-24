import { MigrationScript } from "./types";

function needsUpgrade(data) {
  return !!(data.pages ?? [])
    .flatMap((page) => page.components)
    .find((component) => component.options?.list);
}

export function migrate(data): MigrationScript {
  if (!needsUpgrade(data)) {
    return { ...data, version: 2 };
  }
  const { pages } = data;
  const newPages = pages.flatMap((page) => {
    return page.components.map((component) => {
      if (!component.options?.list) {
        return component;
      }
      const { list, ...rest } = component.options;
      return { ...component, list, options: { ...rest } };
    });
  });

  return {
    ...data,
    pages: newPages,
    version: 2,
  };
}
