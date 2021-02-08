import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DispelComponent } from './dispel.component';

describe('DispelComponent', () => {
  let component: DispelComponent;
  let fixture: ComponentFixture<DispelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DispelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
