import config from "../../config";
import newFormJson from "../../../new-form.json";
import { nanoid } from "nanoid";
import { publish } from "../../lib/publish";
import { ServerRoute } from "@hapi/hapi";
import { HapiRequest } from "../../types";

export const registerNewFormWithRunner: ServerRoute = {
  method: "post",
  path: "/api/new",
  options: {
    handler: async (request: HapiRequest, h) => {
      const { persistenceService } = request.services([]);
      const { selected, name } = request.payload;

      if (name && name !== "" && !name.match(/^[a-zA-Z0-9 _-]+$/)) {
        return h
          .response("Form name should not contain special characters")
          .type("application/json")
          .code(400);
      }

      const newName = name === "" ? nanoid(10) : name;

      try {
        if (selected.Key === "New") {
          if (config.persistentBackend !== "preview") {
            await persistenceService.uploadConfiguration(
              `${newName}.json`,
              JSON.stringify(newFormJson)
            );
          }
          await publish(newName, newFormJson);
        } else {
          await persistenceService.copyConfiguration(
            `${selected.Key}`,
            newName
          );
          const copied = await persistenceService.getConfiguration(newName);
          await publish(newName, copied);
        }
      } catch (e) {
        console.log(
          "\x1b[36m%s\x1b[0m",
          `**********
ERROR: Publishing and previewing forms is not possible currently, either because the runner is
not available at ${config.publishUrl.toString()} or if it is running, previewMode may be set to false on it.

To enable publishing and previewing of forms, ensure the runner is running in development mode 
by setting NODE_ENV=development in your environment and then re-starting the runner with: 
$>yarn runner start" +

You can alternatively create a custom environment by placing a custom myenvironment.json file
in the runner/config folder. Note: enforceCsrf must be set to false 
and previewMode must be set to true on the runner for the designer to work
See runner/config/development.json for example dev defaults.
**********`
        );
        request.logger.error(e);
        return h
          .response(
            `Designer could not connect to runner instance. 
Please confirm it is up and running, 
and in development mode. See docs for more details.`
          )
          .type("application/json")
          .code(401);
      }

      const response = {
        id: `${newName}`,
        previewUrl: config.previewUrl,
      };

      return h.response(response).type("application/json").code(200);
    },
  },
};
