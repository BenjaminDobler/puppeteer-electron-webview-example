import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { WebviewTag } from 'electron';
import { Page } from 'puppeteer';
import { WebviewPuppeteer } from './services/webview.puppeteer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  title = 'pup-renderer';

  @ViewChild('webview')
  webview: ElementRef<WebviewTag>;
  page: Page;
  electronWebview = new WebviewPuppeteer(9444);

  constructor() {
    this.electronWebview.connect();
  }

  async ngAfterViewInit() {
    this.page = await this.electronWebview.getPage(this.webview.nativeElement);
    await this.page.goto('https://www.spiegel.de');
    this.page.waitForNavigation();
  }

  async showImageCount() {
    const imageCount = await this.page.evaluate(() => {
      return document.querySelectorAll('img').length;
    });
    alert(imageCount);
  }


}
