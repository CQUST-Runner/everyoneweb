import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HighlightService } from '../service/highlight.service';
import { LogService } from '../service/log.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit, AfterViewChecked,OnDestroy {

  constructor(private logService: LogService,  private highlightService: HighlightService) { }

  @ViewChild('code') code: ElementRef = { nativeElement: {} };
  @ViewChild('pre') pre: ElementRef = { nativeElement: {} };

  timer :any;
  ngOnInit(): void {
    this.timer= setInterval(()=>{this.fetchLog();},1000);
  }

  highlighted = false;

  ngAfterViewChecked(): void {
    // if (!this.highlighted) {
    //   this.highlightService.highlightElement(this.code.nativeElement);
    //   this.highlighted = true;
    // }
    this.pre.nativeElement.scrollTop=this.pre.nativeElement.scrollHeight;
  }
  
  fetchLog() {
    
    this.code.nativeElement.innerHTML +=
      this.highlightService.highlight( ['',this.logService.getLog()].join('\n'), 'log');
}
  
  ngOnDestroy(): void {
    clearInterval(this.timer)
    
  }
}
