import { FormModel } from "server/plugins/engine/models";
import { Section } from "server/plugins/engine/models/Section";
import { Component, FormComponent } from "server/plugins/engine/components";
import { PageControllerBase } from "server/plugins/engine/pageControllers/PageControllerBase";

export class RepeatingSectionSummaryController {
  model: FormModel;
  section: Section;
  path: string;
  components: Map<
    string,
    { component: Component; page: PageControllerBase }
  > = new Map();

  constructor(formModel: FormModel, pageDef, section: Section) {
    this.model = formModel;
    this.section = section;
    this.path = `${pageDef.path}/summary`;

    for (let [path, page] of this.section.pages) {
      for (const component of page.components.formItems) {
        this.components.set(component.name, { component, page });
      }
    }
  }

  async postRouteHandler(request, h) {
    const { payload } = request;
    const { cacheService } = request.services([]);
    const state = await cacheService.getState(request);
    const sectionState = state[this.section.sectionName];
    const params = new URLSearchParams({
      num: sectionState.length + 1,
    });
    console.log(payload);
    if (payload.next === "increment") {
      console.log(this.section._startPage);
      return h.redirect(
        `/${this.model.basePath}${this.section._startPage?.path}?${params}`
      );
    }
  }

  async getRouteHandler(request, h) {
    const { cacheService } = request.services([]);

    const state = await cacheService.getState(request);
    const { progress = [] } = state;
    progress?.push(`/${this.model.basePath}${this.path}/summary`);
    await cacheService.mergeState(request, { progress });

    const viewModel = this.getViewModel(state);

    return h.view("repeating-section-summary", viewModel);
  }

  getViewModel(state) {
    const iterations = state[this.section.sectionName] ?? [];
    const is = iterations.map((sectionState, i) => {
      const items = [];
      const entriesForIteration = Object.entries(sectionState);
      entriesForIteration.forEach(([key, value]) => {
        // @ts-ignore
        const { component, page } = this.components.get(key);
        const item = Item(component, sectionState, page);
        items.push(item);
        if (component.items) {
          return;
        }
        const selectedValue = value;
        const selectedItem = component.items?.filter(
          (i) => i.value === selectedValue
        )[0];
        if (selectedItem && selectedItem.childrenCollection) {
          for (const cc of selectedItem.childrenCollection.formItems) {
            const cItem = Item(cc, sectionState, page);
            items.push(cItem);
          }
        }
      });

      return {
        card: {
          title: {
            text: `${this.section.title} ${i + 1}`,
          },
          actions: {
            items: [
              {
                href: `?delete=${i}`,
                text: "Delete",
                visuallyHiddenText: `${this.section.title} ${i + 1}`,
              },
            ],
          },
        },
        rows: items,
      };
    });

    return {
      pageTitle: this.section.title,
      iterations: is,
    };
  }
}
function Item(
  component: FormComponent,
  sectionState: any,
  page: PageControllerBase,
  num = 1
) {
  const model = page.model;
  const returnUrl = `/${model.basePath}/${page.sectionC.sectionName}/summary`;
  const params = {
    num,
    returnUrl,
  };
  const url = `/${model.basePath}${page.path}?${new URLSearchParams(
    params
  ).toString()}`;

  return {
    key: {
      text: component.title,
    },
    value: {
      text: component.getDisplayStringFromState(sectionState),
    },
    actions: {
      items: [
        {
          text: "change",
          visuallyHiddenText: `${component.title} ${num}`,
          href: url,
        },
      ],
    },
  };
}
