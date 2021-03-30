import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoadingService } from 'src/app/services/loading.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

@Component({
  selector: 'app-letter',
  template: `
    <h1 mat-dialog-title>{{ 'kingdom.letter.name' | translate }}</h1>
    <div mat-dialog-content>
      <p>{{ 'kingdom.letter.description' | translate }}</p>
      <div matSubheader>{{ 'kingdom.letter.to' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="[kingdom.faction.id, kingdom.fid === uid ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="kingdom.position | long" matBadgePosition="above before">
            <img mat-list-avatar [src]="kingdom.faction.image">
          </div>
          <div mat-line>{{ kingdom.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ kingdom.faction.name | translate }}</div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.letter.contents' | translate }}:</div>
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
      <button mat-raised-button color="primary" [disabled]="!form.valid" (click)="send()">{{ 'kingdom.letter.send' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
  `],
})
export class LetterComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  form: FormGroup = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public kingdom: any,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<LetterComponent>,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private apiService: ApiService,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      subject: [null, [Validators.required]],
      message: [null, [Validators.required]],
    });
  }

  reset(): void {
    this.form.reset();
  }

  async send() {
    if (this.form.valid) {
      this.loadingService.startLoading();
      try {
        const sent = await this.apiService.sendLetter(this.kingdom.fid, this.form.value.subject, this.form.value.message, this.uid);
        this.notificationService.success('kingdom.letter.success');
        this.close();
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.letter.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.letter.error');
    }
  }

  close(): void {
    this.dialogRef.close();
  }

}
