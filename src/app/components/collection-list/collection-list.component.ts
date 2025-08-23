import { Component, OnInit, OnDestroy } from '@angular/core';
import { DspaceService } from '../../services/dspace.service';
import {
  StateService,
  Community,
  Collection,
  PaginationInfo,
} from '../../services/state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-collection-list',
  standalone: true,
  imports: [PaginationComponent],
  templateUrl: './collection-list.component.html',
  styleUrl: './collection-list.component.css',
})
export class CollectionListComponent implements OnInit, OnDestroy {
  collections: Collection[] = [];
  community: Community | null = null;
  loading = true;
  error: string | null = null;
  communityId: string = '';
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
        const newCommunityId = params.get('id') || '';
        if (newCommunityId !== this.communityId) {
          this.communityId = newCommunityId;
          this.loadCollections();
        }
      })
    );

    this.subscription.add(
      this.stateService.state$.subscribe((state) => {
        this.collections = state.collections;
        this.community = state.activeCommunity;
        this.loading = state.loading;
        this.error = state.error;
        this.pagination = state.collectionsPagination;
        this.currentPage = state.collectionsCurrentPage;
        this.pageSize = state.collectionsPageSize;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCollections(page: number = 0, size: number = this.pageSize) {
    this.stateService.setLoading(true);
    this.stateService.clearError();

    const currentState = this.stateService.getCurrentState();
    if (
      currentState.activeCommunity &&
      currentState.activeCommunity.uuid === this.communityId
    ) {
      if (currentState.collections.length === 0 || page !== 0) {
        this.fetchCollections(currentState.activeCommunity, page, size);
      } else {
        this.stateService.setLoading(false);
      }
    } else {
      this.findCommunityAndLoadCollections(page, size);
    }
  }

  private findCommunityAndLoadCollections(page: number = 0, size: number = 10) {
    const currentState = this.stateService.getCurrentState();

    if (this.stateService.hasCommunity(this.communityId)) {
      const community = this.stateService.getCommunity(this.communityId);
      if (community) {
        this.stateService.setActiveCommunity(community);
        this.fetchCollections(community, page, size);
        return;
      }
    }

    if (currentState.communities.length === 0) {
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

            const community = communities.find(
              (comm: any) => comm.uuid === this.communityId
            );
            if (community) {
              this.stateService.setActiveCommunity(community);
              this.fetchCollections(community, page, size);
            } else {
              this.stateService.setError('Community not found');
            }
          } else {
            this.stateService.setError('No communities found');
          }
        },
        error: (error) => {
          this.stateService.setError('Failed to load communities');
          console.error('Error loading communities:', error);
        },
      });
    } else {
      const community = currentState.communities.find(
        (comm) => comm.uuid === this.communityId
      );
      if (community) {
        this.stateService.setActiveCommunity(community);
        this.fetchCollections(community, page, size);
      } else {
        this.stateService.setError('Community not found');
      }
    }
  }

  private fetchCollections(
    community: Community,
    page: number = 0,
    size: number = 10
  ) {
    this.dspaceService.getCollections(community, page, size).subscribe({
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

          const pagination =
            this.dspaceService.extractPagination(collectionsResponse);

          this.stateService.setCollections(collections);
          this.stateService.setCollectionsPagination(pagination);
          this.stateService.setCollectionsCurrentPage(page);
          this.stateService.setCollectionsPageSize(size);

          this.currentPage = page;
          this.pageSize = size;
        } else {
          this.stateService.setCollections([]);
        }
      },
      error: (collectionsError) => {
        this.stateService.setError('Failed to load collections');
        console.error('Collections error:', collectionsError);
      },
    });
  }

  onPageChange(page: number) {
    console.log('Collections page change requested:', page);
    this.loadCollections(page, this.pageSize);
  }

  onPageSizeChange(size: number) {
    console.log('Collections page size change requested:', size);
    this.pageSize = size;
    this.loadCollections(0, size);
  }

  goToItemsList(collection: Collection) {
    this.stateService.setActiveCollection(collection);

    this.router.navigate(['/collection', collection.uuid, 'items']);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  retry() {
    this.loadCollections(this.currentPage, this.pageSize);
  }
}
