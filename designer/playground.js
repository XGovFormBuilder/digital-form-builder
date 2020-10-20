const joi = require("joi");
const { schema } = require("@xgovformbuilder/model");
const pkg = require("./package.json");

module.exports = {
  plugin: {
    name: pkg.name,
    version: pkg.version,
    dependencies: "vision",
    register: (server, options) => {
      const { playgroundModel } = options;

      function getData(request) {
        return request.yar.get("model") || playgroundModel;
      }

      // DESIGNER
      server.route({
        method: "get",
        path: "/designer",
        handler: (request, h) => {
          return h.view("designer", { playgroundMode: true });
        },
      });

      // DESIGNER SPLIT SCREEN
      server.route({
        method: "get",
        path: "/split",
        handler: (request, h) => {
          return h.view("split");
        },
      });

      // GET DATA
      server.route({
        method: "GET",
        path: "/api/data",
        options: {
          handler: (request, h) => {
            if (request.query.format) {
              const json = JSON.stringify(getData(request), null, 2);
              return h.response(json).type("application/json");
            }

            return getData(request);
          },
          validate: {
            query: {
              format: joi.boolean(),
            },
          },
        },
      });

      // SAVE DATA
      server.route({
        method: "PUT",
        path: "/api/data",
        options: {
          handler: async (request, h) => {
            try {
              const result = schema.validate(request.payload, {
                abortEarly: false,
              });

              if (result.error) {
                throw new Error("Schema validation failed");
              }

              request.yar.set("model", result.value);

              return result.value;
            } catch (err) {
              return h
                .response({ ok: false, err: "Write file failed" })
                .code(401);
            }
          },
          validate: {
            payload: joi.object().required(),
          },
        },
      });
    },
  },
};
