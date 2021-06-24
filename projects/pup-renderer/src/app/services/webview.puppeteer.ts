import { remote, WebviewTag } from 'electron';
import { Browser, Page, Target } from 'puppeteer';
import * as puppeteer from 'puppeteer-core';

export class WebviewPuppeteer {
  browser: Browser;

  curentId = 0;

  constructor(private port: number) { }

  async connect() {
    const port = 9444;
    const res = await fetch(`http://127.0.0.1:${port}/json/version`);
    const json = await res.json();

    this.browser = await puppeteer.connect({
      browserWSEndpoint: json.webSocketDebuggerUrl,
      defaultViewport: null,
    });
  }

  waitForReady(webview: WebviewTag): Promise<WebviewTag> {
    console.log('await ready ');
    return new Promise((resolve) => {
      webview.addEventListener('dom-ready', () => {

        console.log('dom ready ');
        resolve(webview);
      })

    })

  }

  async getPage(webview: WebviewTag): Promise<Page> {
    await this.waitForReady(webview);
    const webContents = remote.webContents.fromId(webview.getWebContentsId());
    const id = `WEBVIEW_PUPPETEER_ID_${this.curentId}`;
    await webContents.executeJavaScript(`window.puppeteer = "${id}";`);
    const target = await this.browser.targets();
    const webviewTargets: Target[] = target.filter(
      (t: any) => t.type() === 'webview'
    );
    const pages = await Promise.all(webviewTargets.map((t) => t.page()));
    const guids = await Promise.all(
      pages.map((testPage) => testPage.evaluate('window.puppeteer'))
    );

    const index = guids.findIndex((testGuid) => testGuid === id);
    await webContents.executeJavaScript('delete window.puppeteer');
    const page = pages[index];
    if (!page) {
      throw new Error(
        'Unable to find puppeteer Page from BrowserWindow.'
      );
    }
    this.curentId++;
    return page;
  }
}
