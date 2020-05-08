import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CacheService } from 'src/app/services/cache.service';

@Component({
  selector: 'app-encyclopedia',
  templateUrl: './encyclopedia.component.html',
  styleUrls: ['./encyclopedia.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class EncyclopediaComponent implements OnInit {

  search: string = '';
  columns: string[] = [
    'name',
    'attack',
    'defense',
    'life',
    'gold',
    'mana',
    'population',
    'goldKeep',
    'manaKeep',
    'populationKeep'
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
  }
  data: MatTableDataSource<any> = null;

  constructor(
    private firebaseService: FirebaseService,
    private cacheService: CacheService,
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
    ]);
    data = data.reduce((a, b) => a.concat(b), []);
    this.data = new MatTableDataSource(data);
    this.data.paginator = this.paginator;
    this.data.sort = this.sort;
  }

  /*
  ngOnInit() {
    combineLatest([
      this.firebaseService.leftJoin('spells', 'factions', 'faction', 'id', ['skills', 'families', 'categories', 'units', 'resources']),
      this.firebaseService.leftJoin('units', 'factions', 'faction', 'id', ['skills', 'families', 'categories']),
      this.firebaseService.leftJoin('gods', 'factions', 'faction', 'id'),
      this.firebaseService.leftJoin('items', 'factions', 'faction', 'id', ['skills', 'families', 'categories', 'units', 'resources', 'spells']),
      this.firebaseService.leftJoin('structures', 'factions', 'faction', 'id', ['resources']),
      this.firebaseService.leftJoin('resources', 'factions', 'faction', 'id'),
      //this.firebaseService.leftJoin('locations', 'factions', 'faction', 'id'),
      this.firebaseService.leftJoin('skills', 'factions', 'faction', 'id'),
      this.firebaseService.leftJoin('heroes', 'factions', 'faction', 'id', ['skills', 'families', 'categories', 'resources']),
      this.firebaseService.leftJoin('categories', 'factions', 'faction', 'id'),
      this.firebaseService.leftJoin('families', 'factions', 'faction', 'id'),
    ])
    .pipe(
      map(([
        spells,
        units,
        gods,
        items,
        structures,
        resources,
        //locations,
        skills,
        heroes,
        categories,
        families,
      ]) => {
        return [
          ...spells,
          ...units,
          ...gods,
          ...items,
          ...structures,
          ...resources,
          //...locations,
          ...skills,
          ...heroes,
          ...categories,
          ...families,
        ]
      }
    ))
    .pipe(untilDestroyed(this))
    .subscribe(data => {
      this.data = new MatTableDataSource(data.map(row => {
        return {
          ...row,
          attack: 0,
          defense: 0,
          life: 0,
          gold: 0,
          mana: 0,
          population: 0,
          goldKeep: 0,
          manaKeep: 0,
          populationKeep: 0,
        }
      }));
      this.data.paginator = this.paginator;
      this.data.sort = this.sort;
      this.filters.type.options = [...new Set(data.map(row => row.type))].map(type => { return { name: 'type.' + type + '.name', value: type } });
      this.filters.faction.options = [...new Set(data.map(row => row.faction))].map(faction => { return { name: 'faction.' + faction + '.name', value: faction } });
      this.data.filterPredicate = this.createFilter();
      this.applyFilter();
    });
  }
  */

  applyFilter() {
    this.data.filter = JSON.stringify({
      name: this.filters.name.value,
      type: this.filters.type.value,
      faction: this.filters.faction.value,
    });
  }

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function(data: any, filter: string): boolean {
      let filters = JSON.parse(filter);
      return data.name.toLowerCase().includes(filters.name)
        && data.type.toString().toLowerCase().includes(filters.type)
        && data.faction.toLowerCase().includes(filters.faction)
    }
    return filterFunction;
  }

}
