// This file is the same as bmlt-root-server/src/resources/js/stores/localization.ts
// except that the phrases are different, and 'settings' is locally defined

import LocalizedStrings from 'localized-strings';

import { writable } from 'svelte/store';
import type { Subscriber, Unsubscriber } from 'svelte/store';

const settings = { defaultLanguage: 'en' };

/*eslint sort-keys: ["error", "asc", {caseSensitive: false}]*/
const strings = new (LocalizedStrings as any)({
  de: {
    field: 'Field',
    formatLanguage: 'Format language',
    getServiceBodies: 'Get Service Bodies',
    getSearchResults: 'Get Meeting Search Results',
    getFormats: 'Get Formats',
    getChanges: 'Get Changes',
    getChangesBetween: 'Get changes between (inclusive)',
    getChangesForMeeting: 'Get changes for a meeting with this ID',
    getFieldKeys: 'Get a List of Available Field Keys',
    getFieldValues: 'Get a List of Specific Field Values',
    getNAWSDump: 'Get a NAWS Format Export',
    getServerInfo: 'Get Server Information',
    getCoverageArea: 'Get Geographic Coverage Area',
    intro: `This is a re-implementation of the semantic workshop for the BMLT root server, intended to work
      with the new Svelte UI. It is currently a standalone app in SvelteKit. It could remain as a separate
      app, or later also be linked with the BMLT root server.`,
    language: 'Sprache',
    noServiceBodySelected: 'No service body selected',
    operation: 'Operation',
    responseURL: 'Response URL',
    serverError: 'Server error',
    serverLanguage: 'Server language',
    serviceBody: 'Service body',
    showAllFormats: 'Show all formats',
    title: 'BMLT Semantische Werkstatt',
    updateURL: 'Update root server URL',
    urlPlaceholder: 'enter root server URL'
  },
  en: {
    field: 'Field',
    formatLanguage: 'Format language',
    getServiceBodies: 'Get Service Bodies',
    getSearchResults: 'Get Meeting Search Results',
    getFormats: 'Get Formats',
    getChanges: 'Get Changes',
    getChangesBetween: 'Get changes between (inclusive)',
    getChangesForMeeting: 'Get changes for a meeting with this ID',
    getFieldKeys: 'Get a List of Available Field Keys',
    getFieldValues: 'Get a List of Specific Field Values',
    getNAWSDump: 'Get a NAWS Format Export',
    getServerInfo: 'Get Server Information',
    getCoverageArea: 'Get Geographic Coverage Area',
    intro: `This is a re-implementation of the semantic workshop for the BMLT root server, intended to work
      with the new Svelte UI. It is currently a standalone app in SvelteKit. It could remain as a separate
      app, or later also be linked with the BMLT root server.`,
    language: 'Language',
    noServiceBodySelected: 'No service body selected',
    operation: 'Operation',
    responseURL: 'Response URL',
    serverError: 'Server error',
    serverLanguage: 'Server language',
    serviceBody: 'Service body',
    showAllFormats: 'Show all formats',
    title: 'BMLT Semantic Workshop',
    updateURL: 'Update root server URL',
    urlPlaceholder: 'enter root server URL'
  }
});

const LANGUAGE_STORAGE_KEY = 'bmltLanguage';

class Translations {
  private store = writable(strings);

  constructor() {
    const language = localStorage.getItem(LANGUAGE_STORAGE_KEY) || settings.defaultLanguage;
    strings.setLanguage(language);
    this.store.set(strings);
  }

  get subscribe(): (run: Subscriber<typeof strings>) => Unsubscriber {
    return this.store.subscribe;
  }

  getLanguage(): string {
    return strings.getLanguage();
  }

  getAvailableLanguages(): string[] {
    return strings.getAvailableLanguages();
  }

  setLanguage(language: string): void {
    strings.setLanguage(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    this.store.set(strings);
  }

  getString(key: string, language?: string): string {
    return strings.getString(key, language ?? this.getLanguage());
  }

  getTranslationsForLanguage(language: string | null = null): Record<string, string> {
    return strings.getContent()[language ?? this.getLanguage()];
  }

  getTranslationsForAllLanguages(): Record<string, Record<string, string>> {
    return strings.getContent();
  }
}

export const translations = new Translations();
