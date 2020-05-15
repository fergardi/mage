import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  explore(id: string, turns: number) {
    return this.httpClient.get(environment.functions.url + `/kingdom/${id}/explore/${turns}`).toPromise();
  }

}
