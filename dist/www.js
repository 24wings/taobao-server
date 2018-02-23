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
const path = require("path");
const koa = require("koa");
const serve = require("koa-static");
const bodyparser = require("koa-bodyparser");
const views = require("koa-views");
const routes = require("./route");
const session = require("koa-session");
let error = require("koa-handle-error");
var swig = require("swig");
require("./service");
swig.setDefaults({ cache: false });
let app = new koa();
const CONFIG = {
    key: "koa:sess" /** (string) cookie key (default is koa:sess) */,
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    overwrite: true /** (boolean) can overwrite or not (default true) */,
    httpOnly: true /** (boolean) httpOnly or not (default true) */,
    signed: true /** (boolean) signed or not (default true) */,
    rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
};
let server = app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
    //sads
    ctx.set("Access-Control-Allow-Origin", "http://localhost:4200");
    ctx.set("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    ctx.set("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    ctx.set("Access-Control-Allow-Credentials", "true");
    // ctx.set("X-Powered-By", ' 3.2.1')
    if (ctx.method == "OPTIONS")
        ctx.body = 200;
    else {
        /*让options请求快速返回*/
        yield next();
    }
}));
app.keys = ["some secret hurr"];
app
    .use(session(CONFIG, app))
    .use(serve(path.resolve(__dirname, "../www")))
    .use(bodyparser({ jsonLimit: "1000mb", formLimit: "1000mb" }))
    .use(views(path.resolve(__dirname, "../views"), { map: { html: "swig" } }))
    .use(error(err => console.error(err)));
for (let route in routes) {
    app.use(routes[route].allowedMethods());
    app.use(routes[route].routes());
}
// 微信app-secret      7d1aec534959dc79b518472d66685671
//7d1aec534959dc79b518472d66685671
server.listen(80, () => {
    console.log(`${new Date().toLocaleDateString()}: server is runing`);
});
//# sourceMappingURL=www.js.map