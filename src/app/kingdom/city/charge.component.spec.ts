import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChargeComponent } from './charge.component';

describe('ChargeComponent', () => {
  let component: ChargeComponent;
  let fixture: ComponentFixture<ChargeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
