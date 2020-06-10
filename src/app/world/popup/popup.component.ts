import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TroopAssignmentType } from '../../kingdom/army/army.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from './confirm.component';

export enum PopupType {
  'kingdom', 'shop', 'quest',
}

export enum ConfirmType {
  'charm', 'contract', 'artifact', 'battle', 'troop',
}

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
@UntilDestroy()
export class PopupComponent implements OnInit {

  data: any = null;
  shopContracts: any[] = [];
  shopArtifacts: any[] = [];
  shopTroops: any[] = [];
  kingdomTroops: any[] = [];
  shopCharms: any[] = [];
  questContracts: any[] = [];
  questTroops: any[] = [];
  questArtifacts: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    // shop
    if (this.data.type === PopupType.shop) {
      this.firebaseService.leftJoin(`shops/${this.data.fid}/contracts`, 'heroes', 'id', 'id').pipe(untilDestroyed(this)).subscribe(contracts => {
        this.shopContracts = contracts;
      });
      this.firebaseService.leftJoin(`shops/${this.data.fid}/troops`, 'units', 'id', 'id').pipe(untilDestroyed(this)).subscribe(troops => {
        this.shopTroops = troops;
      });
      this.firebaseService.leftJoin(`shops/${this.data.fid}/artifacts`, 'items', 'id', 'id').pipe(untilDestroyed(this)).subscribe(artifacts => {
        this.shopArtifacts = artifacts;
      });
      this.firebaseService.leftJoin(`shops/${this.data.fid}/charms`, 'spells', 'id', 'id').pipe(untilDestroyed(this)).subscribe(charms => {
        this.shopCharms = charms;
      });
    }
    // kingdom
    if (this.data.type === PopupType.kingdom) {
      this.firebaseService.leftJoin(`kingdoms/${this.data.fid}/troops`, 'units', 'id', 'id', ref => ref.where('assignment', '==', TroopAssignmentType.troopDefense)).pipe(untilDestroyed(this)).subscribe(troops => {
        this.kingdomTroops = troops.sort((a, b) => a.join.name - b.join.name);
      });
    }
    // quest
    if (this.data.type === PopupType.quest) {
      this.firebaseService.leftJoin(`quests/${this.data.fid}/troops`, 'units', 'id', 'id').pipe(untilDestroyed(this)).subscribe(troops => {
        this.questTroops = troops;
      });
      this.firebaseService.leftJoin(`quests/${this.data.fid}/contracts`, 'heroes', 'id', 'id').pipe(untilDestroyed(this)).subscribe(contracts => {
        this.questContracts = contracts;
      });
      this.firebaseService.leftJoin(`quests/${this.data.fid}/artifacts`, 'items', 'id', 'id').pipe(untilDestroyed(this)).subscribe(artifacts => {
        this.questArtifacts = artifacts;
      });
    }
  }

  openConfirmDialog(object: any, type: ConfirmType): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      panelClass: 'dialog-responsive',
      data: {
        object: object,
        type: type,
      }
    });
  }

}
