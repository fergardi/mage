import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EncyclopediaComponent } from './encyclopedia.component';

describe('EncyclopediaComponent', () => {
  let component: EncyclopediaComponent;
  let fixture: ComponentFixture<EncyclopediaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EncyclopediaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncyclopediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
