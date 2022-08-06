import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageInfoDialogComponent } from './page-info-dialog.component';

describe('PageInfoDialogComponent', () => {
  let component: PageInfoDialogComponent;
  let fixture: ComponentFixture<PageInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageInfoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
