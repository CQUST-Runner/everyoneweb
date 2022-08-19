import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-url-with-copy-btn',
  templateUrl: './url-with-copy-btn.component.html',
  styleUrls: ['./url-with-copy-btn.component.css']
})
export class UrlWithCopyBtnComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  getDisplayName(): string {
    return this.displayName.length > 0 ? this.displayName : this.url;
  }
  @Input() url: string = "";
  @Input() displayName: string = "";
  @Input() clickable: boolean = false;
}
