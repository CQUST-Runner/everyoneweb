import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlWithCopyBtnComponent } from './url-with-copy-btn.component';

describe('UrlWithCopyBtnComponent', () => {
  let component: UrlWithCopyBtnComponent;
  let fixture: ComponentFixture<UrlWithCopyBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UrlWithCopyBtnComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrlWithCopyBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
