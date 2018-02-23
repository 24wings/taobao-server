import superagent = require("superagent");
import cheerio = require("cheerio");
import colors = require("colors");
import url = require("url");
import db = require("../../model");
import http = require("http");
export class Crawl {
  private crawlQueue: string[] = [];
  /**下载整个网站 */
  async linkCrawler(
    startUrl: string,
    acceptRegex?: RegExp[],
    stepTime: number = 500
  ) {
    this.crawlQueue.push(startUrl);
    while (this.crawlQueue.length > 0) {
      let seedUrl: string = <string>this.crawlQueue.pop();
      let page = await db.pageModel.findOne({ url: seedUrl }).exec();

      let html;
      if (page) {
        console.log(colors.green(`downloaded  ${seedUrl}`));
        html = page.html;
      } else {
        await this.sleep(stepTime);
        html = await this.download(seedUrl);
        if (html) {
          await new db.pageModel({ url: seedUrl, html: html }).save();
        } else {
          continue;
        }
      }
      let links = this.getLinks(html);
      links = links
        .map(link => url.resolve(seedUrl, link))
        .filter(
          link =>
            !link.startsWith("javascript") &&
            url.parse(link).hostname == url.parse(startUrl).hostname
        );
      for (let link of links) {
        let exist = await db.pageModel
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
  }
  private sleep(time: number) {
    return new Promise(resolve => setTimeout(() => resolve(), time));
  }

  private async download(url: string, retry = 3) {
    let html: string = "";
    console.log(colors.yellow(`downloading ${url}`));
    try {
      html = await this.Get(url);
    } catch (e) {
      if (retry > 0) {
        retry--;
        html = await this.Get(url);
      }
    }
    console.log(colors.red(`retry ${url}    is  ${retry} times`));
    return html;
  }

  private getLinks(html: string): string[] {
    console.log(`parse`, html);
    let $ = cheerio.load(html);
    let hrefs: string[] = [];
    $("a").each((i, a) => {
      let href = a.attribs.href;
      if (href) {
        hrefs.push(href);
      }
    });
    return hrefs;
  }

  private Get(url: string, retry = 3): Promise<string> {
    return new Promise(resolve => {
      let request = http.get(url, res => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding("utf8");
        let data = "";
        res.on("data", chunk => {
          data += chunk;
        });
        res.on("error", async () => {
          if (retry > 0) {
            retry--;
            let html = await this.Get(url, retry);
            resolve(html);
          }
        });
        res.on("end", () => {
          resolve(data);
        });
      });
    });
  }
}

let crawl = new Crawl();
crawl.linkCrawler("http://www.66ys.tv/").then(res => console.log(""));
