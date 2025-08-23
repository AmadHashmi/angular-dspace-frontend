import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Community, Collection, Item } from './state.service';

const API_URL = 'http://localhost:8080/server/api';

@Injectable({
  providedIn: 'root',
})
export class DspaceService {
  constructor(private http: HttpClient) {}

  getCommunities(): Observable<any> {
    return this.http.get(`${API_URL}/core/communities`);
  }

  getCollections(community: Community): Observable<any> {
    return this.http.get(community._links.collections.href);
  }

  getItems(collection: Collection): Observable<any> {
    const itemsLink =
      collection._links.items?.href || collection._links.mappedItems?.href;

    if (itemsLink) {
      return this.http.get(itemsLink);
    } else {
      return this.http.get(
        `${API_URL}/core/items/search/findByCollection?uuid=${collection.uuid}`
      );
    }
  }

  search(query: string): Observable<any> {
    return this.http.get(`${API_URL}/discover/search/objects?query=${query}`);
  }

  extractName(entity: any): string {
    if (
      entity.metadata &&
      entity.metadata['dc.title'] &&
      entity.metadata['dc.title'][0]
    ) {
      return entity.metadata['dc.title'][0].value;
    }
    if (entity.name) {
      return entity.name;
    }
    return 'Untitled';
  }

  extractDescription(entity: any): string {
    if (
      entity.metadata &&
      entity.metadata['dc.description'] &&
      entity.metadata['dc.description'][0]
    ) {
      return entity.metadata['dc.description'][0].value;
    }
    return '';
  }

  extractDate(entity: any): string {
    if (
      entity.metadata &&
      entity.metadata['dc.date.issued'] &&
      entity.metadata['dc.date.issued'][0]
    ) {
      return entity.metadata['dc.date.issued'][0].value;
    }
    if (
      entity.metadata &&
      entity.metadata['dc.date'] &&
      entity.metadata['dc.date'][0]
    ) {
      return entity.metadata['dc.date'][0].value;
    }
    return '';
  }
}
