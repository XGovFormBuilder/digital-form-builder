export function filterSections(details) {
  return details
    .filter((detail) => detail.name)
    .map((detail) => {
      if (detail.name.match(/\w\d/)) {
        detail.card = detail.items.find((item) => item.inError)
          ? detail.items[0].pageId
          : detail.items[0].url;
      }
      return detail;
    });
}
