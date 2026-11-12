import { Component, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, map, of, startWith } from 'rxjs';
import { NavigationEnd } from '@angular/router';

interface Sin { number: number; name: string; letter: string; title: string; description: string; origin: string; slug: string; }
interface Category { numeral: string; slug: string; title: string; subtitle: string; range: string; emblem: string; sins: Sin[]; }

@Component({
  selector: 'app-root', standalone: true, imports: [RouterLink],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private categoriesSignal = toSignal(this.http.get<Category[]>('http://localhost:3000/api/categories').pipe(catchError(() => of([]))), { initialValue: [] as Category[] });
  private url = toSignal(this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), map((event) => event.urlAfterRedirects), startWith(this.router.url)), { initialValue: this.router.url });
  categories = this.categoriesSignal;
  private slug = computed(() => this.url().split('?')[0].split('/').filter(Boolean).at(-1) ?? '');
  category = computed(() => this.categories().find((item) => item.slug === this.slug()));
  sin = computed(() => this.categories().flatMap((item) => item.sins).find((item) => item.slug === this.slug()));
  view = computed(() => this.url().startsWith('/category/') ? 'category' : this.url().startsWith('/sin/') ? 'sin' : 'home');
  activeIndex = computed(() => this.categories().findIndex((item) => item.slug === this.slug()));
  openCategory(slug: string) { this.router.navigate(['/category', slug]); }
  categoryForSin(slug: string) { return this.categories().find((age) => age.sins.some((item) => item.slug === slug)); }
}
