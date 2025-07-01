export function sectionsOnlyAndCardConversion(details) {
  return details
    .filter((detail) => detail.name)
    .map((detail) => {
      const { url } = detail.items[0];
      if (detail.name.match(/\w\d/)) return { ...detail, card: url };
      return detail;
    });
}
