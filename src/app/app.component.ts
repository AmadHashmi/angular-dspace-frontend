import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DspaceService } from './services/dspace.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    // RouterOutlet,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'angular-dspace-frontend';
  constructor(private dspaceService: DspaceService) {}
  ngOnInit(): void {
    this.dspaceService.getCommunities().subscribe((communities) => {
      console.log(communities);
    });

    this.dspaceService.getCollections().subscribe((collections) => {
      console.log(collections);
    });

    this.dspaceService.getItems().subscribe((items) => {
      console.log(items);
    });
  }
}
