import { FormModel } from "server/plugins/engine/models";
import { Section } from "server/plugins/engine/models/Section";
import { Component } from "server/plugins/engine/components";
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

  async getRouteHandler(request, h) {
    const { cacheService } = request.services([]);

    const state = await cacheService.getState(request);
    const { progress = [] } = state;
    progress?.push(`/${this.model.basePath}${this.path}/summary`);
    await cacheService.mergeState(request, { progress });

    const viewModel = this.getViewModel(state);
    // viewModel.pageTitle = "Applicant details";

    return h.view("repeating-section-summary", viewModel);
  }

  getViewModel(state) {
    const s = {
      applicantDetails: [
        {
          firstName: "a",
          middleName: "b",
          lastName: "c",
          address: {
            addressLine1: "a",
            addressLine2: "b",
            town: "d",
            postcode: "ed",
          },
          phoneNumber: "+123",
          emailAddress: "a@j",
        },
      ],
    };
    const iterations = s[this.section.sectionName];
    const is = iterations.map((sectionState, i) => {
      const items = [];
      console.log(sectionState);
      for (let [path, page] of this.section.pages) {
        for (const component of page.components.formItems) {
          const item = Item(component, iterations[0], page, this.model);
          items.push(item);
          if (component.items) {
            const selectedValue = sectionState[component.name];
            const selectedItem = component.items.filter(
              (i) => i.value === selectedValue
            )[0];
            if (selectedItem && selectedItem.childrenCollection) {
              for (const cc of selectedItem.childrenCollection.formItems) {
                const cItem = Item(cc, sectionState, page, model);
                items.push(cItem);
              }
            }
          }
        }
      }
      return {
        card: {
          title: {
            text: `${this.section.title} ${i + 1}`,
          },
          actions: {
            items: [
              {
                href: "#",
                text: "Delete",
                visuallyHiddenText: `${this.section.title} ${i + 1}`,
              },
            ],
          },
        },
        rows: items.map(toRow),
      };
    });
    return {
      name: "testing",
      iterations: is,
    };
  }
}
function Item(component, sectionState, page, model: FormModel) {
  return {
    name: component.name,
    path: page.path,
    label: component.localisedString(component.title),
    value: component.getDisplayStringFromState(sectionState),
    rawValue: sectionState[component.name],
    // url: redirectUrl(request, `/${model.basePath}${page.path}`, params),
    pageId: `/${model.basePath}${page.path}`,
    type: component.type,
    title: component.title,
    dataType: component.dataType,
    immutable: component.options.disableChangingFromSummary,
  };
}

function toRow(item) {
  return {
    key: {
      text: item.label,
    },
    value: {
      text: item.value,
    },
    actions: {
      items: [{ text: "change" }],
    },
  };
}
