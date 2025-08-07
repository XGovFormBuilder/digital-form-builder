// Find fields in each section, create a row with a value that combines the values of those fields, then remove the original fields

export function mergeRows(
  details: any,
  fields: Array<{ names: Array<string>; to: string; joiner: string }>
) {
  return details.map(
    (detail: { name: string; title: string; items: Array<any> }) => {
      const allFieldNames = fields.map((field) => field.names).flat();
      const transformedItems = detail.items
        .map((item) => {
          const field = fields.find((field) => field.names[0] === item.name);
          if (field) {
            const { names, to, joiner } = field;
            const findItem = (name: string) =>
              detail.items.find((item) => item.name === name);
            const values = names
              .map((name) => (findItem(name) ? findItem(name).value : null))
              .filter((value) => value);

            return {
              ...item,
              name: to.toLowerCase().replace(" ", "_"),
              ...{ label: to, title: to, rawValue: to },
              value: values.length === 0 ? null : values.join(joiner),
            };
          }
          return item;
        })
        .filter((item) => !allFieldNames.includes(item.name));

      return { ...detail, items: transformedItems };
    }
  );
}
