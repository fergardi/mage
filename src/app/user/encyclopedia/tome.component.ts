import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-tome',
  template: `
    <div class="dialog-title">
      <h1 mat-dialog-title>{{ tome.name | translate }}</h1>
      <mat-chip-list>
        <mat-chip color="primary" selected>{{ 'type.' + tome.type + '.name'  | translate }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-content>
      <p>{{ tome.description | translate }}</p>
      <mat-list dense>
        <mat-list-item [ngClass]="{ 'legendary': tome | legendary }">
          <div mat-list-avatar>
            <img mat-list-avatar [src]="tome.image">
          </div>
          <div mat-line>{{ tome.name | translate }}</div>
          <div mat-line class="mat-card-subtitle" *ngIf="['god', 'family', 'skill', 'resource', 'category'].includes(tome.type)">{{ tome.description | translate }}</div>
          <div mat-line class="mat-card-subtitle" *ngIf="['sorcery', 'enchantment', 'instant', 'summon', 'structure', 'location', 'hero', 'item'].includes(tome.type)" [innerHTML]="tome.description | translate | icon:tome.skills:tome.categories:tome.families:tome.units:tome.resources:tome.spells:tome.adjacents:tome.opposites"></div>
          <div mat-line class="mat-card-subtitle" *ngIf="['unit'].includes(tome.type)">
            <img [title]="family.name | translate" class="icon" *ngFor="let family of tome.families" [src]="family.image">
            <img [title]="skill.name | translate" class="icon" *ngFor="let skill of tome.skills" [src]="skill.image">
            <img [title]="category.name | translate" class="icon" *ngFor="let category of tome.categories" [src]="category.image">
          </div>
          <div mat-list-avatar *ngIf="tome.join">
            <img mat-list-avatar [src]="tome.join.image">
          </div>
        </mat-list-item>
      </mat-list>
      <mat-chip-list>
        <mat-chip color="primary" selected *ngIf="tome.attack > 0"><img class="icon" src="/assets/images/icons/attack.png">{{ 'user.tome.attack' | translate:{ number: tome.attack | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="tome.defense > 0"><img class="icon" src="/assets/images/icons/defense.png">{{ 'user.tome.defense' | translate:{ number: tome.defense | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="tome.health > 0"><img class="icon" src="/assets/images/icons/health.png">{{ 'user.tome.health' | translate:{ number: tome.health | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="tome.initiative > 0"><img class="icon" src="/assets/images/icons/initiative.png">{{ 'user.tome.initiative' | translate:{ number: tome.initiative | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="tome.power > 0"><img class="icon" src="/assets/images/icons/power.png">{{ 'user.tome.power' | translate:{ number: tome.power | long } }}</mat-chip>
      </mat-chip-list>
      <mat-chip-list>
        <mat-chip color="primary" selected *ngIf="tome.goldMaintenance > 0"><img class="icon" src="/assets/images/resources/gold.png">{{ 'user.tome.goldMaintenance' | translate:{ number: tome.goldMaintenance | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="tome.manaMaintenance > 0"><img class="icon" src="/assets/images/resources/mana.png">{{ 'user.tome.manaMaintenance' | translate:{ number: tome.manaMaintenance | long } }}</mat-chip>
        <mat-chip color="primary" selected *ngIf="tome.populationMaintenance > 0"><img class="icon" src="/assets/images/resources/population.png">{{ 'user.tome.populationMaintenance' | translate:{ number: tome.populationMaintenance | long } }}</mat-chip>
      </mat-chip-list>
      <mat-chip-list>
        <mat-chip color="primary" selected *ngFor="let family of tome.families"><img class="icon" [src]="family.image">{{ family.name | translate }}</mat-chip>
        <mat-chip color="primary" selected *ngFor="let skill of tome.skills"><img class="icon" [src]="skill.image">{{ skill.name | translate }}</mat-chip>
        <mat-chip color="primary" selected *ngFor="let category of tome.categories" [ngClass]="{ 'legendary' : category.id === 'legendary' }"><img class="icon" [src]="category.image">{{ category.name | translate }}</mat-chip>
      </mat-chip-list>
    </div>
    <div mat-dialog-actions>
      <button mat-raised-button color="primary" (click)="close()" cdkFocusInitial>{{ 'user.tome.close' | translate }}</button>
    </div>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      .mat-chip-list {
        display: inline-block;
      }
    }
  `]
})
export class TomeComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public tome: any,
    private dialogRef: MatDialogRef<TomeComponent>,
  ) { }

  close(): void {
    this.dialogRef.close();
  }

}
