import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { CacheService } from 'src/app/services/cache.service';
import { TranslateService } from '@ngx-translate/core';
import { TomeComponent } from './tome.component';
import { MatDialog } from '@angular/material/dialog';

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
      type: 'multiple',
      value: [],
      options: [],
    },
    faction: {
      type: 'select',
      value: '',
      options: [],
    },
  };
  data: MatTableDataSource<any> = null;

  constructor(
    private cacheService: CacheService,
    private translateService: TranslateService,
    private dialog: MatDialog,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  async ngOnInit(): Promise<void> {
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
      this.cacheService.getCategories(),
    ]);
    data = data.reduce((a, b) => a.concat(b), []);
    this.data = new MatTableDataSource(data);
    this.data.paginator = this.paginator;
    this.data.sort = this.sort;
    this.filters.faction.options = (await this.cacheService.getFactions()).map((faction: any) => ({ name: `faction.${faction.id}.name`, value: faction.id }));
    const legendary = new Array({ name: 'category.legendary.name', value: true });
    const types = [...new Set(data.map(row => row.type))].map((type: string) => ({ name: `type.${type}.name`, value: type }));
    const subtypes = [...new Set(data.filter(row => row.subtype).map(row => row.subtype))].map((subtype: string) => ({ name: `type.${subtype}.name`, value: subtype }));
    this.filters.type.options = [legendary, types, subtypes].reduce((accumulator: any[], option) => accumulator.concat(option), []);
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
    const normalize = /[\u0300-\u036f]/g;
    const filterFunction = (data: any, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return (this.translateService.instant(data.name).toLowerCase().normalize('NFD').replace(normalize, '').includes(filters.name.toLowerCase().normalize('NFD').replace(normalize, ''))
        || this.translateService.instant(data.description).toLowerCase().normalize('NFD').replace(normalize, '').includes(filters.name.toLowerCase().normalize('NFD').replace(normalize, '')))
        && (!filters.type.length || filters.type.every(element => [data.type, data.subtype, data.legendary].includes(element)))
        && data.faction.id.toLowerCase().includes(filters.faction);
    };
    return filterFunction;
  }

  openTomeDialog(tome: any) {
    const dialogRef = this.dialog.open(TomeComponent, {
      panelClass: 'dialog-responsive',
      data: tome,
    });
  }

}
