// Dada Ki Jay Ho

import express, { Request, Response } from "express";
import findFreePorts from "find-free-ports";
import blogRouter from "./routes/blog";
import bodyParser from "body-parser";
import { setupElasticSearch } from "./elastic-search-config";
import chalk from "chalk";
import { fork } from "child_process";
import { join } from "path";
import { RabbitMQ } from "./queue-config";

const setupBackendApp = async () => {
  console.log(chalk.cyan("Initializing backend app ⏳......."));

  const app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  // const [app_port, rebbit_mq_port, elastic_search_port] = await findFreePorts(3);
  const app_port = 3001;

  app.get("/ping", (req: Request, res: Response) => res.send("pong"));

  app.use("/blog", blogRouter);

  app.listen(app_port, () =>
    console.log(chalk.green(`App is listening on port: ${app_port} 🚀....\n\n`))
  );
};

const init = async () => {
  console.log(chalk.yellow("Starting all Services ......\n"));
  const ES = await setupElasticSearch();
  if (!ES) throw new Error("Unable to start Elastic Search");
  
  const dataFeedProcess = fork(join(__dirname,"bulkIndexer.js"));
  
  dataFeedProcess.on("message", (msg) => {
    console.log(`message from data feeder: ${msg}`);
  });
  dataFeedProcess.on("end",  () => {
    console.log("done with data feeding");
  });


  await (new RabbitMQ()).setup();
  const mqListener = fork(join(__dirname,"queue-listener.js"));

  await setupBackendApp();
};

init();
