"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
//export config parameters
exports.config = {
    host: process.env.host || "localhost",
    port: process.env.port || "3000",
    url: process.env.url || "http://localhost:3000",
    dialet: process.env.dialet,
    db: process.env.db,
    endpoint: process.env.ENDPOINT,
};
