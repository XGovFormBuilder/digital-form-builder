// This converts the personal information in the YourDetails and TheirDetails sections into single rows, then moves these into the PersonalDetails section.
// Additionally, the Close Contact sections are turned into cards, and info not contained in a named section is filtered out.

export function closeContact(
  details: Array<{ name: string; title: string; items: Array<any> }>
) {
  const getSection = (name: string) =>
    details.find((detail) => detail.name === name);

  const yourOrTheirDetails = (name: string) =>
    Object.assign(
      getSection(name)!.items.find((item) => item.name === "first_name"),
      {
        name,
        label: name.replace("Details", " details"),
        title: name.replace("Details", " details"),
        value: getSection(name)!
          .items.map((item) => item.value)
          .filter((value) => value)
          .join("\n")
          .replace("\n", " "),
        rawValue: "values",
      }
    );

  const personalDetails = getSection("PersonalDetails");
  if (personalDetails) {
    personalDetails.items.unshift(yourOrTheirDetails("YourDetails"));
    if (getSection("TheirDetails")) {
      personalDetails.items.splice(2, 0, yourOrTheirDetails("TheirDetails"));
    }
    const filtered = details.filter(
      (detail) => detail.name && !detail.name.includes("Details")
    );
    filtered.unshift(personalDetails);
    return filtered.map((detail) => {
      const { url } = detail.items[0];
      if (detail.name.match(/CloseContact\d/)) return { ...detail, card: url };
      return detail;
    });
  }

  return details;
}
