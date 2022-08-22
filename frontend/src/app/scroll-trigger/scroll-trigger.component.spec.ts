import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollTriggerComponent } from './scroll-trigger.component';

describe('ScrollTriggerComponent', () => {
  let component: ScrollTriggerComponent;
  let fixture: ComponentFixture<ScrollTriggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrollTriggerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrollTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
