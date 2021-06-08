import pino from "pino";

export default pino({
  name: "designer",
  browser: {
    transmit: {
      level: "warn",
      send: async function (level, logEvent) {
        //What levels do we send to the new endpoint?
        //Does the endpoint url matter? eg. /transmit
        //Should this be async / do we care about the response or do we just fire and forget?
        //Do we still need browser: {asObject: true}? If so, why?
        const newResponse = await window.fetch("/api/log", {
          method: "POST",
          body: JSON.stringify(logEvent),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        return newResponse.json();
        /*
        if (level === "warn") {
          // maybe send the logEvent to a separate endpoint
          // or maybe analyse the messages further before sending
        }
        // we could also use the `logEvent.level.value` property to determine
        // numerical value
        if (logEvent.level.value >= 50) {
          // covers error and fatal
          // send the logEvent somewhere
        }
        */
      },
    },
  },
});
