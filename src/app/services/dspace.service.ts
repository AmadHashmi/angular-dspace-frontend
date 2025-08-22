import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
const API_URL = 'http://localhost:8080/server/api';
@Injectable({
  providedIn: 'root',
})
export class DspaceService {
  constructor(private http: HttpClient) {}

  getCommunities(): Observable<any> {
    return this.http.get(`${API_URL}/core/communities`);
  }

  getCollections(community: any): Observable<any> {
    return this.http.get(community._links.collections.href);
  }

  getItems(): Observable<any> {
    return this.http.get(`${API_URL}/core/items`);
  }

  search(query: string): Observable<any> {
    return this.http.get(`${API_URL}/discover/search/objects?query=${query}`);
  }
}
