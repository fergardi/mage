import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { CacheService } from 'src/app/services/cache.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-encyclopedia',
  templateUrl: './encyclopedia.component.html',
  styleUrls: ['./encyclopedia.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
export class EncyclopediaComponent implements OnInit {

  search: string = '';
  columns: string[] = [
    'name',
    'faction',
    'type',
  ];
  filters: any = {
    name: {
      type: 'text',
      value: '',
    },
    type: {
      type: 'select',
      value: '',
      options: [],
    },
    faction: {
      type: 'select',
      value: '',
      options: [],
    }
  };
  data: MatTableDataSource<any> = null;

  constructor(
    private cacheService: CacheService,
    private translateService: TranslateService,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  async ngOnInit() {
    let data = await Promise.all([
      this.cacheService.getSkills(),
      this.cacheService.getUnits(),
      this.cacheService.getSpells(),
      this.cacheService.getItems(),
      this.cacheService.getGods(),
      this.cacheService.getStructures(),
      this.cacheService.getHeroes(),
      this.cacheService.getResources(),
      this.cacheService.getFamilies(),
    ]);
    data = data.reduce((a, b) => a.concat(b), []);
    this.data = new MatTableDataSource(data);
    this.data.paginator = this.paginator;
    this.data.sort = this.sort;
    this.filters.type.options = [...new Set(data.map(row => row.type))].map(type => { return { name: 'type.' + type + '.name', value: type } });
    this.filters.faction.options = [...new Set(data.map(row => row.faction))].map(faction => { return { name: 'faction.' + faction + '.name', value: faction } });
    this.data.filterPredicate = this.createFilter();
    this.applyFilter();
  }

  applyFilter() {
    this.data.filter = JSON.stringify({
      name: this.filters.name.value,
      type: this.filters.type.value,
      faction: this.filters.faction.value,
    });
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = (data: any, filter: string): boolean => {
      let filters = JSON.parse(filter);
      return this.translateService.instant(data.name).toLowerCase().includes(filters.name)
        && data.type.toString().toLowerCase().includes(filters.type)
        && data.faction.toLowerCase().includes(filters.faction)
    }
    return filterFunction;
  }

}
