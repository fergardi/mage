import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DisbandComponent } from './disband.component';

describe('DisbandComponent', () => {
  let component: DisbandComponent;
  let fixture: ComponentFixture<DisbandComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DisbandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisbandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
