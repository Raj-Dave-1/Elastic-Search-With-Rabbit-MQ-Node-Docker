// Dada Ki Jay Ho

import * as amqp from "amqplib";

export class RabbitMQ {
  static channel:amqp.Channel | undefined = undefined;
  async RabbitMQ() {
  }

  async setup(){
    const connection = await amqp.connect("amqp://localhost");
    RabbitMQ.channel = await connection.createChannel();
  }
}


