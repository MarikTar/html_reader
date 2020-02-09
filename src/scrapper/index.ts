import fetch from 'node-fetch-with-proxy';
import * as HTMLParser from 'node-html-parser';

interface ISelector {
  [key: string]: {
    selector: string,
    attr: keyof HTMLAnchorElement,
    subattr?: string
  };
}
interface INodeList {
  [key: string]: HTMLParser.HTMLElement[];
}

export default class Scraper {
  listPages: string = '';
  compresedData: INodeList[] = [];
  baseUrl: string;
  progress: number = 0;
  stop: boolean = false;
  listStep: number = 1;
  compressStep: number = 0;
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  init(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.stop = false;
  }

  private timeout(s: number): Promise<void> {
    return new Promise((res) => {
      setTimeout(res, s * 1000);
    });
  }

  createURLMasks(mask: string, pages: number): string[] {
    const urls = [];
    for (let i = 1; i <= pages; i += 1) {
      urls.push(this.baseUrl + mask + i);
    }
    return urls;
  }

  async getHTML(url: string = this.baseUrl): Promise<string> {
    try {
      const response: Response = await fetch(url);
      const data = await response.text();
      return data;
    } catch (error) {
      console.log(error);
      return '';
    }
  }

  getNodeList(HTML: string, selector: Record<string, string>): INodeList {
    const nodeList: INodeList = {};
    const keys = Object.keys(selector);
    const elementHTML = HTMLParser.parse(HTML) as HTMLParser.HTMLElement;
    keys.forEach((key) => {
      nodeList[key] = elementHTML.querySelectorAll(`${selector[key]}`);
    });
    return nodeList;
  }

  // searchInfo(HTML: string, selector: ISelector): Record<string, string>[] {
  //   const searchedInfo: Record<string, string>[] = [];
  //   const keys = Object.keys(selector);
  //   const elementHTML = domParser.parseFromString(HTML, 'text/html');
  //   keys.forEach((key) => {
  //     const nodeList = elementHTML.querySelectorAll(`${selector[key].selector}`)
  // as NodeListOf<HTMLAnchorElement>;
  //     console.log(selector[key].selector);
  //     console.log(selector[key].attr);

  //     nodeList.forEach((node, i)  => {
  //       let info = node[selector[key].attr] as string;
  //       console.log(info);

  //       // if (selector[key].subattr) {
  //       //   info = info[selector[key].subattr!];
  //       // }
  //       if (searchedInfo[i]) {
  //         searchedInfo[i][key] = info;
  //       } else {
  //         searchedInfo[i] = {};
  //         searchedInfo[i][key] = info;
  //       }
  //     });
  //   });
  //   return searchedInfo;
  // }

  async scrapURLs(urls: string[],
    selector: Record<string, string>,
    concurrentQueries: number = 10,
    sec: number = 10): Promise<INodeList[]> {
    if (this.compressStep < urls.length && !this.stop) {
      const res = concurrentQueries + this.compressStep;
      const temp: Promise<string>[] = [];
      for (let i = this.compressStep; i < res; i += 1) {
        if (i < urls.length) {
          temp.push(this.getHTML(urls[i]));
        }
      }
      const HTML = await Promise.all(temp);
      const searchedInfo = this.getNodeList(HTML.join('\n'), selector);
      this.compresedData.push(searchedInfo);
      this.compressStep = res;
      this.progress = (this.compressStep / urls.length) * 100;
      await this.timeout(sec);
      await this.scrapURLs(urls, selector, concurrentQueries, sec);
      console.warn(this.progress);
    }
    return this.compresedData;
  }

  // async scrapURLsFor(urls: string[],
  //   selector: ISelector,
  //   concurrentQueries: number = 10,
  //   sec: number = 5): Promise<Record<string, string>[]> {
  //   const res = concurrentQueries + this.compressStep;
  //   const temp: Promise<string>[] = [];
  //   for (let i = this.compressStep; i < res; i += 1) {
  //     if (i < urls.length) {
  //       temp.push(this.getHTML(urls[i]));
  //     }
  //   }
  //   const HTML = await Promise.all(temp);
  //   const searchedInfo = this.searchInfo(HTML.join('\n'), selector);
  //   this.compressStep = res;
  //   this.progress = (this.compressStep / urls.length) * 100;
  //   await this.timeout(sec);
  //   return searchedInfo;
  // }
}
