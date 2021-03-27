import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

export enum ReportType {
  'battle', 'auction', 'message',
}

@Component({
  selector: 'app-report',
  template: `
    <h1 mat-dialog-title>{{ report.subject | translate }}</h1>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.report.from' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="report.from.faction.id">
          <div mat-list-avatar>
            <img mat-list-avatar [src]="report.from.faction.image">
          </div>
          <div mat-line>{{ report.from.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ report.from.faction.name | translate }}</div>
        </mat-list-item>
      </mat-list>
      <div matSubheader>{{ 'kingdom.report.adquisitions' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="[report.message.join.id, (report.message.join | legendary) ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="(report.message.quantity || report.message.level || report.message.join.level) | short" matBadgePosition="ahove before">
            <img mat-list-avatar [src]="report.message.join.image">
          </div>
          <div mat-line>{{ report.message.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" *ngIf="['spell', 'enchantment', 'hero', 'item', 'summon', 'sorcery', 'instant'].includes(report.message.join.type)" [innerHTML]="report.message.join.description | translate | icon:report.message.join"></div>
          <div mat-line class="mat-card-subtitle" *ngIf="['unit'].includes(report.message.join.type)">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of report.message.join.families" [src]="family.image">
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of report.message.join.skills" [src]="skill.image">
            <img [title]="category.name | translate" class="icon" *ngFor="let category of report.message.join.categories" [src]="category.image">
            <img [title]="'category.legendary.name' | translate" class="icon" *ngIf="report.message.join.legendary" src="/assets/images/icons/legendary.png">
          </div>
          <div mat-line class="mat-card-subtitle" *ngIf="['unit'].includes(report.message.join.type) && report.message.join.categories && report.message.join.categories.length">
            <img [title]="('category.resistance.name' | translate) + (category.name | translate)" class="icon grayscale" *ngFor="let category of report.message.join.resistances" [src]="category.image">
          </div>
        </mat-list-item>
      </mat-list>
<!--
      <mat-list dense *ngIf="report.log">
        <mat-list-item *ngFor="let log of report.log" [ngClass]="['log-' + log.side, (log.join | legendary) ? 'legendary' : '']">
          <div mat-list-avatar [matBadge]="log.quantity | long" [matBadgePosition]="log.side === 'left' ? 'above before' : 'above after'">
            <img mat-list-avatar *ngIf="log.join" [src]="log.join.image">
          </div>
          <div mat-line *ngIf="log.join">{{ log.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle">{{ log.text | translate }}</div>
        </mat-list-item>
      </mat-list>
-->
    </div>
    <div mat-dialog-actions>
      <button mat-raised-button color="primary" (click)="close()" cdkFocusInitial>{{ 'kingdom.report.close' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
    ::ng-deep .log-right .mat-list-item-content {
      flex-direction: row-reverse !important;
    }
    ::ng-deep .log-right .mat-list-text {
      padding: 0 16px 0 0 !important;
    }
    ::ng-deep .log-right .mat-line,
    ::ng-deep .log-right .mat-line.mat-card-subtitle {
      text-align: right;
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      justify-content: flex-end;
    }
  `],
})
export class ReportComponent implements OnInit {

  uid = this.store.selectSnapshot(AuthState.getUserUID);
  reportType: typeof ReportType = ReportType;

  constructor(
    @Inject(MAT_DIALOG_DATA) public report: any,
    private dialogRef: MatDialogRef<ReportComponent>,
    // private firebaseService: FirebaseService,
    private apiService: ApiService,
    private store: Store,
  ) { }

  close() {
    this.dialogRef.close();
  }

  async ngOnInit() {
    if (!this.report.read) {
      this.apiService.readLetter(this.uid, this.report.fid);
    }
  }

}
