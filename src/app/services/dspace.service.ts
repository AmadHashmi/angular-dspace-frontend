import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Community, Collection, Item } from './state.service';

// const API_URL = 'http://localhost:8080/server/api';
const API_URL = 'https://demo.dspace.org/server/api';

@Injectable({
  providedIn: 'root',
})
export class DspaceService {
  constructor(private http: HttpClient) {}

  getCommunities(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(
      `${API_URL}/core/communities?page=${page}&size=${size}`
    );
  }

  getCollections(
    community: Community,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    return this.http.get(
      community._links.collections.href + `?page=${page}&size=${size}`
    );
  }

  getItems(
    collection: Collection,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    const itemsLink =
      collection._links.items?.href || collection._links.mappedItems?.href;

    if (itemsLink) {
      return this.http.get(itemsLink + `?page=${page}&size=${size}`);
    } else {
      return this.http.get(
        `${API_URL}/core/items/search/findByCollection?uuid=${collection.uuid}&page=${page}&size=${size}`
      );
    }
  }

  search(query: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(
      `${API_URL}/discover/search/objects?query=${query}&page=${page}&size=${size}`
    );
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

  extractPagination(response: any): any {
    if (response.page) {
      return {
        size: response.page.size,
        totalElements: response.page.totalElements,
        totalPages: response.page.totalPages,
        number: response.page.number,
        first: response.page.first,
        last: response.page.last,
      };
    }
    return null;
  }
}
