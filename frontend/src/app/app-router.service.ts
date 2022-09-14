import { Injectable } from '@angular/core';
import { PRIMARY_OUTLET, Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppRouterService {
  constructor(private router: Router) {
    let thisRef = this;
    router.events.subscribe({
      next(value) {
        thisRef.events.next(value as unknown as Event);
      },
      complete() {
        thisRef.events.complete();
      },
      error(err) {
        thisRef.events.error(err);
      },
    });
  }

  events: Subject<Event> = new Subject();

  currentTab(): string {
    // console.log('current url is ' + this.router.url);
    const tree = this.router.parseUrl(this.router.url);
    const g = tree.root.children[PRIMARY_OUTLET];
    if (g && g.segments.length > 0) {
      return g.segments[0].path;
    }
    return '#';
  }


}
