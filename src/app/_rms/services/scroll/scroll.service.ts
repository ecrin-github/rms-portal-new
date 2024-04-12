import { Injectable } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { fromEvent } from 'rxjs';

@Injectable()
export class ScrollService {

  scroll: any;
  urls: Array<String>;

  constructor(private router: Router) { }

  async handleScroll(role: any, urls: Array<String>) {
    /**
     * urls: urls where scroll event should be fired.
     */
    if (urls.includes(this.router.url)) {  // Not activating scroll on dashboard
      this.initScroll();
    }
    this.router.events.subscribe((ev) => {
      if (!!this.scroll) {
        if (ev instanceof NavigationEnd && urls.includes(ev.urlAfterRedirects) && this.scroll.closed) {
          this.initScroll();
        } else if (!this.scroll.closed && ev instanceof NavigationEnd && !(urls.includes(ev.urlAfterRedirects))) {
          this.unsubscribeScroll();
        }
      }
    });
  }

  async initScroll() {
    const sticky = document.getElementById('navbar').offsetTop;
    this.scroll = fromEvent(document, 'scroll').subscribe((ev) => {
      const navbar = document.getElementById('navbar');
      if (!!navbar) {
        if (window.scrollY >= sticky) {
          navbar.classList.add('sticky');
        } else {
          navbar.classList.remove('sticky');
        }
      }
    });
  }

  unsubscribeScroll() {
    if (!!this.scroll) {
      this.scroll.unsubscribe();
    }
  }
}
