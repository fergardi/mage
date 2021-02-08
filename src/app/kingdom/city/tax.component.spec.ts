import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxComponent } from './tax.component';

describe('TaxComponent', () => {
  let component: TaxComponent;
  let fixture: ComponentFixture<TaxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
