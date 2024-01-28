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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBlogByTitle = exports.indexDataToElasticSearch = exports.setupElasticSearch = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const chalk_1 = __importDefault(require("chalk"));
let client;
const setupElasticSearch = () => {
    try {
        console.log(chalk_1.default.cyan("Setting up elastic search ⏳"));
        client = new elasticsearch_1.Client({
            node: "http://localhost:9200", // Elasticsearch endpoint
        });
        console.log(chalk_1.default.green("elastic search setup successfull 🎉\n"));
        return true;
    }
    catch (error) {
        console.log(chalk_1.default.red("failed to setup elastic search ❌\n"));
        console.log(error);
        return false;
    }
};
exports.setupElasticSearch = setupElasticSearch;
const indexDataToElasticSearch = (payloadList, chunkNumber) => __awaiter(void 0, void 0, void 0, function* () {
    if (client === undefined) {
        if (yield (0, exports.setupElasticSearch)()) {
            throw new Error("error occured while setting up Elastic Search");
        }
    }
    const body = payloadList.flatMap((doc) => [
        {
            index: {
                // the action that you want to perform
                _index: "blogs",
                _type: "_doc",
                _id: doc.id,
            },
        },
        doc, // the data on which given action should be performed
    ]);
    // console.log(body); uncomment this line and see in more list to understand better
    const { body: bulkResponse } = yield client.bulk({ refresh: true, body });
    if (bulkResponse.errors) {
        console.error(chalk_1.default.red(bulkResponse.errors));
    }
    else {
        if (!chunkNumber)
            console.log(chalk_1.default.gray(`Indexing completed successfully for payload from Message Queue 🤔`));
    }
});
exports.indexDataToElasticSearch = indexDataToElasticSearch;
const searchBlogByTitle = (title) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(chalk_1.default.gray(`Searching for blog which includes ${title} in title`));
    try {
        const data = yield client.search({
            index: "blogs",
            body: {
                query: {
                    // wildcard: {
                    //   title: `*${title.replace(' ', '*')}*`,
                    // },
                    // ---------------
                    // terms: {
                    //   title: title.split(' '),
                    // }
                    // regexp: { "title": `.*${title}.*` }
                    // ---------------
                    // match: {
                    //   title: {
                    //     query: title,
                    //     operator: "and",
                    //   },
                    // },
                    // ---------------
                    bool: {
                        should: title.split(" ").map((eachWord) => {
                            return { wildcard: { title: `*${eachWord}*` } };
                        }),
                        minimum_should_match: 1, // At least one keyword should match
                    },
                },
            },
        });
        console.log(chalk_1.default.green(`Search Successfull\n`));
        return data;
    }
    catch (error) {
        console.log(chalk_1.default.red(error));
        return { error: "Something went wrong" };
    }
});
exports.searchBlogByTitle = searchBlogByTitle;
