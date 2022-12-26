import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  url: string;
  constructor(route: ActivatedRoute) {
    let id = route.snapshot.paramMap.get('id');
    let tp = route.snapshot.paramMap.get('tp');
    if (!tp) {
      tp = 'page';
    }
    if (id) {
      if (tp === 'page') {
        this.url = 'http://127.0.0.1:16224/view/' + id;
      } else if (tp === 'doc') {
        this.url = 'http://127.0.0.1:16224/doc/' + id;
      } else {
        // err
        return;
      }
    } else {
      this.url = '#';
    }
  }

  ngOnInit(): void {
  }
}
