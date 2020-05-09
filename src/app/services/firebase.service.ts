import { Injectable } from '@angular/core';
import { AngularFirestore, QueryFn } from '@angular/fire/firestore';
import { map, first } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { CacheService, CollectionType } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private angularFirestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private cacheService: CacheService,
    private httpClient: HttpClient,
  ) { }

  joinObject(element: any, subCollection: string, collection: any[]) {
    element[subCollection].forEach((subElement, subElementIndex, subElementArray) => {
      if (typeof subElement === 'string') {
        element[subCollection][subElementIndex] = {
          ...collection.find(el => el['id'] === subElement)
        }
      }
    });
    element[subCollection] = element[subCollection].sort((a, b) => a.name - b.name);
  }

  leftJoin(left: string, right: string, from: string = 'id', to: string = 'id', query: QueryFn = undefined) {
    return combineLatest([
      query === undefined
        ? this.angularFirestore.collection<any>(left).valueChanges({ idField: 'fid' }) // select * from left
        : this.angularFirestore.collection<any>(left, query).valueChanges({ idField: 'fid' }), // select * from left where query
      CollectionType[right] === undefined
        ? this.angularFirestore.collection<any>(right).valueChanges() // left join right on left.from = right.to
        : this.cacheService.get(right) // left join cached right on left.from = right.to
    ]).pipe(
      map(([
        leftCollection,
        rightCollection,
      ]) => {
        rightCollection.forEach(async element => {
          if (element.skills) this.joinObject(element, 'skills', await this.cacheService.getSkills());
          if (element.units) this.joinObject(element, 'units', await this.cacheService.getUnits());
          if (element.categories) this.joinObject(element, 'categories', await this.cacheService.getCategories());
          if (element.families) this.joinObject(element, 'families', await this.cacheService.getFamilies());
          if (element.spells) this.joinObject(element, 'spells', await this.cacheService.getSpells());
          if (element.resources) this.joinObject(element, 'resources', await this.cacheService.getResources());
        });
        return leftCollection.map(leftElement => {
          return {
            ...leftElement,
            join: {
              ...rightCollection.find(rightElement => leftElement[from] === rightElement[to])
            }
          }
        })
      })
    )
  }

  retrieveElementFromPath(path: string) {
    return this.angularFirestore.doc<any>(path).get();
  }

  addElementToCollection(collection: string, element: any, id?: string) {
    console.info(`Adding ${element.name} to ${collection}...`);
    return id
    ? this.angularFirestore.collection<any>(collection).doc<any>(id).set(element)
    : this.angularFirestore.collection<any>(collection).add(element);
  }

  delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  addElementsToCollection(collection: string, elements: any[], master: boolean = false) {
    elements.forEach(async (element, index) => {
      await this.delay(index * 500);
      await this.addElementToCollection(collection, element, master ? element.id : null);
    })
  }

  async importCollectionFromJson(collection: string) {
    this.angularFireAuth.authState.subscribe(user => {
      if (user) {
        console.info(`Loading collection ${collection}...`)
        this.httpClient.get<any[]>(`assets/fixtures/${collection}.json`).pipe(first()).subscribe(elements => {
          this.addElementsToCollection(collection, elements, true);
        });
      }
    });
  }

  async loadCollectionIntoCollection(from: string, to: string) {
    this.angularFireAuth.authState.subscribe(user => {
      this.angularFirestore.collection<any>(`kingdoms/${user.uid}/${to}`).get().subscribe(collection => {
        collection.forEach(element => {
          element.ref.delete()
        });
      });
      this.angularFirestore.collection<any>(from).get().subscribe(collection => {
        collection.forEach(element => {
          this.angularFirestore.collection<any>(`kingdoms/${user.uid}/${to}`).add({
            id: element.data().id,
            quantity: 99,
            turns: 50,
          })
        });
      });
    });
  }

}
