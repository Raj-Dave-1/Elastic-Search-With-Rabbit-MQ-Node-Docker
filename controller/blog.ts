// Dada Ki Jay Ho

import { Request, Response } from 'express';
import { IBlog } from '../model/blog';
import {v4 as uuidv4} from 'uuid';
import { searchBlogByTitle } from '../elastic-search-config';

export const add = (req: Request, res: Response) => {
  const { blogTitle, blogBody, tags } = req.body;

  const newBlog: IBlog = {id: uuidv4(), title: blogTitle, body: blogBody, tag: tags || []}

  // adding new blog to ......
  console.log(`new blog added with title: ${newBlog.title}`);
  
  // add new blog to SQS

  res.send("blog is published")
};

export const query = async (req: Request, res: Response) => {
  const { title } = req.body;

  // search for title to match in elastic search
  const data = await searchBlogByTitle((title||'').toString());

  return res.send(data);
}