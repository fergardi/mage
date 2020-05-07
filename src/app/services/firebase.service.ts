import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, first } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private angularFirestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private httpClient: HttpClient,
  ) { }

  leftJoin(left: string, right: string, from: string = 'id', to: string = 'id', leftArray: string[] = [], rightArray: string[] = []) {
    return combineLatest([
      this.angularFirestore.collection<any>(left).valueChanges({ idField: 'fid' }),
      this.angularFirestore.collection<any>(right).valueChanges(),
      ...leftArray.map(leftExtra => this.angularFirestore.collection<any>(leftExtra).valueChanges()),
      ...rightArray.map(rightExtra => this.angularFirestore.collection<any>(rightExtra).valueChanges()),
    ]).pipe(
      map((collections) => {
        collections[0].forEach(element => {
          leftArray.forEach((subCollection, subCollectionIndex, subCollectionArray) => {
            if (element[subCollection] && element[subCollection].length) {
              element[subCollection].forEach((subElement, subElementIndex, subElementArray) => {
                if (typeof subElement === 'string') {
                  element[subCollection][subElementIndex] = {
                    ...collections[2 + subCollectionIndex].find(el => el['id'] === subElement)
                  }
                }
              });
              element[subCollection] = element[subCollection].sort((a, b) => a.name - b.name);
            }
          });
        });
        collections[1].forEach(element => {
          rightArray.forEach((subCollection, subCollectionIndex, subCollectionArray) => {
            if (element[subCollection] && element[subCollection].length) {
              element[subCollection].forEach((subElement, subElementIndex, subElementArray) => {
                if (typeof subElement === 'string') {
                  element[subCollection][subElementIndex] = {
                    ...collections[2 + leftArray.length + subCollectionIndex].find(el => el['id'] === subElement)
                  }
                }
              });
              element[subCollection] = element[subCollection].sort((a, b) => a.name - b.name);
            }
          });
        });
        return collections[0].map(leftElement => {
          return {
            ...leftElement,
            join: {
              ...collections[1].find(rightElement => leftElement[from] === rightElement[to])
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
    console.log(`Adding ${element.name} to ${collection}...`);
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
        console.log(`Loading collection ${collection}...`)
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
            quantity: 99
          })
        });
      });
    });
  }

}
