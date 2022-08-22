import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-scroll-trigger',
  templateUrl: './scroll-trigger.component.html',
  styleUrls: ['./scroll-trigger.component.css']
})
export class ScrollTriggerComponent implements OnInit {

  constructor() { }

  @Output() scroll: EventEmitter<number> = new EventEmitter();
  @Input() direction: string;

  ngOnInit(): void {
  }

  speed: number = 0;
  move(ev: MouseEvent) {
    if (this.direction == 'up') {
      this.speed = -(10 - ev.offsetY);
    } else if (this.direction == 'down') {
      this.speed = ev.offsetY;
    }
  }

  timer: any;
  interval: any;
  enter() {
    // console.log('enter');
    if (this.timer) {
      return;
    }
    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (this.interval) {
        return;
      }
      this.interval = setInterval(() => {
        this.scroll.next(this.speed);
      }, 20);
    }, 500)
  }

  leave() {
    // console.log('leave');
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
