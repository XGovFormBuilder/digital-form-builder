import { PageControllerBase } from "server/plugins/engine/pageControllers";
import { FormModel } from "server/plugins/engine/models/FormModel";
import { RepeatingSectionSummaryController } from "server/plugins/engine/pageControllers/RepeatingSectionSummaryController";
import { Component, FormComponent } from "server/plugins/engine/components";
import { redirectUrl } from "server/plugins/engine";

export class Graph {
  adjacencyList: Map<any, any[]>;
  name: string = "";
  _startPage?: PageControllerBase;

  constructor(options?: { name: string }) {
    this.name = options?.name ?? "";
    this.adjacencyList = new Map();
  }

  addVertex(vertex: PageControllerBase) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(origin: PageControllerBase, destination: PageControllerBase) {
    // console.log("adding edge to", this.name, origin.path, destination.path);
    // this.startPage = origin;
    if (!this.adjacencyList.has(origin)) {
      this.addVertex(origin);
    }
    if (!this.adjacencyList.has(destination)) {
      this.addVertex(destination);
    }
    this.adjacencyList.get(origin).push(destination);
  }

  logGraph() {
    for (let [vertex, edges] of this.adjacencyList.entries()) {
    }
  }
}

export class Section {
  sectionName: string;
  title: string;
  graph: Graph;
  formModel: FormModel;
  summaryPage: RepeatingSectionSummaryController;
  _startPage?: PageControllerBase;
  _lastPage?: PageControllerBase;
  isRepeating: Boolean = false;
  pages: Map<string, PageControllerBase> = new Map();
  components: Map<
    string,
    { component: Component; Page: PageControllerBase }
  > = new Map();

  constructor(formModel: FormModel, sectionDef: any) {
    this.sectionName = sectionDef.name;
    this.title = sectionDef.title;
    const graph = new Graph({ name: this.sectionName });
    this.graph = graph;
    this.formModel = formModel;
    this.isRepeating = sectionDef.repeating === true;
    const pagesInSection = this.formModel.pages.filter(
      (page) => page?.section?.name === this.sectionName
    );

    pagesInSection.forEach((page) => this.pages.set(page.path, page));

    for (let [_path, page] of this.pages) {
      for (const component of page.components.formItems) {
        this.components.set(component.name, { component, page });
      }
    }

    this.summaryPage = new RepeatingSectionSummaryController(
      formModel,
      sectionDef,
      this
    );
  }

  set startPage(startPage) {
    if (!this._startPage) {
      this._startPage = startPage;
    }
  }

  set lastPage(lastPage) {
    if (!this._lastPage && lastPage) {
      this._lastPage = lastPage;
    }
  }

  get lastPage() {
    return this._lastPage;
  }

  getSummaryDetailItems(sectionStates) {
    console.log(sectionStates);
    const is = sectionStates?.map((sectionState, i) => {
      const items = [];
      const entriesForIteration = Object.entries(sectionState);
      entriesForIteration.forEach(([key, value]) => {
        // @ts-ignore
        const { component, page } = this.components.get(key);
        const item = DetailItem(component, sectionState, page, i);

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
            text: `${this.title} ${i + 1}`,
          },
        },
        rows: items,
        detailItems: items,
        isRepeated: true,
      };
    });

    return {
      name: this.sectionName,
      title: this.title,
      items: is,
    };
  }

  getSummaryViewModel(sectionStates) {
    const is = sectionStates?.map((sectionState, i) => {
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
            text: `${this.title} ${i + 1}`,
          },
        },
        rows: items,
      };
    });

    return {
      pageTitle: this.title,
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
  const returnUrl = `/${model.basePath}/summary`;
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

export class Sections {
  sections: Map<string, Section> = new Map();
  form: FormModel;
  pages: FormModel["_PAGES"];
  constructor(formModel: FormModel) {
    this.form = formModel;
    this.pages = formModel._PAGES;
    const startPage = formModel.startPage;
    formModel.sections?.forEach((section) => {
      this.sections.set(section.name, new Section(formModel, section));
    });

    if (!startPage) {
      return;
    }
    this.addNodesRecursively(startPage);
  }

  get(section) {
    console.log("getting section:", section);
    return this.sections.get(section);
  }

  addNodesRecursively(prev: PageControllerBase) {
    // console.log("ADDING FROM", prev.section?.name, prev.path);
    const prevSection = this.sections.get(prev?.section?.name);
    if (prevSection) {
      prevSection.startPage = prev;
    }
    const nexts = prev?.pageDef?.next?.map((next) => {
      return this.form._PAGES.get(next.path);
    });

    nexts?.forEach((next) => {
      const nextSection = next?.section?.name;
      const thisAndNextPageAreInSameSection =
        nextSection && nextSection === prevSection?.sectionName;
      const section = this.sections.get(nextSection);

      if (thisAndNextPageAreInSameSection) {
        section?.graph.addEdge(prev, next);
      } else {
        prevSection?.graph.addVertex(next);
        if (prevSection) {
          prevSection.lastPage = prev;
        }
      }
      this.addNodesRecursively(next);
    });
  }
  logGraph() {
    this.sections.forEach((section) => section.graph.logGraph());
  }
}

export class SuperGraph {
  sections: Map<string, Section> = new Map();
  form: FormModel;
  pages: FormModel["_PAGES"];
  graph: Graph = new Graph();
  constructor(formModel: FormModel) {
    this.form = formModel;
    this.pages = formModel._PAGES;
    const startPage = formModel.startPage;

    if (!startPage) {
      return;
    }
    this.addNodesRecursively(startPage);
  }

  addNodesRecursively(prev: PageControllerBase) {
    // console.log("ADDING FROM", prev.section?.name, prev.path);
    const nexts = prev?.pageDef?.next?.map?.((next) => {
      return this.form._PAGES.get(next.path);
    });

    // console.table({
    //   current: prev.path,
    //   nexts: nexts.map((next) => next.path).join(", "),
    // });

    nexts?.forEach((next) => {
      this.graph.addEdge(prev, next);
      this.addNodesRecursively(next);
    });
  }
  logGraph() {
    this.graph.logGraph();
  }
}

function DetailItem(component, sectionState, page, i) {
  const model = page.model;
  const returnUrl = `/${model.basePath}/summary`;
  const params = {
    i,
    returnUrl,
  };
  const url = `/${model.basePath}${page.path}?${new URLSearchParams(
    params
  ).toString()}`;
  return {
    name: component.name,
    path: page.path,
    label: component.localisedString(component.title),
    value: component.getDisplayStringFromState(sectionState),
    rawValue: sectionState[component.name],
    url,
    pageId: `/${model.basePath}${page.path}`,
    type: component.type,
    title: component.title,
    dataType: component.dataType,
    index: i,
  };
}
