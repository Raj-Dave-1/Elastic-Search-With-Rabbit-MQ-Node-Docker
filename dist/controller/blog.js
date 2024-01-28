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
const uuid_1 = require("uuid");
const elastic_search_config_1 = require("../elastic-search-config");
const add = (req, res) => {
    const { blogTitle, blogBody, tags } = req.body;
    const newBlog = { id: (0, uuid_1.v4)(), title: blogTitle, body: blogBody, tag: tags || [] };
    // adding new blog to ......
    console.log(`new blog added with title: ${newBlog.title}`);
    // add new blog to SQS
    res.send("blog is published");
};
exports.add = add;
const query = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    // search for title to match in elastic search
    const data = yield (0, elastic_search_config_1.searchBlogByTitle)((title || '').toString());
    return res.send(data);
});
exports.query = query;
