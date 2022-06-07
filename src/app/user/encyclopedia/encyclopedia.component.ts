import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { CacheService } from 'src/app/services/cache.service';
import { TranslateService } from '@ngx-translate/core';
import { TomeComponent } from './tome.component';
import { MatDialog } from '@angular/material/dialog';
import { TutorialService } from 'src/app/services/tutorial.service';
import { Filter, Tome, Topic } from 'src/app/shared/type/interface.model';

@Component({
  selector: 'app-encyclopedia',
  templateUrl: './encyclopedia.component.html',
  styleUrls: ['./encyclopedia.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
export class EncyclopediaComponent implements OnInit {

  search = '';
  columns = [
    'name',
    'faction',
    'type',
  ];
  filters: Filter = {
    name: {
      type: 'text',
      value: '',
    },
    faction: {
      type: 'select',
      value: '',
      options: [],
    },
    type: {
      type: 'multiple',
      value: [],
      options: [],
    },
  };
  table: MatTableDataSource<Tome> = new MatTableDataSource([]);
  topics: Array<Topic> = [];

  constructor(
    private cacheService: CacheService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    public tutorialService: TutorialService,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  async ngOnInit(): Promise<void> {
    const cached: Array<Array<Tome>> = await Promise.all([
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
      this.cacheService.getGuilds(),
      this.cacheService.getAttacks(),
      this.cacheService.getLocations(),
      this.cacheService.getStores(),
      this.cacheService.getPerks(),
    ]);
    const data = cached.reduce((a, b) => a.concat(b), []);
    this.table = new MatTableDataSource(data);
    this.table.paginator = this.paginator;
    this.table.sort = this.sort;
    this.table.sortingDataAccessor = (obj, property) => {
      if (property === 'name') return this.translateService.instant(obj['name']);
      if (property === 'faction') return this.translateService.instant(obj['faction']['name']);
      if (property === 'type') return this.translateService.instant(`type.${obj['type']}.name`);
      return obj[property];
    };
    this.filters.faction.options = this.filters.faction.options.concat(
      [{ id: '', name: 'table.filter.any', image: '/assets/images/factions/grey.png' }],
      await this.cacheService.getFactions(),
    );
    this.filters.faction.value = this.filters.faction.options[0];
    const legendary = new Array({ name: 'category.legendary.name', value: true });
    const types = [...new Set(data.map((row: any) => row.type))].map((type: string) => ({ name: `type.${type}.name`, value: type }));
    const subtypes = [...new Set(data.filter((row: any) => row.subtype).map((row: any) => row.subtype))].map((subtype: string) => ({ name: `type.${subtype}.name`, value: subtype }));
    this.filters.type.options = [legendary, types, subtypes]
    .reduce((a: any[], b: any) => a.concat(b), [])
    .filter((value: any, index: number, array: any[]) => array.findIndex((element: any) => (element.name === value.name)) === index) // https://stackoverflow.com/a/56757215/2477303
    .sort((a: any, b: any) => this.translateService.instant(a.name).localeCompare(this.translateService.instant(b.name)));
    this.table.filterPredicate = this.createFilter();
    this.topics = [
      { surname: 'kingdom', name: 'city', examples: this.table.data.filter((item: Tome) => ['barrier', 'node'].includes(item.id)), suffix: '/assets/images/resources/land.png' },
      { surname: 'kingdom', name: 'auction', examples: this.table.data.filter((item: Tome) => ['shield-light', 'crypt-keeper'].includes(item.id)), suffix: '/assets/images/resources/gold.png' },
      { surname: 'kingdom', name: 'emporium', examples: this.table.data.filter((item: Tome) => ['magic-compass', 'dragon-egg'].includes(item.id)), suffix: '/assets/images/resources/gem.png' },
      { surname: 'world', name: 'map', examples: this.table.data.filter((item: Tome) => ['graveyard', 'inn'].includes(item.id)) },
      { surname: 'kingdom', name: 'army', examples: this.table.data.filter((item: Tome) => ['bone-dragon', 'iron-golem'].includes(item.id)) },
      { surname: 'kingdom', name: 'tavern', examples: this.table.data.filter((item: Tome) => ['dragon-rider', 'sage'].includes(item.id)) },
      { surname: 'kingdom', name: 'census', examples: [{ name: 'Bot 1', description: 'Bots', type: 'player', image: '/assets/images/factions/black.png', faction: { id: 'black' } }, { name: 'Bot 2', description: 'Bots', type: 'player', image: '/assets/images/factions/white.png', faction: { id: 'white' } }], suffix: '/assets/images/icons/power.png' },
      { surname: 'kingdom', name: 'archive', examples: [{ name: 'Bot 3', description: 'kingdom.report.subject', type: 'report', image: '/assets/images/factions/green.png', faction: { id: 'green' } }, { name: 'Bot 4', description: 'kingdom.auction.subject', type: 'report', image: '/assets/images/factions/blue.png', faction: { id: 'blue' } }] },
      { surname: 'kingdom', name: 'clan', examples: this.table.data.filter((item: Tome) => ['hunter', 'warrior'].includes(item.id)) },
      { surname: 'kingdom', name: 'sorcery', examples: this.table.data.filter((item: Tome) => ['fireball', 'locust-swarm'].includes(item.id)), suffix: '/assets/images/resources/mana.png' },
      { surname: 'kingdom', name: 'temple', examples: this.table.data.filter((item: Tome) => ['death', 'famine'].includes(item.id)), suffix: '/assets/images/spells/grey/armageddon.png' },
      { surname: 'user', name: 'encyclopedia', examples: this.table.data.filter((item: Tome) => ['breath', 'dragon'].includes(item.id)) },
    ];
    this.applyFilter();
  }

  applyFilter(): void {
    this.table.filter = JSON.stringify({
      name: this.filters.name.value,
      type: this.filters.type.value,
      faction: this.filters.faction.value,
    });
  }

  createFilter(): (data: Tome, filter: string) => boolean {
    const normalize = /[\u0300-\u036f]/g;
    const filterFunction = (data: Tome, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return (this.translateService.instant(data.name).toLowerCase().normalize('NFD').replace(normalize, '').includes(filters.name.toLowerCase().normalize('NFD').replace(normalize, ''))
        || this.translateService.instant(data.description).toLowerCase().normalize('NFD').replace(normalize, '').includes(filters.name.toLowerCase().normalize('NFD').replace(normalize, '')))
        && (!filters.type.length || filters.type.every((element: Tome) => [data.type, data.subtype, data.legendary].includes(element)))
        && (!filters.faction || data.faction.id.toLowerCase().includes(filters.faction.id));
    };
    return filterFunction;
  }

  openTomeDialog(tome: Tome): void {
    const dialogRef = this.dialog.open(TomeComponent, {
      panelClass: 'dialog-responsive',
      data: tome,
    });
  }

  clearFilter(): void {
    this.filters.name.value = '';
    this.filters.faction.value = this.filters.faction.options[0];
    this.filters.type.value = [];
    if (this.table.paginator) {
      this.table.paginator.pageSize = this.table.paginator.pageSizeOptions[0];
      this.table.paginator.pageIndex = 0;
    }
    if (this.table.sort) {
      if (this.table.sort.active !== 'name' && this.table.sort.direction !== 'asc') {
        this.table.sort.sort({
          id: 'name',
          start: 'asc',
          disableClear: false,
        });
      }
    }
    this.applyFilter();
  }

}
