// Dada Ki Jay Ho

import { Request, Response } from 'express';
import { IBlog } from '../model/blog';
import {v4 as uuidv4} from 'uuid';
import { searchBlogByTitle } from '../elastic-search-config';
import * as amqp from 'amqplib';
import { RabbitMQ } from '../queue-config';

const queueName = 'new_blog';

export const add = async (req: Request, res: Response) => {
  const { blogTitle, blogBody, tags } = req.body;

  const newBlog: IBlog = {id: Date.now().toString(), title: blogTitle, body: blogBody, tag: tags || []}

  // adding new blog to ......
  console.log(`new blog added with title: ${newBlog.title}`);
  
  // add new blog to SQS
  const channel = RabbitMQ.channel;
  if(channel === undefined)
    throw new Error("Message Queue channel not initialized")
  
  channel.assertQueue(queueName, {durable: false});
  if(!channel.sendToQueue(queueName, Buffer.from(JSON.stringify(newBlog))))
    throw new Error("failed to put message into queue")

  res.send("blog is published")
};

export const query = async (req: Request, res: Response) => {
  const { title } = req.body;

  // search for title to match in elastic search
  const data = await searchBlogByTitle((title||'').toString());

  return res.send(data);
}