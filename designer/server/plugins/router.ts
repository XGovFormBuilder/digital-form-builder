const routes = [
  {
    method: "GET",
    path: "/robots.txt",
    options: {
      handler: {
        file: "server/public/static/robots.txt",
      },
    },
  },
  {
    method: "GET",
    path: "/assets/{path*}",
    options: {
      handler: {
        directory: {
          path: "./dist/client/assets",
        },
      },
    },
  },
];

export default {
  plugin: {
    name: "router",
    register: (server, _options) => {
      server.route(routes);
    },
  },
};
