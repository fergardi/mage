import { TestBed } from '@angular/core/testing';
import { DomService } from './dom.service';

describe('DomService', () => {
  let service: DomService;
  let el: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DomService);
    el = document.createElement('div');
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });

  it('should SCROLL the VIEW', () => {
    spyOn(el, 'scrollIntoView');
    service.scrollToElement(el);
    expect(el.scrollIntoView).toHaveBeenCalled();
  });

  it('should SCROLL to TOP', () => {
    spyOn(el, 'scroll');
    service.scrollToTop(el);
    expect(el.scroll).toHaveBeenCalledWith(0, 0);
    spyOn(window, 'scroll');
    service.scrollToTop();
    expect(window.scroll).toHaveBeenCalledWith(0, 0);
  });
});
