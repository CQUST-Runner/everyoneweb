import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { delay, Subscription } from 'rxjs';
import { AppRouterService } from '../app-router.service';
import { HighlightService } from '../service/highlight.service';
import { LogService } from '../service/log.service';
import { RealLogService } from '../service/reallog.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit, AfterViewChecked, OnDestroy {


  title = '日志';

  constructor(private logService: LogService, private realLogService: RealLogService, private highlightService: HighlightService, private routerService: AppRouterService) {

    this.routerService.events.subscribe(x => {
      if (x instanceof NavigationEnd) {
        // console.log("current tab " + routerService.currentTab());
        if (routerService.currentTab() == "logs") {
          if (this.subscription) {
            return;
          }
          this.subscription = this.realLogService.getLog().pipe(delay(500)).subscribe(x => {
            this.filename = x.filename;
            this.code.nativeElement.innerHTML +=
              this.highlightService.highlight(['', ...(x.lines || [])].join('\n'), 'log');
          });
        } else {
          if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
          }
        }
      }
    })

  }

  @ViewChild('code') code: ElementRef = { nativeElement: {} };
  @ViewChild('pre') pre: ElementRef = { nativeElement: {} };

  timer: any;
  filename: string;
  subscription: Subscription | undefined = undefined;
  ngOnInit(): void {
    // this.timer = setInterval(() => { this.fetchLog(); }, 1000);

  }

  highlighted = false;
  autoScroll = true;

  ngAfterViewChecked(): void {
    // if (!this.highlighted) {
    //   this.highlightService.highlightElement(this.code.nativeElement);
    //   this.highlighted = true;
    // }
    if (this.autoScroll && !this.paused) {
      this.pre.nativeElement.scrollTop = this.pre.nativeElement.scrollHeight;
    }
  }
  fetchLog() {
    if (this.paused) {
      return;
    }
    // this.code.nativeElement.innerHTML +=
    //   this.highlightService.highlight(['', ...this.logService.getLog()].join('\n'), 'log');



  }

  lastScrollTop = 0;
  id: any;

  tmpDisableAutoScroll(ev: Event) {
    if (this.lastScrollTop > this.pre.nativeElement.scrollTop && this.autoScroll) {
      this.autoScroll = false;
    }
    this.lastScrollTop = this.pre.nativeElement.scrollTop;
    if (this.id) {
      clearTimeout(this.id);
      this.id = undefined;
    }
    if (!this.autoScroll) {
      this.id = setTimeout(() => { this.autoScroll = true; this.id = undefined; }, 3000);
    }
  }
  paused = false;
  pauseLog(ev: Event) {
    this.paused = !this.paused;
  }
  ngOnDestroy(): void {
    clearInterval(this.timer)
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }
}
