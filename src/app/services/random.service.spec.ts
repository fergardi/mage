import { TestBed } from '@angular/core/testing';
import { RandomService } from './random.service';

describe('RandomService', () => {
  let service: RandomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RandomService);
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });

  it('should NAME the KINGDOM', () => {
    expect(service.kingdom()).toBeInstanceOf(String);
  });

  it('should NAME the HERO', () => {
    expect(service.hero()).toBeInstanceOf(String);
  });

});
