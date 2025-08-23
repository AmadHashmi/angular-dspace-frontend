import { Component, OnInit, OnDestroy } from '@angular/core';
import { DspaceService } from '../../services/dspace.service';
import { StateService, Community } from '../../services/state.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-community-list',
  standalone: true,
  imports: [],
  templateUrl: './community-list.component.html',
  styleUrl: './community-list.component.css',
})
export class CommunityListComponent implements OnInit, OnDestroy {
  communities: Community[] = [];
  loading = false;
  error: string | null = null;
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

  loadCommunities() {
    this.stateService.setLoading(true);
    this.stateService.clearError();

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

  goToCollectionsList(community: Community) {
    this.stateService.setActiveCommunity(community);

    this.router.navigate(['/community', community.uuid, 'collections']);
  }

  retry() {
    this.loadCommunities();
  }
}
