import { Data } from "@xgovformbuilder/model";

export function simplePageMock() {
  return {
    pages: [
      {
        title: "First page",
        path: "/first-page",
        components: [],
        controller: "./pages/summary.js",
        section: "home",
      },
    ],
    lists: [],
  };
}
