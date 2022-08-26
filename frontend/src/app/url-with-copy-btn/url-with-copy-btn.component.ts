import { Component, Input, OnInit } from '@angular/core';
import { ToolBoxService } from '../tool-box.service';

@Component({
  selector: 'app-url-with-copy-btn',
  templateUrl: './url-with-copy-btn.component.html',
  styleUrls: ['./url-with-copy-btn.component.css']
})
export class UrlWithCopyBtnComponent implements OnInit {

  constructor(private toolbox: ToolBoxService) { }

  ngOnInit(): void {
  }

  getDisplayName(): string {
    return this.displayName.length > 0 ? this.displayName : this.url;
  }

  onClick() {
    this.toolbox.openSnackBar('复制成功', 'OK');
  }
  @Input() url: string = "";
  @Input() displayName: string = "";
  @Input() clickable: boolean = false;
}
