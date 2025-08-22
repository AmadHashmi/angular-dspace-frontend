import { Component } from '@angular/core';
import { DspaceService } from '../../services/dspace.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-collection-list',
  standalone: true,
  imports: [],
  templateUrl: './collection-list.component.html',
  styleUrl: './collection-list.component.css',
})
export class CollectionListComponent {
  collections: any[] = [];
  community: any = null;
  loading = true;
  error: string | null = null;
  communityId: string = '';

  constructor(
    private dspaceService: DspaceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.communityId = params.get('id') || '';
      this.loadCollections();
    });
  }

  loadCollections() {
    this.loading = true;
    this.error = null;

    // First get the community details
    this.dspaceService.getCommunities().subscribe({
      next: (response) => {
        this.community = response._embedded.communities.find(
          (comm: any) => comm.uuid === this.communityId
        );

        if (this.community) {
          // Now load collections for this community
          this.dspaceService.getCollections(this.community).subscribe({
            next: (collectionsResponse) => {
              this.collections =
                collectionsResponse._embedded?.collections || [];
              this.loading = false;
            },
            error: (collectionsError) => {
              this.error = 'Failed to load collections';
              this.loading = false;
              console.error('Collections error:', collectionsError);
            },
          });
        } else {
          this.error = 'Community not found';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Failed to load community details';
        this.loading = false;
        console.error('Community error:', error);
      },
    });
  }
  goToItemsList(collection: any) {
    this.router.navigate(['/collection', collection.uuid, 'items']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
