import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralInputDialogComponent } from './general-input-dialog.component';

describe('GeneralInputDialogComponent', () => {
  let component: GeneralInputDialogComponent;
  let fixture: ComponentFixture<GeneralInputDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralInputDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
