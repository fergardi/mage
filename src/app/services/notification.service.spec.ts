import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
      providers: [
        MatSnackBarModule,
      ]
    });
    service = TestBed.inject(NotificationService);
    snackBar = TestBed.inject(MatSnackBar);
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });

  it('should SHOW an ERROR NOTIFICATION', () => {
    const serviceSpy = spyOn(service, 'error').and.callThrough();
    const snackSpy = spyOn(snackBar, 'open');
    service.error('error');
    expect(serviceSpy).toHaveBeenCalledWith('error');
    expect(snackSpy).toHaveBeenCalled();
  });

  it('should SHOW a WARNING NOTIFICATION', () => {
    const serviceSpy = spyOn(service, 'warning').and.callThrough();
    const snackSpy = spyOn(snackBar, 'open');
    service.warning('warning');
    expect(serviceSpy).toHaveBeenCalledWith('warning');
    expect(snackSpy).toHaveBeenCalled();
  });

  it('should SHOW a SUCCESS NOTIFICATION', () => {
    const serviceSpy = spyOn(service, 'success').and.callThrough();
    const snackSpy = spyOn(snackBar, 'open');
    service.success('success');
    expect(serviceSpy).toHaveBeenCalledWith('success');
    expect(snackSpy).toHaveBeenCalled();
    service.success('success', { number: 0, string: 'test.test' });
    expect(serviceSpy).toHaveBeenCalledWith('success', { number: '0', string: 'test.test' });
    expect(snackSpy).toHaveBeenCalled();
  });

});
