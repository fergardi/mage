import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

@Component({
  selector: 'app-conjure',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.conjure.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.conjure.description' | translate }}</p>
      <mat-list dense>
        <mat-list-item>
          <div mat-list-avatar [matBadge]="charm.quantity" matBadgePosition="above before">
            <img mat-list-avatar [src]="charm.join.image">
          </div>
          <div mat-line>{{ charm.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" [innerHTML]="charm.join.description | translate | icon:charm.join.skills:charm.join.categories:charm.join.families:charm.join.units:charm.join.resources:charm.join.spells"></div>
          <div mat-list-avatar [matBadge]="charm.join.turns" matBadgePosition="above after">
            <img mat-list-avatar src="/assets/images/resources/turn.png">
          </div>
        </mat-list-item>
      </mat-list>
      <form [formGroup]="form">
        <mat-form-field>
          <mat-label>{{ 'kingdom.conjure.to' | translate }}</mat-label>
          <mat-select formControlName="to">
            <mat-option *ngFor="let kingdom of kingdoms" [value]="kingdom.id">{{ kingdom.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="close()">{{ 'kingdom.conjure.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="conjure()" cdkFocusInitial>{{ 'kingdom.conjure.conjure' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `]
})
@UntilDestroy()
export class ConjureComponent implements OnInit {

  uid: string = null;
  form: FormGroup = null;
  kingdoms: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ConjureComponent>,
    @Inject(MAT_DIALOG_DATA) public charm: any,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private angularFirestore: AngularFirestore,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.uid = this.store.selectSnapshot(AuthState.getUserUID);
    if (this.charm.join.self) {
      this.angularFirestore.collection('kingdoms', ref => ref.where('id', '==', this.uid)).valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(kingdoms => {
        this.kingdoms = kingdoms;
      });
    } else {
      this.angularFirestore.collection('kingdoms').valueChanges({ idField: 'fid' }).pipe(untilDestroyed(this)).subscribe(kingdoms => {
        this.kingdoms = kingdoms.filter(kingdom => kingdom.fid !== this.uid);
      });
    }
    this.form = this.formBuilder.group({
      to: [0, [Validators.required]]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  conjure(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.to);
    } else {
      this.notificationService.error('kingdom.conjure.error');
    }
  }

}
