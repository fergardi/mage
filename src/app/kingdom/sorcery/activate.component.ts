import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

@Component({
  selector: 'app-activate',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.activate.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.activate.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="artifact.quantity" matBadgePosition="above before">
            <img mat-list-avatar [src]="artifact.join.image">
          </div>
          <div mat-line>{{ artifact.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="artifact.join.description | translate | icon:artifact.join.skills:artifact.join.categories:artifact.join.families:artifact.join.units:artifact.join.resources:artifact.join.spells"></div>
          <div mat-list-avatar [matBadge]="artifact.join.turns" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.activate.to' | translate }}</mat-label>
          <mat-select formControlName="to">
            <mat-option *ngFor="let kingdom of kingdoms" [value]="kingdom.id">{{ kingdom.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.activate.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="activate()" cdkFocusInitial>{{ 'kingdom.activate.activate' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
@UntilDestroy()
export class ActivateComponent implements OnInit {

  uid: string = null;
  form: FormGroup = null;
  kingdoms: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ActivateComponent>,
    @Inject(MAT_DIALOG_DATA) public artifact: any,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private angularFirestore: AngularFirestore,
    private store: Store,
  ) { }

  ngOnInit() {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    this.form = this.formBuilder.group({
      to: [0, [Validators.required]]
    });
    if (this.artifact.join.self) {
      this.angularFirestore.collection('kingdoms', ref => ref.where('id', '==', this.uid)).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(kingdoms => {
        this.kingdoms = kingdoms;
      });
    } else {
      this.angularFirestore.collection('kingdoms').valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(kingdoms => {
        this.kingdoms = kingdoms.filter(kingdom => kingdom.fid !== this.uid);
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  activate(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.to);
    } else {
      this.notificationService.error('kingdom.activate.error');
    }
  }

}
