import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { CacheService } from 'src/app/services/cache.service';
import { MatDialog } from '@angular/material/dialog';
import { BuyComponent } from './buy.component';
import { Store, Select } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { LoadingService } from 'src/app/services/loading.service';
import { TutorialService } from 'src/app/services/tutorial.service';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Observable } from 'rxjs';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@Component({
  selector: 'app-emporium',
  templateUrl: './emporium.component.html',
  styleUrls: ['./emporium.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class EmporiumComponent implements OnInit {

  @Select(AuthState.getKingdomTree) tree$: Observable<any>;
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  kingdomPerks: number = 0;
  kingdomTree: any = null;
  emporiumItems: any[] = [];
  emporiumPacks: any[] = [];
  emporiumPerks: any[] = [];

  constructor(
    private cacheService: CacheService,
    private dialog: MatDialog,
    private store: Store,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private apiService: ApiService,
    public tutorialService: TutorialService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.emporiumItems = (await this.cacheService.getItems()).filter((item: any) => item.gems > 0);
    this.emporiumPacks = (await this.cacheService.getPacks()).sort((a: any, b: any) => a.quantity - b.quantity);
    this.emporiumPerks = (await this.cacheService.getPerks());
    this.tree$.pipe(untilDestroyed(this)).subscribe((tree: any) => {
      this.kingdomPerks = this.store.selectSnapshot(AuthState.getKingdomPerks);
      this.kingdomTree = JSON.parse(JSON.stringify(tree)); // copy for live editing
    });
  }

  openBuyDialog(item: any): void {
    const dialogRef = this.dialog.open(BuyComponent, {
      panelClass: 'dialog-responsive',
      data: item,
    });
  }

  findTree(node: any, perk: string): number {
    if (node.id === perk) {
      return node.level;
    } else if (node.perks) {
      let found = null;
      for (let i = 0; found === null && i < node.perks.length; i++) {
        found = this.findTree(node.perks[i], perk);
      }
      return found;
    }
    return null;
  }

  async saveTree(): Promise<void> {
    if (true) { // TODO
      this.loadingService.startLoading();
      try {
        const tree = {
          strategy: this.findTree(this.kingdomTree, 'strategy'),
          agriculture: this.findTree(this.kingdomTree, 'agriculture'),
          alchemy: this.findTree(this.kingdomTree, 'alchemy'),
          architecture: this.findTree(this.kingdomTree, 'architecture'),
          culture: this.findTree(this.kingdomTree, 'culture'),
          teology: this.findTree(this.kingdomTree, 'teology'),
          cartography: this.findTree(this.kingdomTree, 'cartography'),
          metalurgy: this.findTree(this.kingdomTree, 'metalurgy'),
          medicine: this.findTree(this.kingdomTree, 'medicine'),
          forge: this.findTree(this.kingdomTree, 'forge'),
          science: this.findTree(this.kingdomTree, 'science'),
          mysticism: this.findTree(this.kingdomTree, 'mysticism'),
          masonry: this.findTree(this.kingdomTree, 'masonry'),
        };
        await this.apiService.plantTree(this.uid, tree);
        this.notificationService.success('kingdom.tree.success');
      } catch (error) {
        console.error(error);
        this.notificationService.error('kingdom.tree.error');
      }
      this.loadingService.stopLoading();
    } else {
      this.notificationService.error('kingdom.tree.error');
    }
  }

  resetTree(node: any): void {
    this.kingdomPerks = 10;
    node.level = 0;
    node.perks.forEach((perk: any) => this.resetTree(perk));
  }

}
