import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabToolBarComponent } from './tab-tool-bar.component';

describe('TabToolBarComponent', () => {
  let component: TabToolBarComponent;
  let fixture: ComponentFixture<TabToolBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabToolBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabToolBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
