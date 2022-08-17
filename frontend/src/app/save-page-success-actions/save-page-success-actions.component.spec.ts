import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavePageSuccessActionsComponent } from './save-page-success-actions.component';

describe('SavePageSuccessActionsComponent', () => {
  let component: SavePageSuccessActionsComponent;
  let fixture: ComponentFixture<SavePageSuccessActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavePageSuccessActionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavePageSuccessActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
