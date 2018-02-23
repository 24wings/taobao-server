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
const cheerio = require("cheerio");
const colors = require("colors");
const url = require("url");
const db = require("../../model");
const http = require("http");
class Crawl {
    constructor() {
        this.crawlQueue = [];
    }
    /**下载整个网站 */
    linkCrawler(startUrl, acceptRegex, stepTime = 500) {
        return __awaiter(this, void 0, void 0, function* () {
            this.crawlQueue.push(startUrl);
            while (this.crawlQueue.length > 0) {
                let seedUrl = this.crawlQueue.pop();
                let page = yield db.pageModel.findOne({ url: seedUrl }).exec();
                let html;
                if (page) {
                    console.log(colors.green(`downloaded  ${seedUrl}`));
                    html = page.html;
                }
                else {
                    yield this.sleep(stepTime);
                    html = yield this.download(seedUrl);
                    if (html) {
                        yield new db.pageModel({ url: seedUrl, html: html }).save();
                    }
                    else {
                        continue;
                    }
                }
                let links = this.getLinks(html);
                links = links
                    .map(link => url.resolve(seedUrl, link))
                    .filter(link => !link.startsWith("javascript") &&
                    url.parse(link).hostname == url.parse(startUrl).hostname);
                for (let link of links) {
                    let exist = yield db.pageModel
                        .findOne({ url: link })
                        .count()
                        .exec();
                    if (exist == 0) {
                        this.crawlQueue.push(link);
                    }
                }
                //   console.log(this.crawlQueue);
                //   console.log(links);
            }
        });
    }
    sleep(time) {
        return new Promise(resolve => setTimeout(() => resolve(), time));
    }
    download(url, retry = 3) {
        return __awaiter(this, void 0, void 0, function* () {
            let html = "";
            console.log(colors.yellow(`downloading ${url}`));
            try {
                html = yield this.Get(url);
            }
            catch (e) {
                if (retry > 0) {
                    retry--;
                    html = yield this.Get(url);
                }
            }
            console.log(colors.red(`retry ${url}    is  ${retry} times`));
            return html;
        });
    }
    getLinks(html) {
        console.log(`parse`, html);
        let $ = cheerio.load(html);
        let hrefs = [];
        $("a").each((i, a) => {
            let href = a.attribs.href;
            if (href) {
                hrefs.push(href);
            }
        });
        return hrefs;
    }
    Get(url) {
        return new Promise(resolve => {
            let request = http.get(url, res => {
                console.log(`STATUS: ${res.statusCode}`);
                console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                res.setEncoding("utf8");
                let data = "";
                res.on("data", chunk => {
                    data += chunk;
                });
                res.on("end", () => {
                    resolve(data);
                });
            });
        });
    }
}
exports.Crawl = Crawl;
let crawl = new Crawl();
crawl.linkCrawler("http://www.66ys.tv/").then(res => console.log(""));
//# sourceMappingURL=index.js.map