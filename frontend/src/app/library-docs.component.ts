import { Component, computed, inject, input, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';

export interface LibraryProjectPage {
  name: string;
  slug: string;
  sinSlug: string;
  subtitle: string;
  description: string;
  stack: string[];
  repository: string;
  language?: string;
  dependencyLabel?: string;
  gettingStartedHeading?: string;
  gettingStartedDescription?: string;
  dependencySnippet?: string;
  quickstartLabel?: string;
  quickstartDescription?: string;
  apiDocPath?: string;
  quickstartSnippet?: string;
}

interface ApiDocItem {
  id: string;
  crate: string;
  module: string;
  name: string;
  kind: string;
  signature: string;
  summary: string;
  path: string;
  example: string;
  parent?: string;
}

interface ApiCrate { name: string; slug: string; summary: string; count: number; }
interface ApiCatalog { crates: ApiCrate[]; items: ApiDocItem[]; }
interface ApiTypeGroup { item: ApiDocItem; members: ApiDocItem[]; }
interface ApiModuleGroup { name: string; slug: string; count: number; functions: ApiDocItem[]; types: ApiTypeGroup[]; other: ApiDocItem[]; }
interface ApiCrateGroup { crate: ApiCrate; modules: ApiModuleGroup[]; }
interface ApiSearchResult { item: ApiDocItem; score: number; crate: ApiCrate; module: ApiModuleGroup; }

const EMPTY_CATALOG: ApiCatalog = { crates: [], items: [] };

@Component({
  selector: 'app-library-docs',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './library-docs.component.html'
})
export class LibraryDocsComponent {
  private http = inject(HttpClient);
  project = input.required<LibraryProjectPage>();
  query = signal('');
  expandedCrate = signal('');
  expandedModule = signal('');
  expandedType = signal('');
  catalog = toSignal(toObservable(this.project).pipe(
    switchMap((project) => project.apiDocPath ? this.http.get<ApiCatalog>(project.apiDocPath).pipe(catchError(() => of(EMPTY_CATALOG))) : of(EMPTY_CATALOG))
  ), { initialValue: EMPTY_CATALOG });

  crateDocs = computed<ApiCrateGroup[]>(() => this.catalog().crates.map((crate) => {
    const items = this.catalog().items.filter((item) => item.crate === crate.name);
    const modules = [...new Set(items.map((item) => item.module))].sort((a, b) => a.localeCompare(b)).map((name) => {
      const inModule = items.filter((item) => item.module === name);
      const types = inModule.filter((item) => this.isType(item.kind));
      const typeGroups = types.map((item) => ({
        item,
        members: inModule.filter((candidate) => candidate.parent === item.name && candidate.id !== item.id)
      }));
      const nestedIds = new Set(typeGroups.flatMap((group) => group.members.map((item) => item.id)));
      const functions = inModule.filter((item) => item.kind === 'function' || item.kind === 'macro');
      const other = inModule.filter((item) => !this.isType(item.kind) && !nestedIds.has(item.id) && !functions.some((fn) => fn.id === item.id));
      return { name, slug: `${crate.slug}-${name.replaceAll('::', '-').replaceAll(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`, count: inModule.length, functions, types: typeGroups, other };
    });
    return { crate, modules };
  }));

  matchingItems = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    if (!query) return [];
    return this.catalog().items
      .map((item) => ({ item, score: this.searchScore(query, `${item.name} ${item.kind} ${item.parent ?? ''} ${item.crate} ${item.module} ${item.signature} ${item.summary} ${item.path}`) }))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
  });
  searchResults = computed<ApiSearchResult[]>(() => this.matchingItems().slice(0, 24).flatMap((match) => {
    const crateDoc = this.crateDocs().find((entry) => entry.crate.name === match.item.crate);
    const module = crateDoc?.modules.find((entry) => entry.name === match.item.module);
    return crateDoc && module ? [{ ...match, crate: crateDoc.crate, module }] : [];
  }));

  setQuery(event: Event) { this.query.set((event.target as HTMLInputElement).value); }
  isType(kind: string) { return ['struct', 'enum', 'trait'].includes(kind.toLowerCase()); }
  typeDeclaration(group: ApiTypeGroup): string {
    const { item, members } = group;
    const fields = members.filter((member) => member.kind === 'field');
    const variants = members.filter((member) => member.kind === 'variant');
    const methods = members.filter((member) => ['method', 'trait method', 'associated type'].includes(member.kind));
    const lines = [`// ${item.summary}`, item.signature];
    if (this.project().language?.toLowerCase() === 'go') {
      if (item.kind === 'enum' && variants.length) lines.push('const (', ...variants.flatMap((variant) => [`    // ${variant.summary}`, `    ${variant.signature}`]), ')');
      return lines.join('\n');
    }
    if (item.kind === 'struct' && fields.length) lines.push('{', ...fields.flatMap((field) => [`    // ${field.summary}`, `    ${field.signature}`]), '}');
    if (item.kind === 'enum' && variants.length) lines.push('{', ...variants.flatMap((variant) => [`    // ${variant.summary}`, `    ${variant.signature.replace(/^pub\s+/, '')}`]), '}');
    if (item.kind === 'trait' && methods.length) lines.push('{', ...methods.flatMap((method) => [`    // ${method.summary}`, `    ${method.signature}`]), '}');
    return lines.join('\n');
  }
  typeMethods(group: ApiTypeGroup) { return group.members.filter((item) => ['method', 'trait method', 'associated type'].includes(item.kind)); }
  typeFields(group: ApiTypeGroup) { return group.members.filter((item) => item.kind === 'field'); }
  typeVariants(group: ApiTypeGroup) { return group.members.filter((item) => item.kind === 'variant'); }
  navigateTo(event: Event, item: ApiDocItem, crate: ApiCrate, module: ApiModuleGroup) {
    event.preventDefault();
    this.expandedCrate.set(crate.slug);
    this.expandedModule.set(module.slug);
    const parentType = item.parent ? module.types.find((group) => group.item.name === item.parent) : undefined;
    this.expandedType.set(parentType?.item.id ?? (this.isType(item.kind) ? item.id : ''));
    this.query.set('');
    window.setTimeout(() => {
      const hash = `#api-${item.id}`;
      window.history.replaceState(null, '', hash);
      document.getElementById(`api-${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }
  jumpToCrate(crate: ApiCrate) {
    this.expandedCrate.set(crate.slug);
    window.setTimeout(() => document.getElementById(`crate-${crate.slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  private searchScore(query: string, text: string): number {
    const target = text.toLocaleLowerCase();
    if (target.includes(query)) return 4;
    const words = query.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    const targetWords = target.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    let matched = 0;
    for (const word of words) {
      if (targetWords.some((candidate) => candidate.startsWith(word))) { matched++; continue; }
      const maxDistance = word.length >= 7 ? 2 : word.length >= 4 ? 1 : 0;
      if (maxDistance && targetWords.some((candidate) => this.editDistance(word, candidate) <= maxDistance)) matched++;
    }
    return matched === words.length ? 1 : 0;
  }

  private editDistance(a: string, b: string): number {
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i++) {
      let diagonal = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const above = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
        diagonal = above;
      }
    }
    return row[b.length];
  }
}
