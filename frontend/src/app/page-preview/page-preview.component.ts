import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeHtml, SafeStyle, SafeScript, SafeResourceUrl } from '@angular/platform-browser';

// https://stackoverflow.com/a/38079724
@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor(protected _sanitizer: DomSanitizer) { }

  transform(value: string): SafeResourceUrl {
    return this._sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
@Component({
  selector: 'app-page-preview',
  templateUrl: './page-preview.component.html',
  styleUrls: ['./page-preview.component.css']
})
export class PagePreviewComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public url: string, public sanitizer: DomSanitizer) {
    this.req = 'http://127.0.0.1:16224/preview/?url=' + encodeURIComponent(this.url);
  }

  req: string;
  ngOnInit(): void {
  }
}
