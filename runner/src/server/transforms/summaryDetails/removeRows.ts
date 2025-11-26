// Remove rows from summary details based on field name

export function removeRows(
  details: any,
  names: Array<string>
) {
  return details.map(
    (detail: { name: string; title: string; items: Array<any> }) => {
      const filteredItems = detail.items
        .filter((item) =>  !names.includes(item.name));

      return { ...detail, items: filteredItems };
    }
  );
}