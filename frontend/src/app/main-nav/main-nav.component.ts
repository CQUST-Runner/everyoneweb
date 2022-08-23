import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { getConfig } from '../settings.model';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { AboutComponent } from '../about/about.component';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(public router: Router, private breakpointObserver: BreakpointObserver, private dialog: MatDialog) {
  }

  settings = getConfig();
  title: string;
  onActivated(ev: any) {
    this.title = ev.title || "";
  }

  openAbout(ev: Event, drawer: MatSidenav) {
    ev.preventDefault();
    // drawer.close();
    this.dialog.open(AboutComponent, { width: "40vw" });
  }

  lastUrlComponent(): string {
    let position = this.router.url.lastIndexOf('/');
    if (position >= 0) {
      let last = this.router.url.substring(position + 1);
      return last;
    }
    return '#';
  }
}
