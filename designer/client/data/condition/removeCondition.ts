import { FormDefinition } from "@xgovformbuilder/model";

export function removeCondition(data: FormDefinition, name) {
  const pages = [...data.pages].map((page) => {
    return {
      ...page,
      next:
        page.next?.map((next) =>
          next.condition === name ? { ...next, condition: undefined } : next
        ) ?? [],
    };
  });
  return {
    ...data,
    pages,
    conditions: data.conditions.filter((condition) => condition.name !== name),
  };
}
