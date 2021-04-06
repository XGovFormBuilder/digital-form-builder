import config from "../config";
import { createConnection } from "typeorm";
import { Form } from "../repositories";
import { Version, VersionSubscriber } from "typeorm-versions";

export const initDB = async (): Promise<void> => {
  await createConnection({
    name: "designerCon",
    type: "postgres",
    url: config.dbUrl,
    synchronize: config.dbSync,
    entities: [Form, Version],
    subscribers: [VersionSubscriber],
  });
};
