import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { Subscription, combineLatest } from 'rxjs';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);
  private subscription?: Subscription;
  private cache: Map<string, string> = new Map();
  private currentLang?: string;

  constructor() {
    this.currentLang = this.languageService.getCurrentLanguage();
    this.subscription = combineLatest([
      this.languageService.getCurrentLanguage$(),
      this.languageService.getTranslationsLoaded$()
    ]).subscribe(([lang, loaded]) => {
      const langChanged = this.currentLang !== lang;
      if (langChanged || loaded) {
        this.cache.clear();
        if (langChanged) {
          this.currentLang = lang;
        }
        this.cdr.markForCheck();
      }
    });
  }

  transform(key: string, params?: { [key: string]: string }): string {
    if (!key) {
      return '';
    }

    const lang = this.languageService.getCurrentLanguage();
    
    if (this.currentLang !== lang) {
      this.cache.clear();
      this.currentLang = lang;
    }

    const cacheKey = `${lang}:${key}:${JSON.stringify(params || {})}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const value = this.languageService.translate(key, params);
    
    if (value && value !== key) {
      this.cache.set(cacheKey, value);
    } else {
      return key;
    }

    return value;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

