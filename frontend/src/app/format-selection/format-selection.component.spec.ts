import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatSelectionComponent } from './format-selection.component';

describe('FormatSelectionComponent', () => {
  let component: FormatSelectionComponent;
  let fixture: ComponentFixture<FormatSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormatSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormatSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
