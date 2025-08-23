import { Component, OnInit, OnDestroy } from '@angular/core';
import { DspaceService } from '../../services/dspace.service';
import {
  StateService,
  Community,
  Collection,
  Item,
  PaginationInfo,
} from '../../services/state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [PaginationComponent],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css',
})
export class ItemListComponent implements OnInit, OnDestroy {
  items: Item[] = [];
  collection: Collection | null = null;
  community: Community | null = null;
  loading = true;
  error: string | null = null;
  collectionId: string = '';
  pagination: PaginationInfo | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  private subscription = new Subscription();

  constructor(
    private dspaceService: DspaceService,
    private route: ActivatedRoute,
    private router: Router,
    private stateService: StateService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.route.paramMap.subscribe((params) => {
        const newCollectionId = params.get('id') || '';
        if (newCollectionId !== this.collectionId) {
          this.collectionId = newCollectionId;
          this.loadItems();
        }
      })
    );

    this.subscription.add(
      this.stateService.state$.subscribe((state) => {
        this.items = state.items;
        this.collection = state.activeCollection;
        this.community = state.activeCommunity;
        this.loading = state.loading;
        this.error = state.error;
        this.pagination = state.itemsPagination;
        this.currentPage = state.itemsCurrentPage;
        this.pageSize = state.itemsPageSize;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadItems(page: number = 0, size: number = this.pageSize) {
    this.stateService.setLoading(true);
    this.stateService.clearError();

    const currentState = this.stateService.getCurrentState();
    if (
      currentState.activeCollection &&
      currentState.activeCollection.uuid === this.collectionId
    ) {
      if (currentState.items.length === 0 || page !== 0) {
        this.fetchItems(currentState.activeCollection, page, size);
      } else {
        this.stateService.setLoading(false);
      }
    } else {
      this.findCollectionAndLoadItems(page, size);
    }
  }

  private findCollectionAndLoadItems(page: number = 0, size: number = 10) {
    const currentState = this.stateService.getCurrentState();

    if (this.stateService.hasCollection(this.collectionId)) {
      const collection = this.stateService.getCollection(this.collectionId);
      if (collection) {
        this.stateService.setActiveCollection(collection);
        this.fetchItems(collection, page, size);
        return;
      }
    }

    if (currentState.collections.length === 0) {
      this.loadCommunitiesAndFindCollection(page, size);
    } else {
      const collection = currentState.collections.find(
        (col) => col.uuid === this.collectionId
      );
      if (collection) {
        this.stateService.setActiveCollection(collection);
        this.fetchItems(collection, page, size);
      } else {
        this.stateService.setError('Collection not found');
      }
    }
  }

  private loadCommunitiesAndFindCollection(
    page: number = 0,
    size: number = 10
  ) {
    this.dspaceService.getCommunities().subscribe({
      next: (response) => {
        if (response._embedded && response._embedded.communities) {
          const communities = response._embedded.communities.map(
            (comm: any) => ({
              ...comm,
              name: this.dspaceService.extractName(comm),
            })
          );
          this.stateService.setCommunities(communities);

          this.findCollectionInCommunities(communities, page, size);
        } else {
          this.stateService.setError('No communities found');
        }
      },
      error: (error) => {
        this.stateService.setError('Failed to load communities');
        console.error('Error loading communities:', error);
      },
    });
  }

  private findCollectionInCommunities(
    communities: Community[],
    page: number = 0,
    size: number = 10
  ) {
    let foundCollection: Collection | null = null;
    let foundCommunity: Community | null = null;
    let completedSearches = 0;

    for (const community of communities) {
      this.dspaceService.getCollections(community).subscribe({
        next: (collectionsResponse) => {
          if (
            collectionsResponse._embedded &&
            collectionsResponse._embedded.collections
          ) {
            const collections = collectionsResponse._embedded.collections.map(
              (col: any) => ({
                ...col,
                name: this.dspaceService.extractName(col),
              })
            );

            const collection = collections.find(
              (col: any) => col.uuid === this.collectionId
            );
            if (collection && !foundCollection) {
              foundCollection = collection;
              foundCommunity = community;

              this.stateService.setActiveCommunity(community);
              this.stateService.setCollections(collections);
              this.stateService.setActiveCollection(collection);

              this.fetchItems(collection, page, size);
            }
          }

          completedSearches++;
          if (completedSearches === communities.length && !foundCollection) {
            this.stateService.setError('Collection not found');
          }
        },
        error: (collectionsError) => {
          console.error(
            'Error loading collections for community:',
            collectionsError
          );
          completedSearches++;
          if (completedSearches === communities.length && !foundCollection) {
            this.stateService.setError('Failed to load collection details');
          }
        },
      });
    }
  }

  private fetchItems(
    collection: Collection,
    page: number = 0,
    size: number = 10
  ) {
    this.dspaceService.getItems(collection, page, size).subscribe({
      next: (itemsResponse) => {
        console.log('Items response:', itemsResponse);

        let items = [];
        if (itemsResponse._embedded) {
          if (itemsResponse._embedded.items) {
            items = itemsResponse._embedded.items;
          } else if (itemsResponse._embedded.mappedItems) {
            items = itemsResponse._embedded.mappedItems;
          }
        }

        if (items.length > 0) {
          const processedItems = items.map((item: any) => ({
            ...item,
            name: this.dspaceService.extractName(item),
            author: this.extractAuthor(item),
          }));

          const pagination =
            this.dspaceService.extractPagination(itemsResponse);

          this.stateService.setItems(processedItems);
          this.stateService.setItemsPagination(pagination);
          this.stateService.setItemsCurrentPage(page);
          this.stateService.setItemsPageSize(size);

          this.currentPage = page;
          this.pageSize = size;
        } else {
          this.stateService.setItems([]);
        }
      },
      error: (itemsError) => {
        this.stateService.setError('Failed to load items');
        console.error('Items error:', itemsError);
      },
    });
  }

  private extractAuthor(item: any): string {
    const authorFields = [
      'project.investigator',
      'dc.contributor.author',
      'dc.creator',
      'dc.contributor',
      'dc.publisher',
    ];

    for (const field of authorFields) {
      if (item.metadata && item.metadata[field] && item.metadata[field][0]) {
        return item.metadata[field][0].value;
      }
    }

    return 'Unknown Author';
  }

  onPageChange(page: number) {
    console.log('Items page change requested:', page);
    this.loadItems(page, this.pageSize);
  }

  onPageSizeChange(size: number) {
    console.log('Items page size change requested:', size);
    this.pageSize = size;
    this.loadItems(0, size);
  }

  goBackToCollections() {
    if (this.community) {
      this.router.navigate(['/community', this.community.uuid, 'collections']);
    } else {
      this.router.navigate(['/']);
    }
  }

  goBackToCommunities() {
    this.router.navigate(['/']);
  }

  retry() {
    this.loadItems(this.currentPage, this.pageSize);
  }
}
