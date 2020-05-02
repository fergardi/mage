import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncyclopediaComponent } from './encyclopedia.component';

describe('EncyclopediaComponent', () => {
  let component: EncyclopediaComponent;
  let fixture: ComponentFixture<EncyclopediaComponent>;

  beforeEach(async(() => {
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
