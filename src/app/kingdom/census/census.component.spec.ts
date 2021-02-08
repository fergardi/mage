import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CensusComponent } from './census.component';

describe('CensusComponent', () => {
  let component: CensusComponent;
  let fixture: ComponentFixture<CensusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CensusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CensusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
