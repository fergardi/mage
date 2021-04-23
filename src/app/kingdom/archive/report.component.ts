import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';

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
    </div>
    <!-- MESSAGE -->
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.report.message' | translate }}:</div>
      <p>{{ report.message | translate }}</p>
    </div>
    <!-- BATTLE -->
    <div mat-dialog-content *ngIf="report.data && report.data.logs">
      <div matSubheader>{{ 'kingdom.report.attacker' | translate }}:<span class="fill-space"></span>{{ 'kingdom.report.defender' | translate }}:</div>
      <mat-list dense>
        <ng-container *ngFor="let log of report.data.logs">
          <!-- ARTIFACTS -->
          <mat-list-item [ngClass]="[log.attackerArtifact.item.faction.id, log.attackerArtifact.item.legendary ? 'legendary' : 'common', 'lefted']" *ngIf="log.attackerArtifact">
            <div mat-list-avatar [matBadge]="1" matBadgePosition="above before">
              <img mat-list-avatar [src]="log.attackerArtifact.item.image">
            </div>
            <div mat-line>{{ log.attackerArtifact.item.name | translate }}</div>
            <div mat-line class="mat-card-subtitle" [innerHTML]="log.attackerArtifact.item.description | translate | icon:log.attackerArtifact.item"></div>
            <mat-icon>{{ log.success ? 'check' : 'block' }}</mat-icon>
          </mat-list-item>
          <mat-list-item [ngClass]="[log.defenderArtifact.item.faction.id, log.defenderArtifact.item.legendary ? 'legendary' : 'common', 'righted']" *ngIf="log.defenderArtifact">
            <div mat-list-avatar [matBadge]="log.defenderArtifact.level | short" matBadgePosition="above after">
              <img mat-list-avatar [src]="log.defenderArtifact.item.image">
            </div>
            <div mat-line>{{ log.defenderArtifact.item.name | translate }}</div>
            <div mat-line class="mat-card-subtitle" [innerHTML]="log.defenderArtifact.item.description | translate | icon:log.defenderArtifact.item"></div>
            <mat-icon>{{ log.success ? 'check' : 'block' }}</mat-icon>
          </mat-list-item>
          <!-- CHARMS -->
          <mat-list-item [ngClass]="[log.attackerCharm.spell.faction.id, log.attackerCharm.spell.legendary ? 'legendary' : 'common', 'lefted']" *ngIf="log.attackerCharm">
            <div mat-list-avatar [matBadge]="1" matBadgePosition="above before">
              <img mat-list-avatar [src]="log.attackerCharm.spell.image">
            </div>
            <div mat-line>{{ log.attackerCharm.spell.name | translate }}</div>
            <div mat-line class="mat-card-subtitle" [innerHTML]="log.attackerCharm.spell.description | translate | icon:log.attackerCharm.spell"></div>
            <mat-icon>{{ log.success ? 'check' : 'block' }}</mat-icon>
          </mat-list-item>
          <mat-list-item [ngClass]="[log.defenderCharm.spell.faction.id, log.defenderCharm.spell.legendary ? 'legendary' : 'common', 'righted']" *ngIf="log.defenderCharm">
            <div mat-list-avatar [matBadge]="log.defenderCharm.level | short" matBadgePosition="above after">
              <img mat-list-avatar [src]="log.defenderCharm.spell.image">
            </div>
            <div mat-line>{{ log.defenderCharm.spell.name | translate }}</div>
            <div mat-line class="mat-card-subtitle" [innerHTML]="log.defenderCharm.spell.description | translate | icon:log.defenderCharm.spell"></div>
            <mat-icon>{{ log.success ? 'check' : 'block' }}</mat-icon>
          </mat-list-item>
          <!-- CONTRACTS -->
          <mat-list-item [ngClass]="[log.attackerContract.hero.faction.id, log.attackerContract.hero.legendary ? 'legendary' : 'common', 'lefted']" *ngIf="log.attackerContract">
            <div mat-list-avatar [matBadge]="log.attackerContract.level | short" matBadgePosition="above before">
              <img mat-list-avatar [src]="log.attackerContract.hero.image">
            </div>
            <div mat-line>{{ log.attackerContract.hero.name | translate }}</div>
            <div mat-line class="mat-card-subtitle" [innerHTML]="log.attackerContract.hero.description | translate | icon:log.attackerContract.hero"></div>
            <mat-icon>{{ log.attackerContract.hero.battle ? 'star' : 'star_half' }}</mat-icon>
          </mat-list-item>
          <mat-list-item [ngClass]="[log.defenderContract.hero.faction.id, log.defenderContract.hero.legendary ? 'legendary' : 'common', 'righted']" *ngIf="log.defenderContract">
            <div mat-list-avatar [matBadge]="log.defenderContract.level | short" matBadgePosition="above after">
              <img mat-list-avatar [src]="log.defenderContract.hero.image">
            </div>
            <div mat-line>{{ log.defenderContract.hero.name | translate }}</div>
            <div mat-line class="mat-card-subtitle" [innerHTML]="log.defenderContract.hero.description | translate | icon:log.defenderContract.hero"></div>
            <mat-icon>{{ log.defenderContract.hero.battle ? 'star' : 'star_half' }}</mat-icon>
          </mat-list-item>
          <!-- TROOPS -->
          <ng-container *ngIf="log.attackerTroop && log.defenderTroop">
            <ng-container *ngIf="log.direction === 'attacker-vs-defender'">
              <mat-list-item [ngClass]="[log.attackerTroop.unit.faction.id, log.attackerTroop.unit.legendary ? 'legendary' : 'common', 'lefted']">
                <div mat-list-avatar [matBadge]="(log.attackerTroop.quantity | long) + ' / ' + (log.attackerQuantity | long)" matBadgePosition="above before">
                  <img mat-list-avatar [src]="log.attackerTroop.unit.image">
                </div>
                <div mat-line>{{ log.attackerTroop.unit.name | translate }}</div>
                <div mat-line class="mat-card-subtitle">{{ 'kingdom.report.attack' | translate:{ quantity: log.attackerQuantity | long, initiative: log.attackerTroop.unit.initiative, attack: (log.attackerTroop.unit.attack * log.attackerQuantity) | long, defense: (log.defenderTroop.unit.defense * log.defenderQuantity) | long, health: (log.defenderTroop.unit.health * log.defenderQuantity) | long, casualties: log.defenderCasualties | long } }}</div>
                <mat-icon style="transform: rotate(-90deg)">subdirectory_arrow_left</mat-icon>
              </mat-list-item>
              <mat-list-item [ngClass]="[log.defenderTroop.unit.faction.id, log.defenderTroop.unit.legendary ? 'legendary' : 'common', 'righted']">
                <mat-icon style="transform: rotate(90deg)">subdirectory_arrow_left</mat-icon>
                <div mat-line>{{ log.defenderTroop.unit.name | translate }}</div>
                <div mat-line class="mat-card-subtitle">{{ 'kingdom.report.counterattack' | translate:{ quantity: log.defenderTroop.quantity | long, initiative: log.defenderTroop.unit.initiative, attack: (log.defenderTroop.unit.attack * log.defenderTroop.quantity) | long, defense: (log.attackerTroop.unit.defense * log.attackerQuantity) | long, health: (log.attackerTroop.unit.health * log.attackerQuantity) | long, casualties: log.attackerCasualties | long } }}</div>
                <div mat-list-avatar [matBadge]="(log.defenderTroop.quantity | long) + ' / ' + (log.defenderQuantity | long)" matBadgePosition="above after">
                  <img mat-list-avatar [src]="log.defenderTroop.unit.image">
                </div>
              </mat-list-item>
            </ng-container>
            <ng-container *ngIf="log.direction === 'defender-vs-attacker'">
            <mat-list-item [ngClass]="[log.defenderTroop.unit.faction.id, log.defenderTroop.unit.legendary ? 'legendary' : 'common', 'righted']">
                <div mat-list-avatar [matBadge]="(log.defenderTroop.quantity | long) + ' / ' + (log.defenderQuantity | long)" matBadgePosition="above after">
                  <img mat-list-avatar [src]="log.defenderTroop.unit.image">
                </div>
                <div mat-line>{{ log.defenderTroop.unit.name | translate }}</div>
                <div mat-line class="mat-card-subtitle">{{ 'kingdom.report.attack' | translate:{ quantity: log.defenderQuantity | long, initiative: log.defenderTroop.unit.initiative, attack: (log.defenderTroop.unit.attack * log.defenderQuantity) | long, defense: (log.attackerTroop.unit.defense * log.attackerQuantity) | long, health: (log.attackerTroop.unit.health * log.attackerQuantity) | long, casualties: log.attackerCasualties | long } }}</div>
                <mat-icon style="transform: rotate(90deg)">subdirectory_arrow_right</mat-icon>
              </mat-list-item>
              <mat-list-item [ngClass]="[log.attackerTroop.unit.faction.id, log.attackerTroop.unit.legendary ? 'legendary' : 'common', 'lefted']">
                <mat-icon style="transform: rotate(-90deg)">subdirectory_arrow_right</mat-icon>
                <div mat-line>{{ log.attackerTroop.unit.name | translate }}</div>
                <div mat-line class="mat-card-subtitle">{{ 'kingdom.report.counterattack' | translate:{ quantity: log.attackerTroop.quantity | long, initiative: log.attackerTroop.unit.initiative, attack: (log.attackerTroop.unit.attack * log.attackerTroop.quantity) | long, defense: (log.defenderTroop.unit.defense * log.defenderQuantity) | long, health: (log.defenderTroop.unit.health * log.defenderQuantity) | long, casualties: log.defenderCasualties | long } }}</div>
                <div mat-list-avatar [matBadge]="(log.attackerTroop.quantity | long) + ' / ' + (log.attackerQuantity | long)" matBadgePosition="above before">
                  <img mat-list-avatar [src]="log.attackerTroop.unit.image">
                </div>
              </mat-list-item>
            </ng-container>
          </ng-container>
        </ng-container>
      </mat-list>
    </div>
    <!-- ATTACHMENTS -->
    <div mat-dialog-content *ngIf="report.data && report.data.join">
      <div matSubheader>{{ 'kingdom.report.attachment' | translate }}:</div>
      <mat-list dense>
        <mat-list-item [ngClass]="[report.data.join.faction.id, report.data.join.legendary ? 'legendary' : 'common']">
          <div mat-list-avatar [matBadge]="(report.data.quantity || report.data.level || report.data.join.level) | short" matBadgePosition="ahove before">
            <img mat-list-avatar [src]="report.data.join.image">
          </div>
          <div mat-line>{{ report.data.join.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" *ngIf="['spell', 'hero', 'item', 'resource'].includes(report.data.join.type)" [innerHTML]="report.data.join.description | translate | icon:report.data.join"></div>
          <div mat-line class="mat-card-subtitle" *ngIf="['unit'].includes(report.data.join.type)">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of report.data.join.families" [src]="family.image">
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of report.data.join.skills" [src]="skill.image">
            <img [title]="category.name | translate" class="icon" *ngFor="let category of report.data.join.categories" [src]="category.image">
            <img [title]="'category.legendary.name' | translate" class="icon" *ngIf="report.data.join.legendary" src="/assets/images/icons/legendary.png">
          </div>
          <div mat-line class="mat-card-subtitle" *ngIf="['unit'].includes(report.data.join.type) && report.data.join.categories && report.data.join.categories.length">
            <img [title]="('category.resistance.name' | translate) + (category.name | translate)" class="icon grayscale" *ngFor="let category of report.data.join.resistances" [src]="category.image">
          </div>
          <div mat-list-avatar *ngIf="report.data.gold" [matBadge]="report.data.gold | short" matBadgePosition="ahove after">
            <img mat-list-avatar src="/assets/images/resources/gold.png">
          </div>
          <div mat-list-avatar *ngIf="report.data.gems" [matBadge]="report.data.gems | short" matBadgePosition="ahove after">
            <img mat-list-avatar src="/assets/images/resources/gem.png">
          </div>
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-content>
      <div matSubheader>{{ 'kingdom.report.date' | translate }}:</div>
      <mat-chip-list>
        <mat-chip color="primary" selected><img class="icon" src="/assets/images/resources/turn.png">{{ report.timestamp.toMillis() | date:('dateformat.short' | translate) }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-raised-button color="primary" (click)="close()" cdkFocusInitial>{{ 'kingdom.report.close' | translate }}</button>
    </div>
  `,
  styles: [`
    .mat-form-field {
      width: 100%;
    }
    p {
      margin: 0;
    }
    ::ng-deep .mat-list-base .mat-list-item.righted .mat-list-item-content {
      flex-direction: row-reverse !important;
    }
    ::ng-deep .mat-list-base .mat-list-item.righted .mat-list-item-content .mat-list-text {
      text-align: right !important;
    }
    ::ng-deep .mat-list-base .mat-list-item .mat-list-item-content .mat-list-text {
      padding-right: 16px !important;
    }
    ::ng-deep .mat-list-base .mat-list-item .mat-list-item-content .mat-icon {
      margin: 0 16px !important;
    }
    @media screen and (max-width: 960px) {
      ::ng-deep .mat-list-base .mat-list-item .mat-list-item-content .mat-icon {
        margin: 0 !important;
      }
    }
  `],
})
export class ReportComponent implements OnInit {

  uid = this.store.selectSnapshot(AuthState.getUserUID);

  constructor(
    @Inject(MAT_DIALOG_DATA) public report: any,
    private dialogRef: MatDialogRef<ReportComponent>,
    private apiService: ApiService,
    private store: Store,
  ) { console.log(this.report)}

  close() {
    this.dialogRef.close();
  }

  async ngOnInit(): Promise<void> {
    if (!this.report.read) {
      await this.apiService.readLetter(this.uid, this.report.fid);
    }
  }

}
