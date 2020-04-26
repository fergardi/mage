import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SorceryComponent } from './sorcery.component';

describe('SorceryComponent', () => {
  let component: SorceryComponent;
  let fixture: ComponentFixture<SorceryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SorceryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SorceryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
