import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionSnackBarComponentComponent } from './action-snack-bar-component.component';

describe('ActionSnackBarComponentComponent', () => {
  let component: ActionSnackBarComponentComponent;
  let fixture: ComponentFixture<ActionSnackBarComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionSnackBarComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionSnackBarComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
