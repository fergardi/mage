import { ComponentFixture, TestBed, waitForAsync, async } from '@angular/core/testing';
import { LetterComponent } from './letter.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogRefStub, NotificationServiceStub, ApiServiceStub, StoreStub } from 'src/stubs';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule } from '@angular/material/list';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';

describe('LetterComponent', () => {
  let component: LetterComponent;
  let fixture: ComponentFixture<LetterComponent>;
  const kingdom = {
    fid: 'fid',
    faction: {
      id: 'black',
    },
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatButtonModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatListModule,
      ],
      declarations: [
        LetterComponent,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: kingdom },
        { provide: MatDialogRef, useValue: DialogRefStub },
        { provide: NotificationService, useValue: NotificationServiceStub },
        { provide: ApiService, useValue: ApiServiceStub },
        { provide: Store, useValue: StoreStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LetterComponent);
    (fixture.nativeElement as HTMLDivElement).classList.add('mat-dialog-container');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should CREATE the INSTANCE', () => {
    expect(component).toBeTruthy();
  });

  it('should SEND the LETTER', async () => {
    component.form.patchValue({
      subject: 'test',
      message: 'test',
    });
    component.form.updateValueAndValidity();
    expect(component.form.valid).toBeTruthy();
    spyOn(ApiServiceStub, 'sendLetter');
    await component.send();
    expect(ApiServiceStub.sendLetter).toHaveBeenCalledWith('fid', 'test', 'test', 'uid');
  });

  it('should SEND the LETTER and CATCH errors', async () => {
    component.form.patchValue({
      subject: 'test',
      message: 'test',
    });
    component.form.updateValueAndValidity();
    expect(component.form.valid).toBeTruthy();
    spyOn(ApiServiceStub, 'sendLetter').and.throwError(new Error('test'));
    await component.send();
    expect(ApiServiceStub.sendLetter).toThrowError('test');
  });

  it('should NOT SEND the LETTER', async () => {
    component.form.patchValue({
      subject: null,
      message: null,
    });
    component.form.updateValueAndValidity();
    expect(component.form.valid).toBeFalsy();
    spyOn(ApiServiceStub, 'sendLetter');
    await component.send();
    expect(ApiServiceStub.sendLetter).not.toHaveBeenCalled();
  });

  it('should RESET the letter', () => {
    component.form.patchValue({
      subject: 'test',
      message: 'test',
    });
    component.form.updateValueAndValidity();
    expect(component.form.valid).toBeTruthy();
    component.reset();
    component.form.updateValueAndValidity();
    expect(component.form.valid).toBeFalsy();
  });

});
