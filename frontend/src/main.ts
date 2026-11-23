import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';

const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'category/:slug', component: AppComponent },
  { path: 'sin/:slug', component: AppComponent },
  { path: 'about', component: AppComponent },
  { path: 'socials', component: AppComponent },
  { path: 'skills', component: AppComponent },
  { path: 'projects', component: AppComponent },
  { path: 'project/:slug', component: AppComponent },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, { providers: [provideRouter(routes), provideHttpClient()] }).catch((error) => console.error(error));
