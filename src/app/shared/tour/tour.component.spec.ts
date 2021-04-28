import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TourComponent } from './tour.component';
import { TourService } from 'ngx-ui-tour-md-menu';
import { TourServiceStub } from 'src/stubs';

describe('TourComponent', () => {
  let component: TourComponent;
  let fixture: ComponentFixture<TourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TourComponent,
      ],
      providers: [
        { provide: TourService, useValue: TourServiceStub },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

});
