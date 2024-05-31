import { PageControllerBase } from "server/plugins/engine/pageControllers";
import { FormModel } from "server/plugins/engine/models/FormModel";
import { RepeatingSectionSummaryController } from "server/plugins/engine/pageControllers/RepeatingSectionSummaryController";

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
    console.log(`start page: ${this._startPage?.path}`);
    for (let [vertex, edges] of this.adjacencyList.entries()) {
      console.log(`${this.name} VERTEX: ${vertex.path}`);
      console.log(`Edges: ${edges.map((edge) => edge.path).join(", ")}`);
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
  isRepeating: Boolean = false;
  pages: Map<string, PageControllerBase> = new Map();

  constructor(formModel: FormModel, sectionDef: any) {
    this.sectionName = sectionDef.name;
    this.title = sectionDef.title;
    const graph = new Graph({ name: this.sectionName });
    this.graph = graph;
    this.formModel = formModel;
    this.isRepeating = sectionDef.repeating === true;
    const pagesInSection = this.formModel.pages.filter(
      (page) => page.section?.name === this.sectionName
    );

    pagesInSection.forEach((page) => this.pages.set(page.path, page));

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
      console.log("setting new section:", section.name);

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
    const prevSection = this.sections.get(prev.section?.name);
    if (prevSection) {
      console.log(
        "SETTING START PAGE FOR",
        prevSection.sectionName,
        "TO",
        prev.path
      );
      prevSection.startPage = prev;
    }
    const nexts = prev.pageDef?.next.map((next) => {
      return this.form._PAGES.get(next.path);
    });

    nexts?.forEach((next) => {
      const nextSection = next.section?.name;
      const thisAndNextPageAreInSameSection =
        nextSection && nextSection === prevSection?.sectionName;
      // console.table({
      //   thisSection: section?.sectionName,
      //   nextSection: next.section?.name,
      //   thisAndNextPageAreInSameSection,
      // });
      const section = this.sections.get(nextSection);
      if (!section) {
        return;
      }
      if (thisAndNextPageAreInSameSection) {
        section?.graph.addEdge(prev, next);
      } else {
        prevSection?.graph.addVertex(next);
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
    const nexts = prev.pageDef?.next.map((next) => {
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
