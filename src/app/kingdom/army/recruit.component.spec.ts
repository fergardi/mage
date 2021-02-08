import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecruitComponent } from './recruit.component';

describe('RecruitComponent', () => {
  let component: RecruitComponent;
  let fixture: ComponentFixture<RecruitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecruitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecruitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
