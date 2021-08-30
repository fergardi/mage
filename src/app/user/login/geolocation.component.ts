import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-geolocation',
  template: `
    <div class="dialog-title">
      <h1 mat-dialog-title>{{ 'user.geolocation.name' | translate }}</h1>
    </div>
    <div mat-dialog-content [innerHTML]="'user.geolocation.description' | translate"></div>
    <div mat-dialog-actions>
      <button mat-raised-button color="primary" (click)="close()" cdkFocusInitial>{{ 'user.geolocation.close' | translate }}</button>
    </div>
  `,
  styles: [
  ],
})
export class GeolocationComponent {

  constructor(
    private dialogRef: MatDialogRef<GeolocationComponent>,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

}
