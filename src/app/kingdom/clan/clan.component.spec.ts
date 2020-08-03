import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClanComponent } from './clan.component';

describe('ClanComponent', () => {
  let component: ClanComponent;
  let fixture: ComponentFixture<ClanComponent>;

  beforeEach(async(() => {
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
