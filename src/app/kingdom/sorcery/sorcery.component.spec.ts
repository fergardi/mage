import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SorceryComponent } from './sorcery.component';

describe('SorceryComponent', () => {
  let component: SorceryComponent;
  let fixture: ComponentFixture<SorceryComponent>;

  beforeEach(waitForAsync(() => {
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
