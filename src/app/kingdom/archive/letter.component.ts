import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/firestore';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@Component({
  selector: 'app-letter',
  template: `
    <h1 mat-dialog-title>{{ data.subject }}</h1>
    <h3 mat-dialog-title>{{ data.join ? data.join.name : data.from }}</h3>
    <div mat-dialog-content>
      <p>{{ data.message }}</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.letter.close' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
@UntilDestroy()
export class LetterComponent {

  constructor(
    public dialogRef: MatDialogRef<LetterComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  close() {
    this.dialogRef.close();
  }

}
