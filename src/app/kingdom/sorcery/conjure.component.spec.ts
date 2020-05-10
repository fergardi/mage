import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConjureComponent } from './conjure.component';

describe('ConjureComponent', () => {
  let component: ConjureComponent;
  let fixture: ComponentFixture<ConjureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConjureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConjureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
