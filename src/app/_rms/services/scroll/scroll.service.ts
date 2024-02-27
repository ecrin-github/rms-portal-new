import { Injectable } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { fromEvent } from 'rxjs';

@Injectable()
export class ScrollService {

  scroll: any;
  urls: Array<String>;

  constructor() { }

  async handleScroll(router: Router, role: any, urls: Array<String>) {
    /**
     * urls: urls where scroll event should be fired.
     */
    if (urls.includes(router.url)) {  // Not activating scroll on dashboard
      this.initScroll(urls);
    }
    router.events.subscribe((ev) => {
      if (!!this.scroll) {
        if (ev instanceof NavigationEnd && urls.includes(ev.urlAfterRedirects) && this.scroll.closed) {
          this.initScroll(urls);
        } else if (!this.scroll.closed && ev instanceof NavigationEnd && !(urls.includes(ev.urlAfterRedirects))) {
          this.unsubscribeScroll();
        }
      }
    });
  }

  async initScroll(urls: Array<String>) {
    this.scroll = fromEvent(document, 'scroll').subscribe((ev) => {
      const navbar = document.getElementById('navbar');
      if (!!navbar) {
        const sticky = navbar.offsetTop;
        if (window.scrollY >= sticky) {
          navbar.classList.add('sticky');
        } else {
          navbar.classList.remove('sticky');
        }
      }
    });
  }

  unsubscribeScroll() {
    this.scroll.unsubscribe();
  }
}
