// This file is the same as bmlt-root-server/src/resources/js/stores/localization.ts
// except that the phrases are different, and 'settings' is locally defined

import LocalizedStrings from 'localized-strings';

import { writable } from 'svelte/store';
import type { Subscriber, Unsubscriber } from 'svelte/store';

const settings = { defaultLanguage: 'en' };

/*eslint sort-keys: ["error", "asc", {caseSensitive: false}]*/
const strings = new (LocalizedStrings as any)({
  de: {
    allServiceBodies: 'All service bodies',
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
    none: '- Keine -',
    noParameters: '- no parameters for this operation -',
    operation: 'Operation',
    responseURL: 'Response URL',
    rootServerURL: 'Root server URL',
    serverError: 'Server error',
    serverLanguage: 'Server language',
    serviceBody: 'Service body',
    showAllFormats: 'Show all formats',
    title: 'BMLT Semantische Werkstatt',
    updateURL: 'Update root server URL',
    urlPlaceholder: 'enter root server URL'
  },
  en: {
    allServiceBodies: 'All service bodies',
    and: 'AND',
    chooseOption: 'Choose option ...',
    doesNotHaveFormat: 'Search for meetings that DO NOT have specific formats',
    doesNotHaveFormatExplanation: `If none of these are selected, they will have no bearing at all on the search.
      If any are selected, then the search will require that the selected terms match.
      This is an "AND" search. Every one of these have to match in order to count.`,
    doesNotHaveVenueType: 'Search for meetings that DO NOT have specific venue types',
    doesNotHaveVenueTypeExplanation: `Any of these that are selected will prevent meetings that have the given venue type
      from being included in the search.`,
    enterNewValue: 'Enter a new value',
    field: 'Field',
    formatLanguage: 'Format language',
    formatsComparisonOperator: 'Formats comparison operator',
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
    getUsedFormats: 'Get the formats used in the results of this search',
    getFormatsOnly: 'Get just the formats (not the search results)',
    hasFormat: 'Search for meetings that have specific formats',
    hasFormatExplanation: `If none of these are selected, they will have no bearing at all on the search.
      If any are selected, then the search will require that the selected terms match.
      When the "AND" comparison operator is selected, every one of these have to match in order to count.
      When "OR" comparison operator is selected, matching anyone of these will count - they don't all have to match,
      however, you need at least one to match.`,
    hasVenueType: 'Search for meetings that have specific venue types',
    hasVenueTypeExplanation: `If none of these is selected, they will have no bearing at all on the search.
      If any are selected, then the search will require that the selected terms match.
      This is an "OR" search. Matching any one of these will count. They don't all have to match. However, you need at least one match.`,
    intro: `This is a re-implementation of the semantic workshop for the BMLT root server, intended to work
      with the new Svelte UI. It is currently a standalone app in SvelteKit. It could remain as a separate
      app, or later also be linked with the BMLT root server.`,
    invalidMeetingId: 'Invalid meeting ID',
    language: 'Language',
    meetingKeyValue: 'Search for meetings with a specific value of a field',
    meetingKeyValueExplanation: `You can either select an existing value of the chosen field using the left-hand selection menu,
      or enter a new value using the right-hand text box. If nothing is chosen or entered, it will not affect the search.`,
    meetingKeyValueResult: 'The value must equal',
    meetingsNotOnSpecificDays: 'Search for meetings that DO NOT gather on specific weekdays',
    meetingsOnSpecificDays: 'Search for meetings that gather on specific weekdays',
    meetingsNotOnSpecificDaysExplanation: `Any of these that are selected will prevent meetings that gather on the given weekday from being included in the search.`,
    meetingsOnSpecificDaysExplanation: `If none of these are selected, they will have no bearing at all on the search.
      If any are selected, then the search will require that the selected terms match. This is an "OR" search. Matching
      any one of these will count. They don't all have to match. However, you need at least one match.`,
    none: '- none -',
    noParameters: '- no parameters for this operation -',
    operation: 'Operation',
    or: 'OR',
    responseURL: 'Response URL',
    rootServerURL: 'Root server URL',
    selectExistingValue: 'Select an existing value',
    serverError: 'Server error',
    serverLanguage: 'Server language',
    serviceBody: 'Service body',
    showAllFormats: 'Show all formats',
    title: 'BMLT Semantic Workshop',
    updateURL: 'Update root server URL',
    urlPlaceholder: 'enter root server URL',
    value: 'Value',
    venueTypes: [ 'In-person', 'Virtual', 'Hybrid' ],
    weekdays: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]
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
