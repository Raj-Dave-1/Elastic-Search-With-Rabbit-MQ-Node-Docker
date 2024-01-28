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
const elastic_search_config_1 = require("./elastic-search-config");
const chalk_1 = __importDefault(require("chalk"));
const fs = require("fs");
const runBulkIndexer = ({ bulkSize, dataSource, }) => {
    console.log(chalk_1.default.cyan("Initiating bulk indexing ⏳......."));
    const filePath = dataSource;
    let count = 0;
    const chunkSize = 1; // Adjust the chunk size as needed
    const readStream = fs.createReadStream(filePath, {
        highWaterMark: chunkSize,
    });
    let buffer = "";
    let payloadList = [];
    // read large number of data
    // instead of reading all data at once, we are reading data in chunks and indexing it into elastic search
    // I don't know how efficient this chunking logic is, but you can always change it as per your need.
    readStream.on("data", (chunk) => __awaiter(void 0, void 0, void 0, function* () {
        if (buffer === "" && chunk.toString() === "[")
            return; // avoiding open bracket of array
        if (buffer === "END_OF_OBJECT" && chunk.toString() === ",") {
            // avoiding ',' between two object in an array
            buffer = "";
            return;
        }
        buffer += chunk;
        try {
            const blogObject = JSON.parse(buffer);
            buffer = "END_OF_OBJECT";
            payloadList.push(blogObject);
            if (payloadList.length === bulkSize) {
                // ---------- LOAD CHUNK TO ELASTIC SEARCH ---------------------
                const temp = payloadList;
                // clear payload list
                payloadList = [];
                count++;
                yield (0, elastic_search_config_1.indexDataToElasticSearch)(temp, count);
                console.log(chalk_1.default.gray(`Bulk indexing completed successfully for chunk: ${count}`));
            }
        }
        catch (error) {
            // JSON parsing error, the buffer is not a complete JSON object yet
        }
    }));
    readStream.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
        if (payloadList.length > 0) {
            // ---------- LOAD CHUNK TO ELASTIC SEARCH ---------------------
            yield (0, elastic_search_config_1.indexDataToElasticSearch)(payloadList, count);
            // -------------------------------
            // clear payload list
            payloadList = [];
        }
        console.log(chalk_1.default.green("done with bulk indexing 🎉"));
        console.log("File reading completed\n");
    }));
    readStream.on("error", (err) => {
        console.error("Error reading file:", err);
    });
};
runBulkIndexer({ bulkSize: 100, dataSource: 'blogs.json' });
