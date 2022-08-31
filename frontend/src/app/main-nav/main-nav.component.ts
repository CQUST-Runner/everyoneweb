import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
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

  constructor(public router: Router, private breakpointObserver: BreakpointObserver, private dialog: MatDialog, private toolbox: ToolBoxService) {
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

    const dialogRef = this.dialog.open(AboutComponent, { width: "40vw" });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      this.isAboutOpen = false;
    });

  }

  lastUrlComponent(): string {
    let position = this.router.url.lastIndexOf('/');
    if (position >= 0) {
      let last = this.router.url.substring(position + 1);
      return last;
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
