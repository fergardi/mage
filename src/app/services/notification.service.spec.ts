import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SnackBarStub } from 'src/stubs';
import { of } from 'rxjs';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MatSnackBar, useValue: SnackBarStub },
      ],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should CREATE the INSTANCE', () => {
    expect(service).toBeTruthy();
  });

  it('should SHOW an ERROR notification', () => {
    spyOn(service, 'error').and.callThrough();
    spyOn(SnackBarStub, 'open').and.returnValue({ afterDismissed: () => of(null) });
    service.error('error');
    expect(service.error).toHaveBeenCalledWith('error');
    expect(SnackBarStub.open).toHaveBeenCalled();
  });

  it('should SHOW a WARNING notification', () => {
    spyOn(service, 'warning').and.callThrough();
    spyOn(SnackBarStub, 'open').and.returnValue({ afterDismissed: () => of(null) });
    service.warning('warning');
    expect(service.warning).toHaveBeenCalledWith('warning');
    expect(SnackBarStub.open).toHaveBeenCalled();
  });

  it('should SHOW a SUCCESS notification', () => {
    spyOn(service, 'success').and.callThrough();
    spyOn(SnackBarStub, 'open').and.returnValue({ afterDismissed: () => of(null) });
    service.success('success');
    expect(service.success).toHaveBeenCalledWith('success');
    expect(SnackBarStub.open).toHaveBeenCalled();
    service.success('success', { number: 0, string: 'test.test' });
    expect(service.success).toHaveBeenCalledWith('success', { number: '0', string: 'test.test' });
    expect(SnackBarStub.open).toHaveBeenCalled();
  });

});
