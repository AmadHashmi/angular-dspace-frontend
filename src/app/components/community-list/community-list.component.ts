import { Component, OnInit } from '@angular/core';
import { DspaceService } from '../../services/dspace.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-community-list',
  standalone: true,
  imports: [],
  templateUrl: './community-list.component.html',
  styleUrl: './community-list.component.css',
})
export class CommunityListComponent implements OnInit {
  communities: any[] = [];
  error: string | null = null;
  loading = false;
  constructor(private router: Router, private dspaceService: DspaceService) {}
  ngOnInit(): void {
    this.loadCommunities();
  }

  loadCommunities() {
    this.loading = true;
    this.dspaceService.getCommunities().subscribe({
      next: (response) => {
        this.communities = response._embedded.communities;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load communities';
        this.loading = false;
        console.error('Error', error);
      },
    });
  }

  goToCollectionsList(community: any) {
    this.router.navigate(['/community', community.uuid, 'collections']);
  }
}
