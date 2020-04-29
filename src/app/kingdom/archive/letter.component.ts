import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/firestore';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@Component({
  selector: 'app-letter',
  template: `
    <ng-container *ngIf="data.fid; else create">
      <h1 mat-dialog-title>{{ data.subject }}</h1>
      <h3 mat-dialog-title>{{ data.join ? data.join.name : data.from }}</h3>
      <div mat-dialog-content>
        <p>{{ data.message }}</p>
      </div>
      <div mat-dialog-actions>
        <button mat-button (click)="close()">{{ 'kingdom.archive-letter.close' | translate }}</button>
      </div>
    </ng-container>
    <ng-template #create>
      <h1 mat-dialog-title>{{ 'kingdom.archive-letter.create' | translate }}</h1>
      <mat-form-field>
        <mat-label>{{ 'kingdom.archive-letter.subject' | translate }}</mat-label>
        <input placeholder="{{ 'kingdom.archive-letter.subject' | translate }}" matInput [(ngModel)]="data.subject" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ 'kingdom.archive-letter.to' | translate }}</mat-label>
        <mat-select [(ngModel)]="data.to">
          <mat-option *ngFor="let kingdom of kingdoms" [value]="kingdom.id">{{ kingdom.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>{{ 'kingdom.archive-letter.message' | translate }}</mat-label>
        <textarea placeholder="{{ 'kingdom.archive-letter.message' | translate }}" matInput rows="5" [(ngModel)]="data.message"></textarea>
      </mat-form-field>
      <div mat-dialog-actions>
        <button mat-button (click)="send()">{{ 'kingdom.archive-letter.send' | translate }}</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
@UntilDestroy()
export class LetterComponent implements OnInit {

  kingdoms: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<LetterComponent>,
    private angularFirestore: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.angularFirestore.collection('kingdoms').valueChanges().pipe(untilDestroyed(this)).subscribe(kingdoms => {
      this.kingdoms = kingdoms;
    });
  }

  close() {
    this.dialogRef.close();
  }

  send() {
    this.dialogRef.close(this.data);
  }

}
