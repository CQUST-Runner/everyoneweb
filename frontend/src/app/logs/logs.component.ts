import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { HighlightService } from '../service/highlight.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit, AfterViewChecked {

  constructor(private highlightService: HighlightService) { }

  ngOnInit(): void {
  }
  
  ngAfterViewChecked(): void {
    this.highlightService.highlightAll();
  }
}
