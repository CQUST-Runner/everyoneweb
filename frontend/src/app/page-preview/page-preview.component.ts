import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
export class PagePreviewComponent implements OnInit, AfterViewInit {

  constructor(@Inject(MAT_DIALOG_DATA) public url: string, public sanitizer: DomSanitizer, private client: HttpClient, private toolbox: ToolBoxService) {
    this.req = 'http://' + window.location.hostname + ':16224/preview/?url=' + encodeURIComponent(this.url);
    this.title = `预览【${url}】`
  }

  isLoading = true;

  @ViewChild('iframe') iframe: ElementRef;

  title: string;
  load(ev: Event) {
    this.isLoading = false;
    if (window.location.port == '16224' && window.location.protocol == 'http:') {
      this.title = this.iframe.nativeElement.contentDocument.title;
      if (this.iframe.nativeElement.contentDocument.documentElement.innerText == 'preview loading error') {
        this.loadError = true;
      }
    }
  }
  loadError = false;
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
  ngAfterViewInit(): void {
    // https://stackoverflow.com/a/15880489
    let thisRef = this;
    this.iframe.nativeElement.onload = function (ev: Event) {
      thisRef.load(ev);
    }
  }
}
