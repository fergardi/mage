import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-research',
  template: `
    <h1 mat-dialog-title>Board</h1>
    <div mat-dialog-content>
      <p>hola</p>
      <mat-form-field>
        <input placeholder="title" matInput [(ngModel)]="data.turns" />
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">Cancel</button>
      <button mat-button [mat-dialog-close]="data.turns" cdkFocusInitial>Create</button>
    </div>
  `,
  styles: []
})
export class ResearchComponent {

  constructor(
    public dialogRef: MatDialogRef<ResearchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

}
