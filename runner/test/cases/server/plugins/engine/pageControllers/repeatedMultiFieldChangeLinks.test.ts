import path from "path";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import cheerio from "cheerio";
import createServer from "src/server";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { after, before, suite, test } = lab;

const formId = "repeated-multi-field-change-links";
const basePath = `/${formId}`;

// The final summary links each card back to its entry with a returnUrl.
const editFromSummary = (page: string, index: number) =>
  `${basePath}/${page}?returnUrl=${encodeURIComponent(
    `${basePath}/summary`
  )}&view=${index}`;

const hrefs = ($, links) => links.map((_i, a) => $(a).attr("href")).get();

// Each card's own Delete and Change actions, and its per-field Change links.
const cardLinks = ($) =>
  $(".govuk-summary-card")
    .map((_i, card) => ({
      title: $(card).find(".govuk-summary-card__title").text().trim(),
      cardActions: hrefs($, $(card).find(".govuk-summary-card__actions a")),
      fieldChangeLinks: hrefs(
        $,
        $(card).find(".govuk-summary-list__actions a")
      ),
    }))
    .get();

suite(
  "RepeatedMultiFieldPageController field change links on rendered summaries",
  () => {
    let server;
    let cookie;

    before(async () => {
      server = await createServer({
        formFileName: `${formId}.json`,
        formFilePath: path.join(__dirname, "..", "..", "..", "forms"),
      });

      let sessionId;
      server.ext("onPreResponse", (request, h) => {
        sessionId = request.yar?.id;
        return h.continue;
      });
      await server.initialize();

      const firstPage = await server.inject({
        method: "get",
        url: `${basePath}/people`,
      });
      cookie = (firstPage.headers["set-cookie"] as string[])
        .map((c) => c.split(";")[0])
        .join("; ");

      const { cacheService } = server.services();
      await cacheService.mergeState(
        { yar: { id: sessionId }, params: { id: formId } },
        {
          people: [{ personName: "Alice" }, { personName: "Bob" }],
          pets: [{ petName: "Rex" }, { petName: "Tom" }],
        }
      );
    });

    after(async () => {
      await server.stop();
    });

    const getPage = async (url: string) => {
      const response = await server.inject({
        method: "get",
        url,
        headers: { cookie },
      });
      expect(response.statusCode).to.equal(200);
      return cheerio.load(response.payload);
    };

    test("hideFieldChangeLinksOnRepeatSummary hides field links on the repeat summary but keeps the card actions", async () => {
      const $ = await getPage(`${basePath}/people?view=summary`);

      expect(cardLinks($)).to.equal([
        {
          title: "Person 1",
          cardActions: ["?remove=0", "?view=0"],
          fieldChangeLinks: [],
        },
        {
          title: "Person 2",
          cardActions: ["?remove=1", "?view=1"],
          fieldChangeLinks: [],
        },
      ]);
    });

    test("hideFieldChangeLinksOnMainSummary leaves field links on the repeat summary", async () => {
      const $ = await getPage(`${basePath}/pets?view=summary`);

      expect(cardLinks($)).to.equal([
        {
          title: "Pet 1",
          cardActions: ["?remove=0", "?view=0"],
          fieldChangeLinks: [`${basePath}/pets?view=0`],
        },
        {
          title: "Pet 2",
          cardActions: ["?remove=1", "?view=1"],
          fieldChangeLinks: [`${basePath}/pets?view=1`],
        },
      ]);
    });

    test("on the final summary, only pages with hideFieldChangeLinksOnMainSummary lose their field links", async () => {
      const $ = await getPage(`${basePath}/summary`);

      expect(cardLinks($)).to.equal([
        {
          title: "Person 1",
          cardActions: [editFromSummary("people", 0)],
          fieldChangeLinks: [editFromSummary("people", 0)],
        },
        {
          title: "Person 2",
          cardActions: [editFromSummary("people", 1)],
          fieldChangeLinks: [editFromSummary("people", 1)],
        },
        {
          title: "Pet 1",
          cardActions: [editFromSummary("pets", 0)],
          fieldChangeLinks: [],
        },
        {
          title: "Pet 2",
          cardActions: [editFromSummary("pets", 1)],
          fieldChangeLinks: [],
        },
      ]);
    });

    test("the final summary keeps the add or delete buttons when field links are hidden", async () => {
      const $ = await getPage(`${basePath}/summary`);

      const buttons = $("a.govuk-button--secondary")
        .map((_i, a) => $(a).text().replace(/\s+/g, " ").trim())
        .get();

      expect(buttons).to.equal(["Add or delete person", "Add or delete pet"]);
    });

    test("the repeat summary title is rendered from separatePageTitle", async () => {
      const $ = await getPage(`${basePath}/people?view=summary`);

      expect($("title").text().trim()).to.startWith("Check the 2 people");
    });
  }
);
