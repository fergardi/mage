import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmporiumComponent } from './emporium.component';

describe('EmporiumComponent', () => {
  let component: EmporiumComponent;
  let fixture: ComponentFixture<EmporiumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmporiumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmporiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
