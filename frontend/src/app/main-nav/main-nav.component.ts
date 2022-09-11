import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AboutComponent } from '../about/about.component';
import { getConfig } from '../settings.model';
import { ToolBoxService } from '../tool-box.service';

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

  constructor(public router: Router, public route: ActivatedRoute, private breakpointObserver: BreakpointObserver, private dialog: MatDialog, private toolbox: ToolBoxService) {
    this.router.events.subscribe(x => {
      if (x instanceof NavigationEnd) {
        this.root = this.urlRoot();
      }
    })
  }

  settings = getConfig();
  title: string;
  onActivated(ev: any) {
    this.title = ev.title || "";
  }

  isAboutOpen: boolean = false;
  openAbout(ev: Event, drawer: MatSidenav) {
    ev.preventDefault();
    // drawer.close();
    this.isAboutOpen = true;

    const dialogRef = this.dialog.open(AboutComponent, { width: "50vw" });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      this.isAboutOpen = false;
    });

  }

  refreshView() {
    this.router.navigateByUrl(this.router.url);
  }

  root: string = "";

  urlRoot(): string {
    // console.log('current url is ' + this.router.url);
    const tree = this.router.parseUrl(this.router.url);
    const g = tree.root.children[PRIMARY_OUTLET];
    if (g && g.segments.length > 0) {
      return g.segments[0].path;
    }
    return '#';
  }

  darkMode: boolean = false;

  toggleDarkMode(ev: Event) {
    ev.preventDefault();
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      this.toolbox.openSnackBar("敬请期待", "OK", { duration: 1000 });
    }
  }
}
