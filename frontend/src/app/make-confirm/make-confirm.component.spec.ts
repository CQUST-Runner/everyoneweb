import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeConfirmComponent } from './make-confirm.component';

describe('MakeConfirmComponent', () => {
  let component: MakeConfirmComponent;
  let fixture: ComponentFixture<MakeConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MakeConfirmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakeConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
