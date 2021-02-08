import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TomeComponent } from './tome.component';

describe('TomeComponent', () => {
  let component: TomeComponent;
  let fixture: ComponentFixture<TomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
