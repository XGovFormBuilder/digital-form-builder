// Change the item values of rows based on field name and item line

export function adjustRows(
  details: any,
  adjustments: Record<string, Record<string, string>>
) {
  return details.map(
    (detail: { name: string; title: string; items: Array<any> }) => ({
      ...detail,
      items: detail.items.map((item: any) => {
        const itemChanges = adjustments[item.name];
        return itemChanges ? {...item, ...itemChanges } : item;
      })
    })
  );
}