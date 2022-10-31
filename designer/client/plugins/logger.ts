import pino from "pino";
const logLevel = process.env.REACT_LOG_LEVEL;
console.log(".   112." + "");
export default pino({
  name: "designer",
  browser: {
    asObject: true,
    transmit: {
      level: logLevel,
      send: async function (_level, logEvent) {
        return await window.fetch("/api/log", {
          method: "POST",
          body: JSON.stringify(logEvent),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      },
    },
  },
});
