import { Component, OnInit, ViewChild } from '@angular/core';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';
import { Store } from '@ngxs/store';
import { CacheService } from 'src/app/services/cache.service';
import { AuthState } from 'src/app/shared/auth/auth.state';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-clan',
  templateUrl: './clan.component.html',
  styleUrls: ['./clan.component.scss'],
  animations: [
    fadeInOnEnterAnimation({ duration: 250, delay: 250 }),
    fadeOutOnLeaveAnimation({ duration: 250, delay: 250 }),
  ],
})
export class ClanComponent implements OnInit {

  kingdomGuilds: any[] = [];
  kingdomGuild: any = this.store.selectSnapshot(AuthState.getKingdomGuild);
  kingdomClan: any = this.store.selectSnapshot(AuthState.getKingdomClan);
  selectedGuild: any = null;
  columns = ['name', 'actions'];
  filters: any = {
    name: {
      type: 'text',
      value: '',
    },
  };
  data: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private store: Store,
    private cacheService: CacheService,
    private angularFirestore: AngularFirestore,
  ) { }

  async ngOnInit() {
    const guilds = await this.cacheService.getGuilds();
    this.kingdomGuilds = guilds;
    const snapshot = await this.angularFirestore.collection<any>('clans').get().toPromise();
    this.data = new MatTableDataSource(snapshot.docs.map((clan: any) => {
      return {
        ...clan.data(),
        fid: clan.id,
      };
    }));
    this.data.paginator = this.paginator;
    this.data.sortingDataAccessor = (obj, property) => property === 'name' ? obj['power'] : obj[property];
    this.data.sort = this.sort;
    this.data.filterPredicate = this.createFilter();
    this.applyFilter();
  }

  applyFilter() {
    this.data.filter = JSON.stringify({
      name: this.filters.name.value,
    });
  }

  createFilter(): (data: any, filter: string) => boolean {
    const filterFunction = (data: any, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return data.name.toLowerCase().includes(filters.name);
    };
    return filterFunction;
  }

  joinClan(clan: any): void {
    // TODO
  }

  leaveClan(clan: any): void {
    // TODO
  }

  foundClan(): void {
    // TODO
  }

}
