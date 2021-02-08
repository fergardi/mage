import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DischargeComponent } from './discharge.component';

describe('DischargeComponent', () => {
  let component: DischargeComponent;
  let fixture: ComponentFixture<DischargeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DischargeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DischargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
