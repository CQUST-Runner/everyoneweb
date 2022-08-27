import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeHtml, SafeStyle, SafeScript, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Observer } from 'rxjs';
import { ToolBoxService } from '../tool-box.service';

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

  constructor(@Inject(MAT_DIALOG_DATA) public url: string, public sanitizer: DomSanitizer, private client: HttpClient, private toolbox: ToolBoxService) {
    this.req = 'http://127.0.0.1:16224/preview/?url=' + encodeURIComponent(this.url);
    this.title = `预览【${url}】`
  }

  isLoading = true;

  @ViewChild('iframe') iframe: ElementRef;

  title: string;
  eventCount = 0;
  load(ev: Event) {
    this.eventCount++;
    if (this.eventCount == 2) {
      this.isLoading = false;
      if (window.location.port == '16224' && window.location.host == '127.0.0.1' && window.location.protocol == 'http') {
        this.title = this.iframe.nativeElement.contentDocument.title;
      }
    }
  }

  cacheDeleted = false;
  delPreview() {
    this.isLoading = true;
    let thisRef = this;
    this.client.delete(this.req).subscribe({
      complete() {
        thisRef.toolbox.openSnackBar('删除成功', 'OK');
        thisRef.cacheDeleted = true;
        thisRef.isLoading = false;
      },
      error(err) {
        thisRef.toolbox.openSnackBar('删除失败', 'OK');
        thisRef.isLoading = false;
      },
    } as Observer<Object>);
  }
  req: string;
  ngOnInit(): void {
  }
}
