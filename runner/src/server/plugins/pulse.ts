import pulse from "hapi-pulse";

export default {
  plugin: pulse,
  options: {
    timeout: 800,
  },
};
