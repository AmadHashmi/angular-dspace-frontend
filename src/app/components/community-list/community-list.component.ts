import { Component, OnInit, OnDestroy } from '@angular/core';
import { DspaceService } from '../../services/dspace.service';
import {
  StateService,
  Community,
  PaginationInfo,
} from '../../services/state.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-community-list',
  standalone: true,
  imports: [PaginationComponent],
  templateUrl: './community-list.component.html',
  styleUrl: './community-list.component.css',
})
export class CommunityListComponent implements OnInit, OnDestroy {
  communities: Community[] = [];
  loading = false;
  error: string | null = null;
  pagination: PaginationInfo | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private dspaceService: DspaceService,
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.stateService.state$.subscribe((state) => {
        this.communities = state.communities;
        this.loading = state.loading;
        this.error = state.error;
        this.pagination = state.communitiesPagination;
        this.currentPage = state.communitiesCurrentPage;
        this.pageSize = state.communitiesPageSize;
      })
    );

    const currentState = this.stateService.getCurrentState();
    if (currentState.communities.length === 0) {
      this.loadCommunities();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCommunities(page: number = 0, size: number = this.pageSize) {
    this.stateService.setLoading(true);
    this.stateService.clearError();

    this.dspaceService.getCommunities(page, size).subscribe({
      next: (response) => {
        if (response._embedded && response._embedded.communities) {
          const communities = response._embedded.communities.map(
            (comm: any) => ({
              ...comm,
              name: this.dspaceService.extractName(comm),
            })
          );

          const pagination = this.dspaceService.extractPagination(response);

          this.stateService.setCommunities(communities, pagination);
          this.stateService.setCommunitiesCurrentPage(page);
          this.stateService.setCommunitiesPageSize(size);
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

  onPageChange(page: number) {
    this.loadCommunities(page, this.pageSize);
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.loadCommunities(0, size);
  }

  goToCollectionsList(community: Community) {
    this.stateService.setActiveCommunity(community);

    this.router.navigate(['/community', community.uuid, 'collections']);
  }

  retry() {
    this.loadCommunities(this.currentPage, this.pageSize);
  }
}
