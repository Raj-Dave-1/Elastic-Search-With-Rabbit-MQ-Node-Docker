// Dada Ki Jay Ho

import { Client } from "@elastic/elasticsearch";
import { IBlog } from "./model/blog";
import chalk from "chalk";

let client: Client;

export const setupElasticSearch = async () => {
  if (client !== undefined) return true;
  try {
    console.log(chalk.cyan("Setting up elastic search ⏳"));

    client = new Client({
      node: "http://localhost:9200", // Elasticsearch endpoint
    });

    await client.ping();
    console.log(chalk.green("elastic search setup successfull 🎉\n"));
    return true;
  } catch (error) {
    console.log(chalk.red("failed to setup elastic search ❌\n"));
    return false;
  }
};

export const isElasticSearchUp = async () => {
  return setupElasticSearch();
};

export const indexDataToElasticSearch = async (
  payloadList: IBlog[],
  chunkNumber?: number
) => {
  if (client === undefined) {
    if (!(await setupElasticSearch())) {
      throw new Error("error occured while setting up Elastic Search");
    }
  }

  const body = payloadList.flatMap((doc) => [
    {
      index: {
        // the action that you want to perform
        _index: "blogs",
        _type: "_doc",
      },
    },
    doc, // the data on which given action should be performed
  ]);
  // console.log(body); //uncomment this line and see in more list to understand better

  const {
    body: bulkResponse,
    statusCode,
    warnings,
  } = await client.bulk({ refresh: true, body });
  if (bulkResponse.errors) {
    // console.log(bulkResponse);

    console.error(chalk.red(bulkResponse.errors));
    console.error(chalk.red(statusCode));
    console.error(chalk.red(warnings));
    console.error(chalk.red(JSON.stringify(bulkResponse)));
  } else {
    if (!chunkNumber)
      console.log(
        chalk.gray(
          `Indexing completed successfully for payload from Message Queue 🤔`
        )
      );
  }
};

export const searchBlogByTitle = async (title: string) => {
  console.log(
    chalk.gray(`Searching for blog which includes ${title} in title`)
  );
  try {
    const data = await client.search({
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

    console.log(chalk.green(`Search Successfull\n`));
    return data;
  } catch (error) {
    console.log(chalk.red(error));
    return { error: "Something went wrong" };
  }
};
