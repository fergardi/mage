import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should SHOW an ERROR NOTIFICATION', () => {
    service.error('test');
  });

  it('should SHOW a WARNING NOTIFICATION', () => {
    service.warning('test');
  });

  it('should SHOW a SUCCESS NOTIFICATION', () => {
    service.success('test');
  });

});
