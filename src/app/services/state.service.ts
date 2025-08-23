import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Community {
  uuid: string;
  name: string;
  _links: any;
  [key: string]: any;
}

export interface Collection {
  uuid: string;
  name: string;
  _links: any;
  [key: string]: any;
}

export interface Item {
  uuid: string;
  metadata: any;
  _links: any;
  [key: string]: any;
}

export interface PaginationInfo {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface AppState {
  communities: Community[];
  activeCommunity: Community | null;
  activeCollection: Collection | null;
  collections: Collection[];
  items: Item[];
  loading: boolean;
  error: string | null;
  // Pagination for communities
  communitiesPagination: PaginationInfo | null;
  communitiesCurrentPage: number;
  communitiesPageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private initialState: AppState = {
    communities: [],
    activeCommunity: null,
    activeCollection: null,
    collections: [],
    items: [],
    loading: false,
    error: null,
    // Pagination initial state
    communitiesPagination: null,
    communitiesCurrentPage: 0,
    communitiesPageSize: 10,
  };

  private stateSubject = new BehaviorSubject<AppState>(this.initialState);
  public state$ = this.stateSubject.asObservable();

  constructor() {}

  getCurrentState(): AppState {
    return this.stateSubject.value;
  }

  hasCommunity(uuid: string): boolean {
    const state = this.getCurrentState();
    return state.communities.some((comm) => comm.uuid === uuid);
  }

  hasCollection(uuid: string): boolean {
    const state = this.getCurrentState();
    return state.collections.some((col) => col.uuid === uuid);
  }

  getCommunity(uuid: string): Community | null {
    const state = this.getCurrentState();
    return state.communities.find((comm) => comm.uuid === uuid) || null;
  }

  getCollection(uuid: string): Collection | null {
    const state = this.getCurrentState();
    return state.collections.find((col) => col.uuid === uuid) || null;
  }

  setCommunities(communities: Community[], pagination?: PaginationInfo): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      communities,
      communitiesPagination: pagination || null,
      loading: false,
      error: null,
    });
  }

  setCommunitiesPagination(pagination: PaginationInfo): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      communitiesPagination: pagination,
    });
  }

  setCommunitiesCurrentPage(page: number): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      communitiesCurrentPage: page,
    });
  }

  setCommunitiesPageSize(size: number): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      communitiesPageSize: size,
      communitiesCurrentPage: 0,
    });
  }

  setActiveCommunity(community: Community): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      activeCommunity: community,
      activeCollection: null,
      collections: [],
      items: [],
      loading: false,
      error: null,
    });
  }

  setCollections(collections: Collection[]): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      collections,
      loading: false,
      error: null,
    });
  }

  setActiveCollection(collection: Collection): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      activeCollection: collection,
      items: [],
      loading: false,
      error: null,
    });
  }

  setItems(items: Item[]): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      items,
      loading: false,
      error: null,
    });
  }

  setLoading(loading: boolean): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      loading,
    });
  }

  setError(error: string | null): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      error,
      loading: false,
    });
  }

  clearError(): void {
    const currentState = this.getCurrentState();
    this.stateSubject.next({
      ...currentState,
      error: null,
    });
  }

  reset(): void {
    this.stateSubject.next(this.initialState);
  }
}
