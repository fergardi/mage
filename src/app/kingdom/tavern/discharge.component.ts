import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-discharge',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.discharge.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.discharge.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="contract.level" matBadgePosition="above before">
            <img mat-list-avatar [src]="contract.join.image">
          </div>
          <div mat-line>{{ contract.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="contract.join.description | translate | icon:contract.join.skills:contract.join.categories:contract.join.families:contract.join.units:contract.join.resources:contract.join.spells:contract.adjacents:contract.opposites"></div>
          <div mat-list-avatar [matBadge]="0" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.discharge.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="discharge()" cdkFocusInitial>{{ 'kingdom.discharge.discharge' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
export class DischargeComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public contract: any,
    private dialogRef: MatDialogRef<DischargeComponent>,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  discharge(): void {
    this.dialogRef.close();
  }

}
