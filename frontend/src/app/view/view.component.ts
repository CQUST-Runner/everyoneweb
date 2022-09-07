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
    if (id) {
      this.url = 'http://127.0.0.1:16224/view/' + id;
    } else {
      this.url = '#';
    }
  }

  ngOnInit(): void {
  }
}
