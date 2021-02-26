import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LetterComponent } from './letter.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogRefStub } from 'src/stubs';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LetterComponent', () => {
  let component: LetterComponent;
  let fixture: ComponentFixture<LetterComponent>;
  const kingdom = {
    join: {
      image: '',
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
      ],
      declarations: [
        LetterComponent,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: kingdom },
        { provide: MatDialogRef, useValue: DialogRefStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
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

  it('should CREATE', () => {
    expect(component).toBeTruthy();
  });

  it('should SEND the letter', () => {
    component.form.patchValue({
      subject: 'test',
      message: 'test',
    });
    component.form.updateValueAndValidity();
    component.sendLetter();
    expect(component.form.valid).toBeTruthy();
  });

  it('should NOT SEND the letter', () => {
    component.form.patchValue({
      subject: null,
      message: null,
    });
    component.form.updateValueAndValidity();
    component.sendLetter();
    expect(component.form.valid).toBeFalsy();
  });

  it('should RESET the letter', () => {
    component.form.patchValue({
      subject: 'test',
      message: 'test',
    });
    component.form.updateValueAndValidity();
    expect(component.form.valid).toBeTruthy();
    component.resetLetter();
    component.form.updateValueAndValidity();
    expect(component.form.valid).toBeFalsy();
  });

});
