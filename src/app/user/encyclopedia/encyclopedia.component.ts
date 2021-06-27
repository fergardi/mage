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
  table: MatTableDataSource<any> = new MatTableDataSource([]);
  topics: any[] = [];

  constructor(
    private cacheService: CacheService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    public tutorialService: TutorialService,
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
      this.cacheService.getGuilds(),
      this.cacheService.getAttacks(),
    ]);
    data = data.reduce((a: any[], b: any) => a.concat(b), []);
    this.table = new MatTableDataSource(data);
    this.table.paginator = this.paginator;
    this.table.sort = this.sort;
    this.table.sortingDataAccessor = (obj, property) => {
      if (property === 'name') return this.translateService.instant(obj['name']);
      if (property === 'faction') return this.translateService.instant(obj['faction']['name']);
      if (property === 'type') return this.translateService.instant(`type.${obj['type']}.name`);
      return obj[property];
    };
    // this.filters.faction.options = (await this.cacheService.getFactions()).map((faction: any) => ({ name: `faction.${faction.id}.name`, value: faction.id }));
    this.filters.faction.options = this.filters.faction.options.concat(
      [{ id: '', name: 'table.filter.any', image: '/assets/images/factions/grey.png' }],
      await this.cacheService.getFactions(),
    );
    this.filters.faction.value = this.filters.faction.options[0];
    const legendary = new Array({ name: 'category.legendary.name', value: true });
    const types = [...new Set(data.map(row => row.type))].map((type: string) => ({ name: `type.${type}.name`, value: type }));
    const subtypes = [...new Set(data.filter(row => row.subtype).map(row => row.subtype))].map((subtype: string) => ({ name: `type.${subtype}.name`, value: subtype }));
    this.filters.type.options = [legendary, types, subtypes].reduce((a: any[], b: any) => a.concat(b), []); // TODO fix duplicates with types and subtypes
    this.table.filterPredicate = this.createFilter();
    this.applyFilter();
    // topics
    this.topics = [
      { surname: 'kingdom', name: 'city', examples: this.table.data.filter((item: any) => ['barrier', 'node'].includes(item.id)), suffix: '/assets/images/resources/land.png' },
      { surname: 'kingdom', name: 'auction', examples: this.table.data.filter((item: any) => ['shield-light', 'crypt-keeper'].includes(item.id)), suffix: '/assets/images/resources/gold.png' },
      { surname: 'kingdom', name: 'emporium', examples: this.table.data.filter((item: any) => ['magic-compass', 'dragon-egg'].includes(item.id)), suffix: '/assets/images/resources/gem.png' },
      { surname: 'world', name: 'map', examples: this.table.data.filter((item: any) => ['skeleton', 'treasure-chest'].includes(item.id)), suffix: '/assets/images/resources/turn.png' },
      { surname: 'kingdom', name: 'army', examples: this.table.data.filter((item: any) => ['bone-dragon', 'hydra'].includes(item.id)) },
      { surname: 'kingdom', name: 'tavern', examples: this.table.data.filter((item: any) => ['dragon-rider', 'sage'].includes(item.id)) },
      { surname: 'kingdom', name: 'census', examples: [{ name: 'Bot 1', description: 'Bots', type: 'player', image: '/assets/images/factions/black.png', faction: { id: 'black' } }, { name: 'Bot 2', description: 'Bots', type: 'player', image: '/assets/images/factions/white.png', faction: { id: 'white' } }], suffix: '/assets/images/icons/power.png' },
      { surname: 'kingdom', name: 'archive', examples: [{ name: 'Bot 3', description: 'kingdom.report.subject', type: 'report', image: '/assets/images/factions/green.png', faction: { id: 'green' } }, { name: 'Bot 4', description: 'kingdom.auction.subject', type: 'report', image: '/assets/images/factions/blue.png', faction: { id: 'blue' } }] },
      { surname: 'kingdom', name: 'clan', examples: this.table.data.filter((item: any) => ['hunter', 'warrior'].includes(item.id)) },
      { surname: 'kingdom', name: 'sorcery', examples: this.table.data.filter((item: any) => ['fireball', 'locust-swarm'].includes(item.id)), suffix: '/assets/images/resources/mana.png' },
      { surname: 'kingdom', name: 'temple', examples: this.table.data.filter((item: any) => ['death', 'armageddon'].includes(item.id)), suffix: '/assets/images/resources/population.png' },
      { surname: 'user', name: 'encyclopedia', examples: this.table.data.filter((item: any) => ['breath', 'dragon'].includes(item.id)) },
    ];
  }

  applyFilter() {
    this.table.filter = JSON.stringify({
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
        && (!filters.faction || data.faction.id.toLowerCase().includes(filters.faction.id));
    };
    return filterFunction;
  }

  openTomeDialog(tome: any) {
    const dialogRef = this.dialog.open(TomeComponent, {
      panelClass: 'dialog-responsive',
      data: tome,
    });
  }

  clearFilter(): void {
    this.filters.name.value = '';
    this.filters.faction.value = this.filters.faction.options[0];
    this.filters.type.value = [];
    this.table.paginator.pageSize = this.table.paginator.pageSizeOptions[0];
    this.table.paginator.pageIndex = 0;
    if (this.table.sort.active !== 'name' && this.table.sort.direction !== 'asc') {
      this.table.sort.sort({
        id: 'name',
        start: 'asc',
        disableClear: false,
      });
    }
    this.applyFilter();
  }

}
