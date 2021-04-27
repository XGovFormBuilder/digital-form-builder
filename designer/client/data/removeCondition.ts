export function removeCondition(data, name) {
  const pages = [...data.pages].map((page) => {
    return {
      ...page,
      next: page.next.filter((next) => next.condition !== name),
    };
  });
  return {
    ...data,
    pages,
    conditions: data.conditions.filter((condition) => condition.name !== name),
  };
}
