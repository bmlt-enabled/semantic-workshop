import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import App from '../App.svelte';

export const dummyURL = 'https://bigzone.org/main_server/';
export let consoleError = '';

export function setUpMockFetch() {
  // @ts-ignore
  vi.spyOn(global, 'fetch').mockImplementation(mockFetch);
  vi.spyOn(console, 'error').mockImplementation(mockConsoleError);
}

let saveAggregatorError = false;

// utility function to set up the semantic workshop page for a unit test
export async function setupTest(operation: string | null, provideBaseUrl = true, aggregatorError = false) {
  // @ts-ignore
  global.settings = provideBaseUrl ? { apiBaseUrl: dummyURL } : {};
  localStorage.setItem('workshopLanguage', 'en');
  saveAggregatorError = aggregatorError;
  consoleError = '';
  const user = userEvent.setup();
  render(App);
  if (operation) {
    const menu = screen.getByRole('combobox', { name: 'Operation:' }) as HTMLSelectElement;
    await userEvent.selectOptions(menu, [operation]);
  }
  return user;
}

// Possibly overkill - but there are two variants of fetching from a bad URL.
// One is a URL with "BAD" in it -- this causes the response to be not OK.
// The other has "THROW_EXECPTION" in it -- this just throws an exception.
// The same functionality is used for testing retrievals of bad field values.
// There is just one flavor of aggregator error though (which throws an exception).
function mockResponse(url: string) {
  if (/rootServerList/.test(url)) {
    if (saveAggregatorError) {
      throw new Error('mocked aggregator error');
    } else {
      return [
        { name: 'Big Zone', id: '42', rootURL: 'https://bigzone.org/main_server/' },
        { name: 'Small Zone', id: '21', rootURL: 'https://smallzone.org/main_server/' }
      ];
    }
  } else if (/THROW_EXECPTION/.test(url)) {
    throw new Error('mocked server error');
  } else if (/smallzone.*GetServerInfo/.test(url)) {
    return [{ langs: 'it' }];
  } else if (/GetServerInfo/.test(url)) {
    return [{ langs: 'en,es,de' }];
  } else if (/GetServiceBodies/.test(url)) {
    return [
      { name: 'Big Zone', id: '5', parent_id: '' },
      { name: 'Northern Region', id: '8', parent_id: '5' },
      { name: 'Southern Region', id: '9', parent_id: '5' }
    ];
  } else if (/GetFieldKeys/.test(url)) {
    // The field with weird characters is for testing URL encoding; the last two are for testing server error handling.
    return [
      { key: 'service_body_bigint', description: 'Service Body ID' },
      { key: 'location_province', description: 'State' },
      { key: 'weird&key', description: 'Key with & in it' },
      { key: 'very_BAD_field', description: 'Very Bad Field' },
      { key: 'THROW_EXECPTION_field', description: 'Throw Exception Field' }
    ];
  } else if (/GetFieldValues&meeting_key=location_province/.test(url)) {
    return [
      { location_province: 'WA', ids: '10,20,30' },
      { location_province: 'OR', ids: '44,55,60' }
    ];
  } else if (/GetFieldValues&meeting_key=weird%26key/.test(url)) {
    return [
      { 'weird&key': 'a[3]', ids: '10,20,30' },
      { 'weird&key': 'b[4]', ids: '44,55,60' }
    ];
  } else if (/GetFormats/.test(url)) {
    return [
      { key_string: 'VM', id: '5' },
      { key_string: 'Ag', id: '8' },
      { key_string: 'LGBT', id: '3' }
    ];
  } else {
    throw new Error('Internal error: no mocked response for this request' + url);
  }
}

// hack around the type system -- what we want is something like this:
//     function mockFetch(url: string): Promise<Response>
function mockFetch(url: any): any {
  return Promise.resolve({
    ok: !/BAD/.test(url),
    json: () => Promise.resolve(mockResponse(url))
  });
}

function mockConsoleError(e: string): void {
  consoleError = e;
}
