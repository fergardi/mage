import { TestBed } from '@angular/core/testing';

import { DomService } from './dom.service';

describe('DomService', () => {
  let service: DomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DomService);
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });
});
