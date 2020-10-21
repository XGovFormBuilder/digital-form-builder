import createServer from "./server";

createServer()
  .then((server) => server.start())
  .then(() => process.send && process.send("online"))
  .catch((err) => {
<<<<<<< HEAD
    console.error(err);
=======
    console.log(err);
>>>>>>> 8a3127d1972ea8d17f598668dbc9b37d685c67e4
    process.exit(1);
  });
