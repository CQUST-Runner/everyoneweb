import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AboutComponent>,) { }

  ngOnInit(): void {
  }

  markdown = `
  EveryoneWeb是一款：

- **网页离线软件**——将互联网有价值的内容“离线”到本地，这些内容将在所有设备可用，助力构建个人知识库；
- **“稍后阅读”软件**——待阅读的文章太多？加入待读列表，规划“计划阅读”时间，还不用担心内容过期！
- **跨浏览器的书签管理软件**——同时使用多个浏览器，书签却无法共享？使用EveryoneWeb，在一个地方管理所有书签。
  `

}
