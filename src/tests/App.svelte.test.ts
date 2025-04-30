import { beforeAll, afterAll, describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import App from '../App.svelte';
import { setUpMockFetch } from './MockFetch';

const dummyURL = 'https://myzone.org/main_server/';

// utility function to set up the page with dummyURL for the server URL, and with the operation selected
async function selectOperation(operation: string) {
  const user = userEvent.setup();
  render(App);
  const rootServerURL = screen.getByRole('textbox', { name: 'Root server URL:' }) as HTMLInputElement;
  await user.clear(rootServerURL);
  await user.type(rootServerURL, dummyURL);
  const updateURL = screen.getByRole('button', { name: 'Update root server URL' });
  await user.click(updateURL);
  const menu = screen.getByRole('combobox', { name: 'Operation:' }) as HTMLSelectElement;
  await userEvent.selectOptions(menu, [operation]);
  return user;
}

beforeAll(setUpMockFetch);
afterAll(vi.resetAllMocks);

describe('semantic workshop tests (except get meetings)', () => {
  test('initial screen', async () => {
    // make this test independent of whether the initial default for the server URL is a valid URL or the empty string
    render(App);
    expect(screen.getByRole('heading', { name: 'BMLT Semantic Workshop', level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText('Response URL:')).toBeInTheDocument();
    const rootServerURL = screen.getByRole('textbox', { name: 'Root server URL:' }) as HTMLInputElement;
    expect(screen.getByRole('button', { name: 'Update root server URL' })).toBeDisabled();
    const operation = screen.getByRole('combobox', { name: 'Operation:' }) as HTMLSelectElement;
    expect(operation.value).toBe('');
  });

  test('test Get Service Bodies', async () => {
    const user = await selectOperation('GetServiceBodies');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetServiceBodies' })).toBeInTheDocument();
  });

  test('test Get Formats', async () => {
    const user = await selectOperation('GetFormats');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFormats' })).toBeInTheDocument();
    const formatLanguage = screen.getByRole('combobox', { name: 'Format language:' }) as HTMLSelectElement;
    expect(formatLanguage.item(0)?.label).toBe('Choose option ...');
    expect(formatLanguage.item(1)?.label).toBe('Server language');
    expect(formatLanguage.item(2)?.label).toBe('Deutsch');
    expect(formatLanguage.item(3)?.label).toBe('English');
    expect(formatLanguage.item(4)?.label).toBe('Español');
    await userEvent.selectOptions(formatLanguage, ['de']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFormats&lang_enum=de' })).toBeInTheDocument();
    const allFormats = screen.getByRole('checkbox', { name: 'Show all formats' }) as HTMLInputElement;
    expect(allFormats.checked).toBe(false);
    await user.click(allFormats);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFormats&lang_enum=de&show_all=1' })).toBeInTheDocument();
    await userEvent.selectOptions(formatLanguage, ['servLang']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFormats&show_all=1' })).toBeInTheDocument();
  });

  test('test Get Changes', async () => {
    const user = await selectOperation('GetChanges');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetChanges' })).toBeInTheDocument();
    // TODO - not finished -- need to test picking a date range
    // const openDatePicker = screen.getByRole('button', { name: /Open date picker/ });
    // user.click(openDatePicker);
    const meetingIdTextBox = screen.getByRole('textbox', { name: 'Get changes for a meeting with this ID:' }) as HTMLInputElement;
    await user.type(meetingIdTextBox, '439');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetChanges&meeting_id=439' })).toBeInTheDocument();
    await user.clear(meetingIdTextBox);
    const serviceBody = screen.getByRole('combobox', { name: 'Service body:' }) as HTMLSelectElement;
    expect(serviceBody.item(0)?.label).toBe('Choose option ...');
    expect(serviceBody.item(1)?.label).toBe('All service bodies');
    expect(serviceBody.item(2)?.label).toBe('Big Zone');
    expect(serviceBody.item(3)?.label).toBe('Northern Region');
    expect(serviceBody.item(4)?.label).toBe('Southern Region');
    await userEvent.selectOptions(serviceBody, ['8']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetChanges&service_body_id=8' })).toBeInTheDocument();
    await user.type(meetingIdTextBox, 'BAD');
    expect(screen.getByText(/Invalid meeting ID/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBe(null);
    expect(screen.getByText(/- none -/)).toBeInTheDocument();
  });

  test('test Get a List of Available Field Keys', async () => {
    const user = await selectOperation('GetFieldKeys');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFieldKeys' })).toBeInTheDocument();
  });

  test('test Get a List of Specific Field Values', async () => {
    const user = await selectOperation('GetFieldValues');
    expect(screen.getByText(/- none -/)).toBeInTheDocument();
    const field = screen.getByRole('combobox', { name: 'Field:' }) as HTMLSelectElement;
    expect(field.item(0)?.label).toBe('Choose option ...');
    // note that these get alphabetized
    expect(field.item(1)?.label).toBe('Key with & in it');
    expect(field.item(2)?.label).toBe('Service Body ID');
    expect(field.item(3)?.label).toBe('State');
    await userEvent.selectOptions(field, ['location_province']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFieldValues&meeting_key=location_province' })).toBeInTheDocument();
    await userEvent.selectOptions(field, ['weird&key']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFieldValues&meeting_key=weird%26key' })).toBeInTheDocument();
  });

  test('test Get a NAWS Format Export', async () => {
    const user = await selectOperation('GetNAWSDump');
    expect(screen.getByText(/- none -/)).toBeInTheDocument();
    const field = screen.getByRole('combobox', { name: 'Service body:' }) as HTMLSelectElement;
    expect(field.item(0)?.label).toBe('Choose option ...');
    expect(field.item(1)?.label).toBe('Big Zone');
    expect(field.item(2)?.label).toBe('Northern Region');
    expect(field.item(3)?.label).toBe('Southern Region');
    await userEvent.selectOptions(field, ['9']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetNAWSDump&sb_id=9' })).toBeInTheDocument();
  });

  test('test Get Server Information', async () => {
    const user = await selectOperation('GetServerInfo');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetServerInfo' })).toBeInTheDocument();
  });

  test('test Get Geographic Coverage Area', async () => {
    const user = await selectOperation('GetCoverageArea');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetCoverageArea' })).toBeInTheDocument();
    // TODO: NOT FINISHED -- need to also check map
  });

  test('change root server URL', async () => {
    // Various picky tests of changing the root server URL.  After the URL is changed, the response URL should be updated.
    // Also, the operation should be reset to GetServiceBodies, and the data needed for other operations should be for the new server.
    // Setting the URL to the empty string is OK and should have no service bodies and no response URL.
    const user = await selectOperation('GetServerInfo');
    const rootServerURL = screen.getByRole('textbox', { name: 'Root server URL:' }) as HTMLInputElement;
    await user.clear(rootServerURL);
    await user.type(rootServerURL, 'https://smallzone.org/main_server/');
    expect(rootServerURL.value).toBe('https://smallzone.org/main_server/');
    const updateURL = screen.getByRole('button', { name: 'Update root server URL' });
    expect(updateURL).not.toBeDisabled();
    await user.click(updateURL);
    const menu = screen.getByRole('combobox', { name: 'Operation:' }) as HTMLSelectElement;
    // changing the URL should reset the selected operation
    expect(menu.value).toBe('');
    await userEvent.selectOptions(menu, ['GetServiceBodies']);
    // we should see the URL and parameters for smallzone now
    expect(screen.getByRole('link', { name: 'https://smallzone.org/main_server/client_interface/json/?switcher=GetServiceBodies' })).toBeInTheDocument();
    await userEvent.selectOptions(menu, ['GetFormats']);
    const formatLanguage = screen.getByRole('combobox', { name: 'Format language:' }) as HTMLSelectElement;
    expect(formatLanguage.length).toBe(3);
    expect(formatLanguage.item(0)?.label).toBe('Choose option ...');
    expect(formatLanguage.item(1)?.label).toBe('Server language');
    expect(formatLanguage.item(2)?.label).toBe('Italiano');
    // finally set the root server URL to the empty string
    await user.clear(rootServerURL);
    await user.click(updateURL);
    expect(screen.queryByRole('link')).toBe(null);
    expect(screen.getByText(/- none -/)).toBeInTheDocument();
    await userEvent.selectOptions(menu, ['GetNAWSDump']);
    const serviceBodiesMenu = screen.getByRole('combobox', { name: 'Service body:' }) as HTMLSelectElement;
    expect(serviceBodiesMenu.length).toBe(1);
    expect(serviceBodiesMenu.item(0)?.label).toBe('Choose option ...');
  });

  test('bad root server URL', async () => {
    const user = userEvent.setup();
    render(App);
    const rootServerURL = screen.getByRole('textbox', { name: 'Root server URL:' }) as HTMLInputElement;
    await user.clear(rootServerURL);
    await user.type(rootServerURL, 'https://BADzone.org/main_server/');
    const updateURL = screen.getByRole('button', { name: 'Update root server URL' });
    await user.click(updateURL);
    expect(screen.getByText(/Server error -- Error: mocked server error/)).toBeInTheDocument();
  });

  test('change semantic workshop language', async () => {
    render(App);
    const languagerMenu = screen.getByRole('combobox', { name: 'Language:' }) as HTMLSelectElement;
    await userEvent.selectOptions(languagerMenu, ['de']);
    expect(screen.getByRole('heading', { name: 'BMLT Semantische Werkstatt', level: 1 })).toBeInTheDocument();
  });
});

describe('Get Meeting Search Results tests', () => {
  test('test the two Get Formats checkboxes', async () => {
    const user = await selectOperation('GetSearchResults');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults' })).toBeInTheDocument();
    const getUsedFormats = screen.getByRole('checkbox', { name: 'Get the formats used in the results of this search' }) as HTMLInputElement;
    expect(getUsedFormats.checked).toBe(false);
    const getFormatsOnly = screen.getByRole('checkbox', { name: 'Get just the formats (not the search results)' }) as HTMLInputElement;
    expect(getFormatsOnly.checked).toBe(false);
    await user.click(getUsedFormats);
    expect(getUsedFormats.checked).toBe(true);
    expect(getFormatsOnly.checked).toBe(false);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&get_used_formats=1' })).toBeInTheDocument();
    await user.click(getFormatsOnly);
    expect(getUsedFormats.checked).toBe(true);
    expect(getFormatsOnly.checked).toBe(true);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&get_used_formats=1&get_formats_only=1' })).toBeInTheDocument();
    // clicking getUsedFormats again should also clear getFormatsOnly
    await user.click(getUsedFormats);
    expect(getUsedFormats.checked).toBe(false);
    expect(getFormatsOnly.checked).toBe(false);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults' })).toBeInTheDocument();
  });

  test('test meetings that gather on specific weekdays', async () => {
    const user = await selectOperation('GetSearchResults');
    // bit of a hack -- there are TWO Monday boxes, one for meetings that gather on Mondays
    // and another for meetings that do not gather on Mondays
    const mondays = screen.getAllByRole('checkbox', { name: 'Monday' });
    expect(mondays.length).toBe(2);
    await user.click(mondays[0] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&weekdays=2' })).toBeInTheDocument();
    const wednesdays = screen.getAllByRole('checkbox', { name: 'Wednesday' });
    await user.click(wednesdays[0] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&weekdays[]=2&weekdays[]=4' })).toBeInTheDocument();
  });

  test('test meetings that DO NOT gather on specific weekdays', async () => {
    const user = await selectOperation('GetSearchResults');
    const mondays = screen.getAllByRole('checkbox', { name: 'Monday' });
    await user.click(mondays[1] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&weekdays=-2' })).toBeInTheDocument();
    const wednesdays = screen.getAllByRole('checkbox', { name: 'Wednesday' });
    await user.click(wednesdays[1] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&weekdays[]=-2&weekdays[]=-4' })).toBeInTheDocument();
  });

  test('test meetings that have specific venue types', async () => {
    const user = await selectOperation('GetSearchResults');
    const virtual = screen.getAllByRole('checkbox', { name: 'Virtual' });
    expect(virtual.length).toBe(2);
    await user.click(virtual[0] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&venue_types=2' })).toBeInTheDocument();
    const hybrid = screen.getAllByRole('checkbox', { name: 'Hybrid' });
    await user.click(hybrid[0] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&venue_types[]=2&venue_types[]=3' })).toBeInTheDocument();
  });

  test('test meetings that DO NOT have specific venue types', async () => {
    const user = await selectOperation('GetSearchResults');
    const virtual = screen.getAllByRole('checkbox', { name: 'Virtual' });
    await user.click(virtual[1] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&venue_types=-2' })).toBeInTheDocument();
    const hybrid = screen.getAllByRole('checkbox', { name: 'Hybrid' });
    await user.click(hybrid[1] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&venue_types[]=-2&venue_types[]=-3' })).toBeInTheDocument();
  });

  // The checkboxes for the formats are sorted alphabetically by format key.  However, the format parameters in the query aren't
  // sorted -- they are just in whatever order the formats are declared.  (They could be sorted as well, but there isn't really any
  // need to do so; the server doesn't care.)
  test('test meetings that have specific formats', async () => {
    const user = await selectOperation('GetSearchResults');
    const virtual = screen.getAllByRole('checkbox', { name: 'VM' });
    expect(virtual.length).toBe(2);
    await user.click(virtual[0] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&formats=5' })).toBeInTheDocument();
    const agnostic = screen.getAllByRole('checkbox', { name: 'Ag' });
    await user.click(agnostic[0] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&formats[]=8&formats[]=5' })).toBeInTheDocument();
    const andButton = screen.getByRole('radio', { name: 'AND' }) as HTMLInputElement;
    const orButton = screen.getByRole('radio', { name: 'OR' }) as HTMLInputElement;
    expect(andButton.checked).toBe(true);
    expect(orButton.checked).toBe(false);
    await user.click(orButton);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&formats[]=8&formats[]=5&formats_comparison_operator=OR' })).toBeInTheDocument();
  });

  test('test meetings that do not have specific formats', async () => {
    const user = await selectOperation('GetSearchResults');
    const virtual = screen.getAllByRole('checkbox', { name: 'VM' });
    await user.click(virtual[1] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&formats=-5' })).toBeInTheDocument();
    const agnostic = screen.getAllByRole('checkbox', { name: 'Ag' });
    await user.click(agnostic[1] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&formats[]=-8&formats[]=-5' })).toBeInTheDocument();
  });

  test('test search for meetings with a specific value of a field', async () => {
    const user = await selectOperation('GetSearchResults');
    const field = screen.getByRole('combobox', { name: 'Field:' }) as HTMLSelectElement;
    expect(field.item(0)?.label).toBe('Choose option ...');
    expect(field.item(1)?.label).toBe('Key with & in it');
    expect(field.item(2)?.label).toBe('Service Body ID');
    expect(field.item(3)?.label).toBe('State');
    await userEvent.selectOptions(field, ['location_province']);
    const existingValue = screen.getByRole('combobox', { name: 'Select an existing value:' }) as HTMLSelectElement;
    const newValueTextBox = screen.getByRole('textbox', { name: 'Enter a new value:' }) as HTMLInputElement;
    expect(existingValue.item(0)?.label).toBe('Choose option ...');
    expect(existingValue.item(1)?.label).toBe('WA');
    expect(existingValue.item(2)?.label).toBe('OR');
    await userEvent.selectOptions(existingValue, ['OR']);
    expect(newValueTextBox.value).toBe('OR');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&meeting_key=location_province&meeting_key_value=OR' })).toBeInTheDocument();
    await user.clear(newValueTextBox);
    await user.type(newValueTextBox, 'WA');
    expect(existingValue.value).toBe('WA');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&meeting_key=location_province&meeting_key_value=WA' })).toBeInTheDocument();
    await user.type(newValueTextBox, 'ZZU');
    expect(existingValue.value).toBe('');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&meeting_key=location_province&meeting_key_value=WAZZU' })).toBeInTheDocument();
    await userEvent.selectOptions(field, ['weird&key']);
    expect(existingValue.item(0)?.label).toBe('Choose option ...');
    expect(existingValue.item(1)?.label).toBe('a[3]');
    expect(existingValue.item(2)?.label).toBe('b[4]');
    await userEvent.selectOptions(existingValue, ['b[4]']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&meeting_key=weird%26key&meeting_key_value=b%5B4%5D' })).toBeInTheDocument();
  });
});
