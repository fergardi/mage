import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FirebaseService } from 'src/app/services/firebase.service';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { first } from 'rxjs/operators';

export enum TomeType {
  'spell', 'unit', 'hero', 'god', 'building'
}

@Component({
  selector: 'app-encyclopedia',
  templateUrl: './encyclopedia.component.html',
  styleUrls: ['./encyclopedia.component.scss'],
  animations: [fadeInOnEnterAnimation({ duration: 250, delay: 250 })],
})
@UntilDestroy()
export class EncyclopediaComponent implements OnInit {

  columns = ['name', 'type', 'faction'];
  data: MatTableDataSource<any> = null;

  constructor(
    private firebaseService: FirebaseService,
  ) { }

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  ngOnInit() {
    this.firebaseService.leftJoin('spells', 'factions', 'faction', 'id').pipe(first(), untilDestroyed(this)).subscribe(spells => {
      console.log(spells)
      this.data = new MatTableDataSource(spells.map(spell => { return { ...spell, type: TomeType.spell } }));
      this.data.paginator = this.paginator;
      this.data.sort = this.sort;
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.data.filter = filterValue.trim().toLowerCase();
  }

}
