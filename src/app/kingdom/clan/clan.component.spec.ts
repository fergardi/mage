import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClanComponent } from './clan.component';

describe('ClanComponent', () => {
  let component: ClanComponent;
  let fixture: ComponentFixture<ClanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
