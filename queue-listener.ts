// Dada Ki Jay Ho

import * as amqp from "amqplib";
import { IBlog } from "./model/blog";
import chalk from "chalk";
import { indexDataToElasticSearch } from "./elastic-search-config";

const queueName = "new_blog";

const listener = async (dataHandler: (data: IBlog[]) => void) => {
  const connection = await amqp.connect("amqp://localhost");
  console.log("sitaram");
  console.log(chalk.blue("connection established with message queue"));

  const channel = await connection.createChannel();

  await channel.assertQueue(queueName, { durable: false });

  // channel.sendToQueue(queueName, Buffer.from("sitaram"));

  const dataList: any[] = [];
  const consumer = await channel.consume(queueName, (data) => {
    if (data) {
      dataList.push(JSON.parse(data.content.toString()));
      channel.ack(data);
    }
  });
  console.log("received data from queue: ", dataList);
  if(dataList.length > 0)
    dataHandler(dataList);

  setTimeout(() => {
    connection.close();
    console.log(chalk.blue("connection closed with message queue"));
  }, 500);
};

export const setupMQListener = () => {
  setInterval(() => {
    listener(indexDataToElasticSearch);
  }, 10_000);
};

setupMQListener();