import path from "path";

const runnerFolder = path.join(__dirname, "..", "..", "..");
const govukFolder = path.join(
  runnerFolder,
  "node_modules",
  "govuk-frontend",
  "dist",
  "govuk"
);

export default [
  {
    method: "GET",
    path: "/assets/{path*}",
    options: {
      handler: {
        directory: {
          path: [
            path.join(runnerFolder, "public", "static"),
            path.join(runnerFolder, "public", "build"),
            govukFolder,
            path.join(govukFolder, "assets"),
            path.join(govukFolder, "assets", "rebrand"),
            path.join(
              runnerFolder,
              "node_modules",
              "hmpo-components",
              "assets"
            ),
          ],
        },
      },
    },
  },
];
