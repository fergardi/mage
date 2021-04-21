import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { PopupType } from 'src/app/shared/type/common.type';
import { AngularFirestore } from '@angular/fire/firestore';
import { AdventureComponent } from './adventure.component';
import { DealComponent } from './deal.component';
import { BehaviorSubject, combineLatest } from 'rxjs';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { TroopAssignmentType } from 'src/app/kingdom/army/army.component';
import { LoadingService } from 'src/app/services/loading.service';

@UntilDestroy()
@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {

  opened: BehaviorSubject<boolean> = new BehaviorSubject(false);
  data: any = null;
  shopContracts: any[] = [];
  shopArtifacts: any[] = [];
  shopTroops: any[] = [];
  kingdomTroops: any[] = [];
  shopCharms: any[] = [];
  questContracts: any[] = [];
  questTroops: any[] = [];
  questArtifacts: any[] = [];
  PopupType: typeof PopupType = PopupType;

  constructor(
    private angularFirestore: AngularFirestore,
    private dialog: MatDialog,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) { }

  async ngOnInit() {
    // check refresh
    await this.checkRefresh();
    // kingdom
    if (this.data.type === PopupType.KINGDOM) {
      combineLatest([
        this.angularFirestore.collection<any>(`kingdoms/${this.data.id}/troops`, ref => ref.where('assignment', '==', TroopAssignmentType.DEFENSE)).valueChanges({ idField: 'fid' }),
      ])
      .pipe(untilDestroyed(this))
      .subscribe(([troops]) => {
        this.kingdomTroops = troops.sort((a, b) => a.sort - b.sort);
        this.opened.next(true);
      });
    }
    // shop
    if (this.data.type === PopupType.SHOP) {
      combineLatest([
        this.angularFirestore.collection<any>(`shops/${this.data.id}/contracts`).valueChanges({ idField: 'fid' }),
        this.angularFirestore.collection<any>(`shops/${this.data.id}/troops`).valueChanges({ idField: 'fid' }),
        this.angularFirestore.collection<any>(`shops/${this.data.id}/artifacts`).valueChanges({ idField: 'fid' }),
        this.angularFirestore.collection<any>(`shops/${this.data.id}/charms`).valueChanges({ idField: 'fid' }),
      ])
      .pipe(untilDestroyed(this))
      .subscribe(([contracts, troops, artifacts, charms]) => {
        this.shopContracts = contracts;
        this.shopTroops = troops;
        this.shopArtifacts = artifacts;
        this.shopCharms = charms;
        this.opened.next(true);
      });
    }
    // quest
    if (this.data.type === PopupType.QUEST) {
      combineLatest([
        this.angularFirestore.collection<any>(`quests/${this.data.id}/troops`, ref => ref.where('assignment', '==', TroopAssignmentType.DEFENSE)).valueChanges({ idField: 'fid' }),
        this.angularFirestore.collection<any>(`quests/${this.data.id}/contracts`).valueChanges({ idField: 'fid' }),
        this.angularFirestore.collection<any>(`quests/${this.data.id}/artifacts`).valueChanges({ idField: 'fid' }),
      ])
      .pipe(untilDestroyed(this))
      .subscribe(([troops, contracts, artifacts]) => {
        this.questTroops = troops.sort((a, b) => a.sort - b.sort);
        this.questContracts = contracts;
        this.questArtifacts = artifacts;
        this.opened.next(true);
      });
    }
  }

  async checkRefresh() {
    if (this.data.type !== PopupType.KINGDOM && this.data.visited && moment().isAfter(moment(this.data.visited.toMillis()))) {
      this.loadingService.startLoading();
      try {
        await this.data.type === PopupType.SHOP
          ? this.apiService.addShop(this.data.id, this.data.store.id)
          : this.apiService.addQuest(this.data.id, this.data.location.id);
      } catch (error) {
        console.error(error);
      }
      this.loadingService.stopLoading();
    }
  }

  openDealDialog(deal: any): void {
    deal.join = deal.hero || deal.item || deal.spell || deal.unit;
    const dialogRef = this.dialog.open(DealComponent, {
      panelClass: 'dialog-responsive',
      data: {
        deal: deal,
        shop: this.data,
      },
    });
  }

  openAdventureDialog(reward: any): void {
    const dialogRef = this.dialog.open(AdventureComponent, {
      panelClass: 'dialog-responsive',
      data: {
        reward: reward,
        quest: this.data,
      },
    });
  }

}
