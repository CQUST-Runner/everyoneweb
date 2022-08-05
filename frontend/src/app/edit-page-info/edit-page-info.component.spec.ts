import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPageInfoComponent } from './edit-page-info.component';

describe('EditPageInfoComponent', () => {
  let component: EditPageInfoComponent;
  let fixture: ComponentFixture<EditPageInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPageInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPageInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
