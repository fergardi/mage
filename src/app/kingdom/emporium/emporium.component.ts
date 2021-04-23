import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { CacheService } from 'src/app/services/cache.service';
import { MatDialog } from '@angular/material/dialog';
import { BuyComponent } from './buy.component';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { LoadingService } from 'src/app/services/loading.service';
import { TutorialService } from 'src/app/services/tutorial.service';

@Component({
  selector: 'app-emporium',
  templateUrl: './emporium.component.html',
  styleUrls: ['./emporium.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
// @UntilDestroy()
export class EmporiumComponent implements OnInit {

  uid: string = this.store.selectSnapshot(AuthState.getUserUID);
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
    this.emporiumPacks = (await this.cacheService.getPacks()).sort((a, b) => a.quantity - b.quantity);
    this.tutorialService.ready();
  }

  openBuyDialog(item: any): void {
    const dialogRef = this.dialog.open(BuyComponent, {
      panelClass: 'dialog-responsive',
      data: item,
    });
  }

}
