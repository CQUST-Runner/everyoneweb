import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HighlightService } from '../service/highlight.service';
import { LogService } from '../service/log.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit, AfterViewChecked, OnDestroy {

  constructor(private logService: LogService, private highlightService: HighlightService) { }

  @ViewChild('code') code: ElementRef = { nativeElement: {} };
  @ViewChild('pre') pre: ElementRef = { nativeElement: {} };

  timer: any;
  ngOnInit(): void {
    this.timer = setInterval(() => { this.fetchLog(); }, 1000);
  }

  highlighted = false;
  autoScroll = true;

  ngAfterViewChecked(): void {
    // if (!this.highlighted) {
    //   this.highlightService.highlightElement(this.code.nativeElement);
    //   this.highlighted = true;
    // }
    if (this.autoScroll &&!this.paused) {
      this.pre.nativeElement.scrollTop = this.pre.nativeElement.scrollHeight;
    }
  }
  fetchLog() {
    if (this.paused) {
      return;
    }
    this.code.nativeElement.innerHTML +=
      this.highlightService.highlight(['', ...this.logService.getLog()].join('\n'), 'log');
  }

  lastScroolTop = 0;
  id: any;

  tmpDisableAutoScroll(ev: Event) {
    return;
    if (this.lastScroolTop > this.pre.nativeElement.scrollTop && this.autoScroll) {
      this.autoScroll = false;
    }
    this.lastScroolTop = this.pre.nativeElement.scrollTop;
    if (this.id) {
      clearTimeout(this.id);
      this.id = undefined;
    }
    if (!this.autoScroll) {
      this.id = setTimeout(() => { this.autoScroll = true; this.id = undefined; }, 3000);
    }
  }
  paused=false;
  pauseLog(ev:Event) {
    this.paused=!this.paused;
  }
  ngOnDestroy(): void {
    clearInterval(this.timer)

  }
}
