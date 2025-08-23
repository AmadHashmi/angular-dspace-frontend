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
  communitiesPagination: PaginationInfo | null;
  communitiesCurrentPage: number;
  communitiesPageSize: number;
  collectionsPagination: PaginationInfo | null;
  collectionsCurrentPage: number;
  collectionsPageSize: number;
  itemsPagination: PaginationInfo | null;
  itemsCurrentPage: number;
  itemsPageSize: number;
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
    communitiesPagination: null,
    communitiesCurrentPage: 0,
    communitiesPageSize: 10,
    collectionsPagination: null,
    collectionsCurrentPage: 0,
    collectionsPageSize: 10,
    itemsPagination: null,
    itemsCurrentPage: 0,
    itemsPageSize: 10,
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
    console.log('Setting communities:', {
      communities: communities.length,
      pagination,
      currentPage: currentState.communitiesCurrentPage,
      pageSize: currentState.communitiesPageSize,
    });
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
    console.log('Setting communities pagination:', pagination);
    this.stateSubject.next({
      ...currentState,
      communitiesPagination: pagination,
    });
  }

  setCommunitiesCurrentPage(page: number): void {
    const currentState = this.getCurrentState();
    console.log('Setting communities current page:', page);
    this.stateSubject.next({
      ...currentState,
      communitiesCurrentPage: page,
    });
  }

  setCommunitiesPageSize(size: number): void {
    const currentState = this.getCurrentState();
    console.log('Setting communities page size:', size);
    this.stateSubject.next({
      ...currentState,
      communitiesPageSize: size,
      communitiesCurrentPage: 0,
    });
  }

  setCollectionsPagination(pagination: PaginationInfo): void {
    const currentState = this.getCurrentState();
    console.log('Setting collections pagination:', pagination);
    this.stateSubject.next({
      ...currentState,
      collectionsPagination: pagination,
    });
  }

  setCollectionsCurrentPage(page: number): void {
    const currentState = this.getCurrentState();
    console.log('Setting collections current page:', page);
    this.stateSubject.next({
      ...currentState,
      collectionsCurrentPage: page,
    });
  }

  setCollectionsPageSize(size: number): void {
    const currentState = this.getCurrentState();
    console.log('Setting collections page size:', size);
    this.stateSubject.next({
      ...currentState,
      collectionsPageSize: size,
      collectionsCurrentPage: 0,
    });
  }

  setItemsPagination(pagination: PaginationInfo): void {
    const currentState = this.getCurrentState();
    console.log('Setting items pagination:', pagination);
    this.stateSubject.next({
      ...currentState,
      itemsPagination: pagination,
    });
  }

  setItemsCurrentPage(page: number): void {
    const currentState = this.getCurrentState();
    console.log('Setting items current page:', page);
    this.stateSubject.next({
      ...currentState,
      itemsCurrentPage: page,
    });
  }

  setItemsPageSize(size: number): void {
    const currentState = this.getCurrentState();
    console.log('Setting items page size:', size);
    this.stateSubject.next({
      ...currentState,
      itemsPageSize: size,
      itemsCurrentPage: 0,
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
