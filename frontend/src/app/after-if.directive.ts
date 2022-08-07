import { AfterContentInit, Directive, EventEmitter, Output } from '@angular/core';

// https://stackoverflow.com/a/44737636
@Directive({ selector: '[after-if]' })
export class AfterIfDirective implements AfterContentInit {
  @Output('after-if')
  public after: EventEmitter<void> = new EventEmitter<void>();

  public ngAfterContentInit(): void {
    // timeout helps prevent unexpected change errors
    setTimeout(() => this.after.next());
  }
}