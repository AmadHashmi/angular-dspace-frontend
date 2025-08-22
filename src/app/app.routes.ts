import { Routes } from '@angular/router';
import { CommunityListComponent } from './components/community-list/community-list.component';
import { CollectionListComponent } from './components/collection-list/collection-list.component';
import { ItemListComponent } from './components/item-list/item-list.component';

export const routes: Routes = [
  { path: '', component: CommunityListComponent },
  { path: 'community/:id/collections', component: CollectionListComponent },
  { path: 'collection/:id/items', component: ItemListComponent },
  { path: '**', redirectTo: '' },
];
