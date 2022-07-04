import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatDialog } from '@angular/material/dialog';
import { PopupType, AssignmentType } from 'src/app/shared/type/enum.type';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AdventureComponent } from './adventure.component';
import { DealComponent } from './deal.component';
import { BehaviorSubject, combineLatest } from 'rxjs';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { Artifact, Charm, Contract, Deal, Popup, Quest, Reward, Shop, Troop } from 'src/app/shared/type/interface.model';
import { NotificationService } from 'src/app/services/notification.service';

@UntilDestroy()
@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  opened: BehaviorSubject<boolean> = new BehaviorSubject(false);
  data: Popup = null; // Kingdom | Quest | Shop
  shopContracts: Array<Contract> = [];
  shopArtifacts: Array<Artifact> = [];
  shopTroops: Array<Troop> = [];
  kingdomTroops: Array<Troop> = [];
  shopCharms: Array<Charm> = [];
  questContracts: Array<Contract> = [];
  questTroops: Array<Troop> = [];
  questArtifacts: Array<Artifact> = [];
  PopupType: typeof PopupType = PopupType;
  canAttack = false;

  constructor(
    private angularFirestore: AngularFirestore,
    private dialog: MatDialog,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private store: Store,
    private notificationService: NotificationService,
  ) { }

  async ngOnInit(): Promise<void> {
    // check refresh
    await this.checkRefresh();
    // attack enabled
    this.canAttack = (await this.angularFirestore.collection<Troop>(`kingdoms/${this.uid}/troops`, ref => ref.where('assignment', '==', AssignmentType.ATTACK)).get().toPromise()).docs.length !== 0;
    switch (this.data.type) {
      // kingdom
      case PopupType.KINGDOM: {
        combineLatest([
          this.angularFirestore.collection<Troop>(`kingdoms/${this.data.id}/troops`, ref => ref.where('assignment', '==', AssignmentType.DEFENSE)).valueChanges({ idField: 'fid' }),
        ])
        .pipe(untilDestroyed(this))
        .subscribe(([troops]) => {
          this.loadingService.startLoading();
          this.kingdomTroops = troops.sort((a, b) => a.sort - b.sort);
          this.opened.next(true);
          this.loadingService.stopLoading();
        });
        break;
      }
      // shop
      case PopupType.SHOP: {
        combineLatest([
          this.angularFirestore.doc<Shop>(`shops/${this.data.id}`).valueChanges(),
          this.angularFirestore.collection<Contract>(`shops/${this.data.id}/contracts`).valueChanges({ idField: 'fid' }),
          this.angularFirestore.collection<Troop>(`shops/${this.data.id}/troops`).valueChanges({ idField: 'fid' }),
          this.angularFirestore.collection<Artifact>(`shops/${this.data.id}/artifacts`).valueChanges({ idField: 'fid' }),
          this.angularFirestore.collection<Charm>(`shops/${this.data.id}/charms`).valueChanges({ idField: 'fid' }),
        ])
        .pipe(untilDestroyed(this))
        .subscribe(([shop, contracts, troops, artifacts, charms]) => {
          this.loadingService.startLoading();
          this.data.visited = shop.visited;
          this.shopContracts = contracts;
          this.shopTroops = troops;
          this.shopArtifacts = artifacts;
          this.shopCharms = charms;
          this.opened.next(true);
          this.loadingService.stopLoading();
        });
        break;
      }
      // quest
      case PopupType.QUEST: {
        combineLatest([
          this.angularFirestore.doc<Quest>(`quests/${this.data.id}`).valueChanges(),
          this.angularFirestore.collection<Troop>(`quests/${this.data.id}/troops`, ref => ref.where('assignment', '==', AssignmentType.DEFENSE)).valueChanges({ idField: 'fid' }),
          this.angularFirestore.collection<Contract>(`quests/${this.data.id}/contracts`).valueChanges({ idField: 'fid' }),
          this.angularFirestore.collection<Artifact>(`quests/${this.data.id}/artifacts`).valueChanges({ idField: 'fid' }),
        ])
        .pipe(untilDestroyed(this))
        .subscribe(([quest, troops, contracts, artifacts]) => {
          this.loadingService.startLoading();
          this.data.visited = quest.visited;
          this.questTroops = troops.sort((a, b) => a.sort - b.sort);
          this.questContracts = contracts;
          this.questArtifacts = artifacts;
          this.opened.next(true);
          this.loadingService.stopLoading();
        });
        break;
      }
    }
  }

  async checkRefresh(): Promise<void> {
    if (this.data.type !== PopupType.KINGDOM && this.data.visited && moment().isAfter(moment(this.data.visited.toMillis()))) {
      try {
        this.loadingService.startLoading();
        await this.data.type === PopupType.SHOP
        ? this.apiService.addShop(this.data.id, this.data.store.id)
        : this.apiService.addQuest(this.data.id, this.data.location.id);
      } catch (error) {
        this.notificationService.error('world.deal.error', error as Error);
      } finally {
        this.loadingService.stopLoading();
      }
    }
  }

  openDealDialog(deal: Deal): void {
    deal.join = deal.hero || deal.item || deal.spell || deal.unit;
    const dialogRef = this.dialog.open(DealComponent, {
      panelClass: 'dialog-responsive',
      data: {
        deal: deal,
        shop: this.data as Shop,
      },
    });
  }

  openAdventureDialog(reward: Reward): void {
    const dialogRef = this.dialog.open(AdventureComponent, {
      panelClass: 'dialog-responsive',
      data: {
        reward: reward,
        quest: this.data as Quest,
      },
    });
  }

}
