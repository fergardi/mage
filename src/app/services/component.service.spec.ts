import { TestBed } from '@angular/core/testing';

import { ComponentService } from './component.service';

describe('ComponentService', () => {
  let service: ComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentService);
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });

});
