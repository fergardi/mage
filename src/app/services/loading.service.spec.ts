import { TestBed } from '@angular/core/testing';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });

  it('should set LOADING state', () => {
    expect(service.loading).toBe(false);
    service.startLoading();
    expect(service.loading).toBe(true);
    service.stopLoading();
    expect(service.loading).toBe(false);
  });

});
