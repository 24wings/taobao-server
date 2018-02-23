"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const db = require("../model");
const iconv = require("iconv-lite");
const util = require("util");
let crawlerRouter = new Router();
exports.crawlerRouter = crawlerRouter;
let decoder = new util["TextDecoder"]();
let encoder = new util["TextEncoder"]();
crawlerRouter.all("/listPages", (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let url = ctx.query.url;
    let pages = yield db.pageModel
        .find({ url: new RegExp(url) })
        .limit(10)
        .exec();
    switch (ctx.query.encoding) {
        case "gbk":
            pages.forEach(page => {
                //   icon
                page.html = iconv.decode(Buffer.from(page.html), "gb2312");
            });
            break;
        default:
            break;
    }
    ctx.body = { ok: true, data: pages };
}));
//# sourceMappingURL=crawler.route.js.map