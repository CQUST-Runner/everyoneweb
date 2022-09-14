import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, ActivatedRouteSnapshot, BaseRouteReuseStrategy, NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AboutComponent } from '../about/about.component';
import { AppRouterService } from '../app-router.service';
import { getConfig } from '../settings.model';
import { ToolBoxService } from '../tool-box.service';

class MyRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (future.children.length > 0 && future.children[0].url.length > 0 &&
      future.children[0].url[0].path == 'library') {
      return false;
    }
    return super.shouldReuseRoute(future, curr);
  }
}

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

  constructor(public router: Router, public route: ActivatedRoute, private breakpointObserver: BreakpointObserver, private dialog: MatDialog, private toolbox: ToolBoxService, private routerService: AppRouterService) {
    this.routerService.events.subscribe(x => {
      if (x instanceof NavigationEnd) {
        this.root = this.routerService.currentTab();
      }
    });
    this.router.onSameUrlNavigation = "reload";
    this.router.routeReuseStrategy = new MyRouteReuseStrategy();
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

  darkMode: boolean = false;

  toggleDarkMode(ev: Event) {
    ev.preventDefault();
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      this.toolbox.openSnackBar("敬请期待", "OK", { duration: 1000 });
    }
  }
}
