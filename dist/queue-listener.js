"use strict";
// Dada Ki Jay Ho
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.setupMQListener = void 0;
const amqp = __importStar(require("amqplib"));
const chalk_1 = __importDefault(require("chalk"));
const elastic_search_config_1 = require("./elastic-search-config");
const queueName = "new_blog";
const listener = (dataHandler) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield amqp.connect("amqp://localhost");
    console.log("sitaram");
    console.log(chalk_1.default.blue("connection established with message queue"));
    const channel = yield connection.createChannel();
    yield channel.assertQueue(queueName, { durable: false });
    // channel.sendToQueue(queueName, Buffer.from("sitaram"));
    const dataList = [];
    const consumer = yield channel.consume(queueName, (data) => {
        if (data) {
            dataList.push(JSON.parse(data.content.toString()));
            channel.ack(data);
        }
    });
    console.log("received data from queue: ", dataList);
    if (dataList.length > 0)
        dataHandler(dataList);
    setTimeout(() => {
        connection.close();
        console.log(chalk_1.default.blue("connection closed with message queue"));
    }, 500);
});
const setupMQListener = () => {
    setInterval(() => {
        listener(elastic_search_config_1.indexDataToElasticSearch);
    }, 10000);
};
exports.setupMQListener = setupMQListener;
(0, exports.setupMQListener)();
