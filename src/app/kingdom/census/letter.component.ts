import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-letter',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.letter.name' | translate }}</h1>
    <div mat-dialog-content>
      <mat-list dense>
        <mat-list-item [ngClass]="kingdom.faction">
          <div mat-list-avatar matBadgePosition="above before">
            <img mat-list-avatar [src]="kingdom.join.image">
          </div>
          <div mat-line>{{ kingdom.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ kingdom.join.name | translate }}</div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form" autocomplete="off">
        <mat-form-field>
          <mat-label>{{ 'kingdom.letter.subject' | translate }}</mat-label>
          <input placeholder="{{ 'kingdom.letter.subject' | translate }}" matInput formControlName="subject">
          <mat-error>{{ 'kingdom.letter.invalid' | translate }}</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>{{ 'kingdom.letter.message' | translate }}</mat-label>
          <textarea placeholder="{{ 'kingdom.letter.message' | translate }}" matInput rows="5" formControlName="message"></textarea>
          <mat-error>{{ 'kingdom.letter.invalid' | translate }}</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.letter.close' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="!form.valid" (click)="sendLetter()">{{ 'kingdom.letter.send' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class LetterComponent implements OnInit {

  uid: string = null;
  form: FormGroup = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public kingdom: any,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<LetterComponent>,
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      subject: [null, [Validators.required]],
      message: [null, [Validators.required]],
    });
  }

  resetLetter(): void {
    this.form.reset();
  }

  sendLetter(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

}
