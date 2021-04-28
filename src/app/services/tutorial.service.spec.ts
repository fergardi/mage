import { TestBed } from '@angular/core/testing';
import { TutorialService } from './tutorial.service';
import { TourService } from 'ngx-ui-tour-md-menu';
import { TourServiceStub } from 'src/stubs';

describe('TutorialService', () => {
  let service: TutorialService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TourService, useValue: TourServiceStub },
      ]
    });
    service = TestBed.inject(TutorialService);
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });

  it('should INITIALIZE the STEPS', () => {
    spyOn(TourServiceStub, 'initialize');
    service.initialize();
    expect(TourServiceStub.initialize).toHaveBeenCalled();
  });

  it('should START the TOUR from BEGINNING', () => {
    spyOn(TourServiceStub, 'start');
    service.start();
    expect(TourServiceStub.start).toHaveBeenCalled();
  });

  it('should START the TOUR from STEP', () => {
    spyOn(TourServiceStub, 'startAt');
    service.start('test');
    expect(TourServiceStub.startAt).toHaveBeenCalledWith('test');
  });

});
