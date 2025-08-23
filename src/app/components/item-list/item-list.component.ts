import { Component, OnInit, OnDestroy } from '@angular/core';
import { DspaceService } from '../../services/dspace.service';
import {
  StateService,
  Community,
  Collection,
  Item,
} from '../../services/state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [],
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
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadItems() {
    this.stateService.setLoading(true);
    this.stateService.clearError();

    const currentState = this.stateService.getCurrentState();
    if (
      currentState.activeCollection &&
      currentState.activeCollection.uuid === this.collectionId
    ) {
      if (currentState.items.length === 0) {
        this.fetchItems(currentState.activeCollection);
      } else {
        this.stateService.setLoading(false);
      }
    } else {
      this.findCollectionAndLoadItems();
    }
  }

  private findCollectionAndLoadItems() {
    const currentState = this.stateService.getCurrentState();

    if (this.stateService.hasCollection(this.collectionId)) {
      const collection = this.stateService.getCollection(this.collectionId);
      if (collection) {
        this.stateService.setActiveCollection(collection);
        this.fetchItems(collection);
        return;
      }
    }

    if (currentState.collections.length === 0) {
      this.loadCommunitiesAndFindCollection();
    } else {
      const collection = currentState.collections.find(
        (col) => col.uuid === this.collectionId
      );
      if (collection) {
        this.stateService.setActiveCollection(collection);
        this.fetchItems(collection);
      } else {
        this.stateService.setError('Collection not found');
      }
    }
  }

  private loadCommunitiesAndFindCollection() {
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

          this.findCollectionInCommunities(communities);
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

  private findCollectionInCommunities(communities: Community[]) {
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

              this.fetchItems(collection);
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

  private fetchItems(collection: Collection) {
    this.dspaceService.getItems(collection).subscribe({
      next: (itemsResponse) => {
        if (itemsResponse._embedded && itemsResponse._embedded.items) {
          const items = itemsResponse._embedded.items.map((item: any) => ({
            ...item,
            name: this.dspaceService.extractName(item),
          }));
          this.stateService.setItems(items);
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

  getItemTitle(item: Item): string {
    return this.dspaceService.extractName(item);
  }

  getItemDescription(item: Item): string {
    return this.dspaceService.extractDescription(item);
  }

  getItemDate(item: Item): string {
    return this.dspaceService.extractDate(item);
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
    this.loadItems();
  }
}
