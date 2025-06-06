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
    clientQuery: 'Client Query (click to copy to clipboard)',
    doesNotHaveFormat: 'Search for meetings that <i><b>do not</b></i> have specific formats',
    doesNotHaveFormatExplanation: `If none of these are selected, they will have no bearing at all on the search.
      If any are selected, then the search will require that the selected terms match.
      This is an "AND" search. Every one of these have to match in order to count.`,
    doesNotHaveVenueType: 'Search for meetings that <i><b>do not</b></i> have specific venue types',
    doesNotHaveVenueTypeExplanation: `Any of these that are selected will prevent meetings that have the given venue type
      from being included in the search.`,
    dontSort: `Don't sort`,
    enterNewValue: 'Enter a new value',
    failedToFetchServerList: `Failed to fetch server list. Please try again later, or else enter the desired server URL, followed by /semantic/,
      directly into a web browser.`,
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
      When the "AND" comparison operator is selected, every one of these has to match in order to count.
      When the "OR" comparison operator is selected, matching any one of these will count - they don't all have to match,
      however, you need at least one to match.`,
    hasVenueType: 'Search for meetings that have specific venue types',
    hasVenueTypeExplanation: `If none of these is selected, they will have no bearing at all on the search.
      If any are selected, then the search will require that the selected terms match.
      This is an "OR" search. Matching any one of these will count. They don't all have to match. However, you need at least one match.`,
    intro: `This interactive application will help you build a semantic URL to retrieve data from a BMLT root server.
      It is available both as part of every BMLT root server and as a separate standalone app at https://semantic.bmlt.app.`,
    invalidLatitude: 'Invalid latitude',
    invalidLongitude: 'Invalid longitude',
    invalidMeetingId: 'Invalid meeting ID',
    invalidRadius: 'Invalid radius',
    invalidTime: 'Invalid time',
    kilometers: 'Kilometers',
    language: 'Language',
    latitude: 'Latitude',
    latLonSearchRadius: 'Latitude/longitude search radius',
    loadingServers: 'Loading servers ...',
    longitude: 'Longitude',
    meetingDuration: 'Meeting duration',
    meetingDurationExplanation: 'Format: HH:MM. Leave blank to ignore.',
    meetingEndsBefore: 'Meeting ends before',
    meetingKeyValue: 'Search for meetings with a specific value of a field',
    meetingKeyValueExplanation: `You can either select an existing value of the chosen field using the left-hand selection menu,
      or enter a new value using the right-hand text box. If nothing is chosen or entered, it will not affect the search.`,
    meetingKeyValueResult: 'The value must equal',
    meetingLastsAtLeast: 'Meeting lasts at least',
    meetingLastsAtMost: 'Meeting lasts at most',
    meetingLatitudeLongitudeSearch: 'Search using latitude, longitude, and a search radius',
    meetingLatitudeLongitudeSearchExplanation: `All three values (latitude, longitude, and search radius) are needed for this option.
      If you specify a negative radius, then it should be an integer, and will specify how many meetings to (roughly) find in an
      auto-radius search. The units (miles or kilometers) don't matter in this case.`,
    meetingResponseSortOrder: 'Response sort order',
    meetingResponseSortOrderExplanation: `Select fields to be used in sorting the result.  The result will be sorted first by the field
      marked '1', then by the field marked '2', and so on.  "Don't sort" means that the field isn't used in sorting, although it will
      still be part of the result.`,
    meetingSearchRadius: 'Search radius',
    meetingSearchRadiusExplanation: `Search radius is in either miles or km, depending on the root server settings.
      A negative value must be an integer, and is for auto-radius.`,
    meetingSearchString: 'Search for specific text',
    meetingSearchStringExplanation: 'If you do not enter any text, it will have no effect on the search.',
    meetingSearchType: 'Search type',
    meetingsNotOnSpecificDays: 'Search for meetings that <i><b>do not</b></i> gather on specific weekdays',
    meetingsOnSpecificDays: 'Search for meetings that gather on specific weekdays',
    meetingsNotOnSpecificDaysExplanation: `Any of these that are selected will prevent meetings that gather on the given weekday from being included in the search.`,
    meetingsOnSpecificDaysExplanation: `If none of these are selected, they will have no bearing at all on the search.
      If any are selected, then the search will require that the selected terms match. This is an "OR" search. Matching
      any one of these will count. They don't all have to match. However, you need at least one match.`,
    meetingSpecificFields: 'Return only specific fields',
    meetingSpecificFieldsExplanation: 'The order of the response will be determined by the server.',
    meetingStartOrEndTime: 'Meeting start or end time',
    meetingStartOrEndTimeExplanation: 'Format: HH:MM (24 hour time). 12:00 is Noon, 23:59 is Midnight. Leave blank to ignore.',
    meetingStartsAfter: 'Meeting starts after',
    meetingStartsBefore: 'Meeting starts before',
    miles: 'Miles',
    none: '- none -',
    noParameters: '- no parameters for this operation -',
    notSpecificServiceBodies: 'Search for meetings that <i><b>do not</b></i> belong to certain service bodies',
    notSpecificServiceBodiesExplanation: `If none of these is selected, this option will have no bearing on the search.
      If one or more service bodies are selected, then the meetings found must <i><b>not</b></i> belong to any of those service bodies.`,
    operation: 'Operation',
    or: 'OR',
    other: '- Other -',
    responseURL: 'Response URL',
    rootServerURL: 'Root server URL',
    searchForThisText: 'Search for this text',
    searchOptionGeneral: 'Do a general "casual" text search',
    searchOptionLocation: 'This is a location',
    selectExistingValue: 'Select an existing value',
    serverError: 'Server error',
    serverLanguage: 'Server language',
    serviceBody: 'Service body',
    showAllFormats: 'Show all formats',
    specificServiceBodies: 'Search for meetings that belong to certain service bodies',
    specificServiceBodiesExplanation: `If none of these is selected, this option will have no bearing on the search.
      If one or more service bodies are selected, then the meetings found must belong to one of those service bodies.`,
    title: 'BMLT Semantic Workshop',
    units: 'Units',
    updateURL: 'Update root server URL',
    urlPlaceholder: 'Enter root server URL ...',
    value: 'Value',
    venueTypes: ['In-person', 'Virtual', 'Hybrid'],
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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
