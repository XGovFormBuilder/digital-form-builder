import { MigrationScript } from "./types";
import { nanoid } from "../utils/helpers";

/**
 * @private
 * StaticItem is a deprecated Type.
 * It should only be used for aiding migration scripts.
 */
type StaticItem = {
  label: string;
  value: string | number | boolean;
  hint?: string;
  condition?: string;
};

/**
 * @private
 * StaticComponentValues is a deprecated Type.
 * It should only be used for aiding migration scripts.
 */
type StaticComponentValues = {
  list: any;
  type: "static" | "listRef";
  valueType: string | number;
  items: StaticItem[];
};

type Item = {
  title: string;
  value: any;
  conditions?: any;
  hint?: string;
};

function recastItem({ label, value, condition, hint }: StaticItem) {
  let item: Item = {
    title: label,
    value,
  };

  condition && (item.conditions = condition);
  hint && (item.hint = hint);
  return item;
}

function addListId(component: { values: StaticComponentValues }) {
  if (!component.values) {
    return component;
  }
  const { values } = component;
  return {
    ...component,
    list: values.type === "listRef" ? values.list : nanoid(),
  };
}

function migratePage(page) {
  return {
    ...page,
    components: page.components.map(addListId),
  };
}

function removeValues(page) {
  return {
    ...page,
    components: page.components.map((component) => {
      const { values, ...rest } = component;
      return {
        ...rest,
      };
    }),
  };
}

function needsUpgrade(data) {
  return !!data.pages
    .flatMap((page) => page.components)
    .find((component) => component.values);
}

export function migrate(data): MigrationScript {
  if (!needsUpgrade(data)) {
    return { ...data, version: 2 };
  }
  const pages = data.pages.map(migratePage);
  const componentsWithList = pages.flatMap((page) =>
    page.components.filter((c) => c.values?.items)
  );

  const valuesAsLists = componentsWithList.map((component) => {
    return {
      title: component.title,
      name: component.list,
      items: component.values.items.map((item) => recastItem(item)),
    };
  });

  return {
    ...data,
    pages: pages.map(removeValues),
    lists: [...(data.lists ?? []), ...valuesAsLists],
    version: 2,
  };
}
