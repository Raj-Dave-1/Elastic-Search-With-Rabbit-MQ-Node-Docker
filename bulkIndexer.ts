// Dada Ki Jay Ho

import { readFile, readFileSync } from "fs";
import { indexDataToElasticSearch } from "./elastic-search-config";
import { IBlog } from "./model/blog";
import chalk from "chalk";

const fs = require("fs");

const runBulkIndexer = ({
  bulkSize,
  dataSource,
}: {
  bulkSize: number;
  dataSource: string;
}) => {
  console.log(chalk.cyan("Initiating bulk indexing ⏳......."));

  const filePath = dataSource;
  let count = 0;
  const chunkSize = 1; // Adjust the chunk size as needed

  
  const readStream = fs.createReadStream(filePath, {
    highWaterMark: chunkSize,
  });
  let buffer = "";

  let payloadList: IBlog[] = [];

  // read large number of data
  // instead of reading all data at once, we are reading data in chunks and indexing it into elastic search
  // I don't know how efficient this chunking logic is, but you can always change it as per your need.
  readStream.on("data", async (chunk: any) => {
    
    if (buffer === "" && chunk.toString() === "[") return; // avoiding open bracket of array
    if (buffer === "END_OF_OBJECT" && chunk.toString() === ",") {
      // avoiding ',' between two object in an array
      buffer = "";
      return;
    }
    buffer += chunk;
    try {

      const blogObject = JSON.parse(buffer);
      buffer = "END_OF_OBJECT";

      payloadList.push(blogObject as IBlog);
      if (payloadList.length === bulkSize) {
        // ---------- LOAD CHUNK TO ELASTIC SEARCH ---------------------
        const temp = payloadList;
        // clear payload list
        payloadList = [];
        count++;
        await indexDataToElasticSearch(temp, count);
        console.log(
          chalk.gray(
            `Bulk indexing completed successfully for chunk: ${count}`
          )
        );
      }
    } catch (error) {
      // JSON parsing error, the buffer is not a complete JSON object yet
    }
  });

  readStream.on("end", async () => {
    if (payloadList.length > 0) {
      // ---------- LOAD CHUNK TO ELASTIC SEARCH ---------------------
      await indexDataToElasticSearch(payloadList, count);
      // -------------------------------
      // clear payload list
      payloadList = [];
    }
    console.log(chalk.green("done with bulk indexing 🎉"));
    console.log("File reading completed\n");
  });

  readStream.on("error", (err: any) => {
    console.error("Error reading file:", err);
  });
};


runBulkIndexer({bulkSize: 100, dataSource: 'blogs.json'})
