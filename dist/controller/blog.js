"use strict";
// Dada Ki Jay Ho
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.add = void 0;
const elastic_search_config_1 = require("../elastic-search-config");
const queue_config_1 = require("../queue-config");
const queueName = 'new_blog';
const add = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { blogTitle, blogBody, tags } = req.body;
    const newBlog = { id: Date.now().toString(), title: blogTitle, body: blogBody, tag: tags || [] };
    // adding new blog to ......
    console.log(`new blog added with title: ${newBlog.title}`);
    // add new blog to SQS
    const channel = queue_config_1.RabbitMQ.channel;
    if (channel === undefined)
        throw new Error("Message Queue channel not initialized");
    channel.assertQueue(queueName, { durable: false });
    if (!channel.sendToQueue(queueName, Buffer.from(JSON.stringify(newBlog))))
        throw new Error("failed to put message into queue");
    res.send("blog is published");
});
exports.add = add;
const query = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    // search for title to match in elastic search
    const data = yield (0, elastic_search_config_1.searchBlogByTitle)((title || '').toString());
    return res.send(data);
});
exports.query = query;
