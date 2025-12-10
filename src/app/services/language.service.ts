import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type Language = 'en' | 'my';

interface Translations {
  [key: string]: string | Translations;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = signal<Language>('en');
  private currentLanguage$ = new BehaviorSubject<Language>('en');
  private translationsLoaded$ = new BehaviorSubject<boolean>(false);
  private translationsLoaded = signal<boolean>(false);
  private translations: Translations = {};

  constructor(private http: HttpClient) {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'my')) {
      this.currentLanguage.set(savedLang);
      this.currentLanguage$.next(savedLang);
    }
    this.loadTranslations(this.currentLanguage());
    this.translationsLoaded$.next(false);
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage();
  }

  getCurrentLanguageSignal() {
    return this.currentLanguage.asReadonly();
  }

  getCurrentLanguage$(): Observable<Language> {
    return this.currentLanguage$.asObservable();
  }

  getTranslationsLoaded$(): Observable<boolean> {
    return this.translationsLoaded$.asObservable();
  }

  setLanguage(lang: Language): void {
    if (lang !== 'en' && lang !== 'my') {
      return;
    }
    this.currentLanguage.set(lang);
    localStorage.setItem('language', lang);
    this.translationsLoaded$.next(false);
    this.loadTranslations(lang);
  }

  private loadTranslations(lang: Language): void {
    this.translationsLoaded.set(false);
    const url = `assets/i18n/${lang}.json`;

    this.http.get<Translations>(url)
      .pipe(
        catchError((error) => {
          console.error(`Failed to load translations for ${lang} from ${url}:`, error);
          // Fallback to empty object, app will still work but show keys
          return of({});
        })
      )
      .subscribe({
        next: (translations) => {
          if (translations && Object.keys(translations).length > 0) {
            this.translations = translations;
            this.translationsLoaded.set(true);
            this.translationsLoaded$.next(true);
            this.currentLanguage$.next(lang);
          } else {
            console.warn(`Translations for ${lang} are empty`);
            this.translationsLoaded.set(true);
            this.translationsLoaded$.next(true);
          }
        },
        error: (error) => {
          console.error(`Error loading translations for ${lang}:`, error);
          this.translationsLoaded.set(true);
          this.translationsLoaded$.next(true);
        }
      });
  }

  translate(key: string, params?: { [key: string]: string }): string {
    if (!this.translationsLoaded()) {
      return key;
    }

    const keys = key.split('.');
    let value: any = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return this.interpolate(value, params);
    }

    return value;
  }

  private interpolate(template: string, params: { [key: string]: string }): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  getTranslations(): Observable<Translations> {
    const lang = this.currentLanguage();
    return this.http.get<Translations>(`assets/i18n/${lang}.json`)
      .pipe(
        catchError(() => of({}))
      );
  }
}

