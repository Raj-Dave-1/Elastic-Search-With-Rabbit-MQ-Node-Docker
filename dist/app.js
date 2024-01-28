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
const express_1 = __importDefault(require("express"));
const blog_1 = __importDefault(require("./routes/blog"));
const body_parser_1 = __importDefault(require("body-parser"));
const elastic_search_config_1 = require("./elastic-search-config");
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const path_1 = require("path");
const setupBackendApp = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(chalk_1.default.cyan("Initializing backend app ⏳......."));
    const app = (0, express_1.default)();
    app.use(body_parser_1.default.urlencoded({ extended: false }));
    app.use(body_parser_1.default.json());
    // const [app_port, rebbit_mq_port, elastic_search_port] = await findFreePorts(3);
    const app_port = 3001;
    app.get("/ping", (req, res) => res.send("pong"));
    app.use("/blog", blog_1.default);
    app.listen(app_port, () => console.log(chalk_1.default.green(`App is listening on port: ${app_port} 🚀....\n\n`)));
});
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(chalk_1.default.yellow("Starting all Services ......\n"));
    const ES = yield (0, elastic_search_config_1.setupElasticSearch)();
    if (!ES)
        throw new Error("Unable to start Elastic Search");
    const dataFeedProcess = (0, child_process_1.fork)((0, path_1.join)(__dirname, "bulkIndexer.js"));
    dataFeedProcess.on("message", (msg) => {
        console.log(`message from data feeder: ${msg}`);
    });
    dataFeedProcess.on("end", () => {
        console.log("done with data feeding");
    });
    yield setupBackendApp();
});
init();
