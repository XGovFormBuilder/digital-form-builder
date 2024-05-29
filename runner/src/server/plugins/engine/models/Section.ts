import { PageControllerBase } from "server/plugins/engine/pageControllers";
import { FormModel } from "server/plugins/engine/models/FormModel";
import { RepeatingSummaryPageController } from "server/plugins/engine/pageControllers/RepeatingSummaryPageController";
import { RepeatingSectionSummaryController } from "server/plugins/engine/pageControllers/RepeatingSectionSummaryController";

export class Graph {
  adjacencyList: Map<any, any[]>;
  name: string = "";

  constructor(options: { name: string }) {
    this.name = options?.name ?? "";
    this.adjacencyList = new Map();
  }

  addVertex(vertex: PageControllerBase) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(origin: PageControllerBase, destination: PageControllerBase) {
    console.log("adding edge to", this.name, origin.path, destination.path);
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
      console.log(
        `${this.name} Vertex - ${vertex.path}: Edges - ${edges
          .map((edge) => edge.path)
          .join(", ")}`
      );
    }
  }
}

export class Section {
  sectionName: string;
  graph: Graph;
  formModel: FormModel;
  summaryPage: RepeatingSectionSummaryController;
  startPage: PageControllerBase;
  constructor(formModel: FormModel, sectionDef: any) {
    this.sectionName = sectionDef.name;
    const graph = new Graph({ name: this.sectionName });
    this.graph = graph;
    this.formModel = formModel;
    this.summaryPage = new RepeatingSectionSummaryController(
      formModel,
      sectionDef,
      this
    );
  }
}

export class Sections {
  sections: Map<string, Section> = new Map();
  form: FormModel;
  pages: FormModel["_PAGES"];
  constructor(formModel: FormModel) {
    this.form = formModel;
    this.pages = formModel._PAGES;
    console.log(formModel.def.name);
    const startPage = formModel.startPage;
    formModel.sections?.forEach((section) => {
      console.log("setting", section.name);
      this.sections.set(section.name, new Section(formModel, section));
    });

    if (!startPage) {
      return;
    }
    this.addNodesRecursively(startPage);
  }

  addNodesRecursively(prev: PageControllerBase) {
    console.log("ADDING FROM", prev.section?.name, prev.path);
    const section = this.sections.get(prev.section?.name);
    const nexts = prev.pageDef?.next.map((next) => {
      return this.form._PAGES.get(next.path);
    });

    nexts?.forEach((next) => {
      const nextSection = next.section?.name;
      const thisAndNextPageAreInSameSection =
        nextSection && nextSection !== section?.sectionName;
      console.table({
        thisSection: section?.sectionName,
        nextSection: next.section?.name,
        thisAndNextPageAreInSameSection,
      });

      if (thisAndNextPageAreInSameSection) {
        section?.graph.addEdge(prev, next);
      }
      this.addNodesRecursively(next);
    });
  }
}
