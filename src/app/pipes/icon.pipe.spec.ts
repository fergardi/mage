import { IconPipe } from './icon.pipe';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { TestBed, waitForAsync } from '@angular/core/testing';

describe('IconPipe', () => {
  let domSanitizer: DomSanitizer;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule],
    });
  }));

  beforeEach(() => {
    domSanitizer = TestBed.inject(DomSanitizer);
  });

  it('should CREATE the INSTANCE', () => {
    const pipe = new IconPipe(domSanitizer, null);
    expect(pipe).toBeTruthy();
  });
});
