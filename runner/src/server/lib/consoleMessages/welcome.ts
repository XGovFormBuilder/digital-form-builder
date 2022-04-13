import config from "server/config";

function welcome() {
  if (!config.isTest) {
    console.log(`**********
**********
Server is running in production mode.
-- env=${config.env.toString()}
-- enforceCsrf=${config.enforceCsrf.toString()}
-- previewMode=${config.previewMode.toString()}
**********
**********`);
  } else {
    console.log(`**********
**********
WARNING: Server is running in insecure development/test mode. 
-- env=${config.env.toString()}
-- enforceCsrf=${config.enforceCsrf.toString()}
-- previewMode=${config.previewMode.toString()}

previewMode=true and enforceCsrf=false are both currently required
to allow the runner to accept posts from the designer for the building
and publishing of forms.

In production deployments, please ensure that the NODE_ENV=production
environment variable is set.

You can also create custom environment configurations by placing
a myenvironment.json file in runner/config/ with your bespoke config vars
or by setting individual vars in a .env file at runner/.env .
**********
**********`);
  }
}

export { welcome };
