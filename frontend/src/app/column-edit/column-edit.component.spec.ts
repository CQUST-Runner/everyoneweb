import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnEditComponent } from './column-edit.component';

describe('ColumnEditComponent', () => {
  let component: ColumnEditComponent;
  let fixture: ComponentFixture<ColumnEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
