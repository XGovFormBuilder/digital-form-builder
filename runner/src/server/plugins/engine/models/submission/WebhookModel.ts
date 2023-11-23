import { DetailItem } from "../types";
import { format } from "date-fns";
import config from "server/config";
import nunjucks from "nunjucks";

function answerFromDetailItem(item) {
  switch (item.dataType) {
    case "list":
      return item.rawValue;
    case "date":
      return format(new Date(item.rawValue), "yyyy-MM-dd");
    case "monthYear":
      const [month, year] = Object.values(item.rawValue);
      return format(new Date(`${year}-${month}-1`), "yyyy-MM");
    default:
      return item.value;
  }
}

function detailItemToField(item: DetailItem) {
  return {
    key: item.name,
    title: item.title,
    type: item.dataType,
    answer: answerFromDetailItem(item),
  };
}

export function WebhookModel(
  relevantPages,
  details,
  model,
  fees,
  contextState
) {
  const questions = relevantPages?.map((page) => {
    const isRepeatable = !!page.repeatField;

    const itemsForPage = details.flatMap((detail) =>
      detail.items.filter((item) => item.path === page.path)
    );

    const detailItems = isRepeatable
      ? [itemsForPage].map((item) => ({ ...item, isRepeatable }))
      : itemsForPage;

    let index = 0;
    const fields = detailItems.flatMap((item, i) => {
      item.isRepeatable ? (index = i) : 0;
      const fields = [detailItemToField(item)];

      /**
       * This is currently deprecated whilst GDS fix a known issue with accessibility and conditionally revealed fields
       */
      const nestedItems = item?.items?.childrenCollection.formItems;
      nestedItems &&
        fields.push(nestedItems.map((item) => detailItemToField(item)));

      return fields;
    });

    let pageTitle = page.title;

    if (pageTitle) {
      pageTitle = nunjucks.renderString(page.title.en ?? page.title, {
        ...contextState,
      });
    }

    return {
      category: page.section?.name,
      question:
        pageTitle ?? page.components.formItems.map((item) => item.title),
      fields,
      index,
    };
  });

  // default name if no name is provided
  let englishName = `${config.serviceName} ${model.basePath}`;
  if (model.name) {
    englishName = model.name.en ?? model.name;
  }
  return {
    metadata: model.def.metadata,
    name: englishName,
    questions: questions,
    ...(!!fees && { fees }),
  };
}
