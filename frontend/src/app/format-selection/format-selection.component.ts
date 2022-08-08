import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { enumValues } from '../common';
import { PageType } from '../page.model';

interface TypeInfo {
  tp: PageType
  displayName: string
}

@Component({
  selector: 'app-format-selection',
  templateUrl: './format-selection.component.html',
  styleUrls: ['./format-selection.component.css']
})
export class FormatSelectionComponent implements OnInit {

  selected: PageType;

  mapDisplayName(t: PageType): string {
    switch (t) {
      case PageType.SinglePage: return '单文件HTML';
      case PageType.HtmlAssets: return 'HTML+资产文件夹';
      case PageType.PDF: return 'PDF';
      default: return 'unknown';
    }
  }
  
  infos: TypeInfo[];

  constructor() {
    this.infos = enumValues(PageType).map(x => { return { tp: x, displayName: this.mapDisplayName(x) } });
    if (this.infos.length > 0) {
      this.selected = this.infos[0].tp;
    }
  }

  ngOnInit(): void {
  }
}
