import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { CacheService } from 'src/app/services/cache.service';
import { MatDialog } from '@angular/material/dialog';
import { BuyComponent } from './buy.component';
import { Store, Select } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { TutorialService } from 'src/app/services/tutorial.service';
import { Observable } from 'rxjs';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { PERK_COST } from './perk.component';
import { PlantComponent } from './plant.component';

@Component({
  selector: 'app-emporium',
  templateUrl: './emporium.component.html',
  styleUrls: ['./emporium.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class EmporiumComponent implements OnInit {

  PERK_COST = PERK_COST;

  @Select(AuthState.getKingdomTree) tree$: Observable<any>;
  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
  gems: number = 0;
  kingdomTree: any = null;
  originalTree: any = null;
  emporiumItems: any[] = [];
  emporiumPacks: any[] = [];

  constructor(
    private cacheService: CacheService,
    private dialog: MatDialog,
    private store: Store,
    public tutorialService: TutorialService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.emporiumItems = (await this.cacheService.getItems()).filter((item: any) => item.gems > 0);
    this.emporiumPacks = (await this.cacheService.getPacks()).sort((a: any, b: any) => a.quantity - b.quantity);
    this.tree$.pipe(untilDestroyed(this)).subscribe((tree: any) => {
      this.originalTree = tree;
      this.kingdomTree = JSON.parse(JSON.stringify(tree));
    });
  }

  openBuyDialog(item: any): void {
    const dialogRef = this.dialog.open(BuyComponent, {
      panelClass: 'dialog-responsive',
      data: item,
    });
  }

  openPlantDialog(): void {
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
    const dialogRef = this.dialog.open(PlantComponent, {
      panelClass: 'dialog-responsive',
      data: {
        branches: tree,
        gems: this.gems,
      },
    });
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((reset: boolean) => {
      if (reset) {
        this.gems = 0;
      }
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

  increaseGems($event: number): void {
    this.gems += $event;
  }

  resetTree(): void {
    this.kingdomTree = JSON.parse(JSON.stringify(this.originalTree));
    this.gems = 0;
  }

}
