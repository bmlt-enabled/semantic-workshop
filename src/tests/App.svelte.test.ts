import { beforeAll, afterAll, describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import App from '../App.svelte';
import { setUpMockFetch } from './MockFetch';

const dummyURL = 'https://bigzone.org/main_server/';

// utility function to set up the semantic workshop page for a unit test
async function setupTest(operation: string | null, provideBaseUrl = true) {
  // @ts-ignore
  global.settings = provideBaseUrl ? { apiBaseUrl: 'https://bigzone.org/main_server/' } : {};
  localStorage.setItem('workshopLanguage', 'en');
  const user = userEvent.setup();
  render(App);
  if (operation) {
    const menu = screen.getByRole('combobox', { name: 'Operation:' }) as HTMLSelectElement;
    await userEvent.selectOptions(menu, [operation]);
  }
  return user;
}

beforeAll(setUpMockFetch);
afterAll(vi.resetAllMocks);

describe('semantic workshop tests (except get meetings)', () => {
  test('initial screen', async () => {
    await setupTest(null);
    expect(screen.getByRole('heading', { name: 'BMLT Semantic Workshop', level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText('Response URL:')).toBeInTheDocument();
    // since this test is set up to provide a base URL, the Select menu for the server shouldn't be shown -- so we should have only one Select menu
    expect(screen.getAllByRole('combobox').length).toBe(1);
    const operation = screen.getByRole('combobox', { name: 'Operation:' }) as HTMLSelectElement;
    expect(operation.value).toBe('GetServerInfo');
    // there are separate tests later for the Select menu for the server and the language selector
  });

  test('Get Service Bodies', async () => {
    const user = await setupTest('GetServiceBodies');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetServiceBodies' })).toBeInTheDocument();
    expect(screen.getByText('- no parameters for this operation -')).toBeInTheDocument();
  });

  test('Get Formats', async () => {
    const user = await setupTest('GetFormats');
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

  test('Get Changes', async () => {
    const user = await setupTest('GetChanges');
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

  test('Get a List of Available Field Keys', async () => {
    const user = await setupTest('GetFieldKeys');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFieldKeys' })).toBeInTheDocument();
    expect(screen.getByText('- no parameters for this operation -')).toBeInTheDocument();
  });

  test('Get a List of Specific Field Values', async () => {
    const user = await setupTest('GetFieldValues');
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

  test('Get a NAWS Format Export', async () => {
    const user = await setupTest('GetNAWSDump');
    expect(screen.getByText(/- none -/)).toBeInTheDocument();
    const field = screen.getByRole('combobox', { name: 'Service body:' }) as HTMLSelectElement;
    expect(field.item(0)?.label).toBe('Choose option ...');
    expect(field.item(1)?.label).toBe('Big Zone');
    expect(field.item(2)?.label).toBe('Northern Region');
    expect(field.item(3)?.label).toBe('Southern Region');
    await userEvent.selectOptions(field, ['9']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetNAWSDump&sb_id=9' })).toBeInTheDocument();
  });

  test('Get Server Information', async () => {
    const user = await setupTest('GetServerInfo');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetServerInfo' })).toBeInTheDocument();
    expect(screen.getByText('- no parameters for this operation -')).toBeInTheDocument();
  });

  test('Get Geographic Coverage Area', async () => {
    const user = await setupTest('GetCoverageArea');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetCoverageArea' })).toBeInTheDocument();
    // TODO: NOT FINISHED -- need to also check map
  });

  test('change root server URL', async () => {
    // Various picky tests of changing the root server URL.  After the URL is changed, the response URL should be updated.
    // Also, the operation should be reset to GetServerInfo, and the data needed for other operations should be for the new server.
    // Setting the URL to the empty string is OK and should have operation menu disabled and no response URL.
    const user = await setupTest('GetServerInfo', false);
    const rootServerMenu = screen.getByRole('combobox', { name: 'Root server URL:' }) as HTMLSelectElement;
    const operationMenu = screen.getByRole('combobox', { name: 'Operation:' }) as HTMLSelectElement;
    expect(rootServerMenu.length).toBe(4);
    await userEvent.selectOptions(rootServerMenu, ['21']);
    // shouldn't have a text box to type in a custom root server URL at this point
    expect(screen.queryByRole('textbox')).toBe(null);
    expect(screen.getByRole('link', { name: 'https://smallzone.org/main_server/client_interface/json/?switcher=GetServerInfo' })).toBeInTheDocument();
    await userEvent.selectOptions(operationMenu, ['GetFormats']);
    const formatLanguage = screen.getByRole('combobox', { name: 'Format language:' }) as HTMLSelectElement;
    expect(formatLanguage.length).toBe(3);
    expect(formatLanguage.item(0)?.label).toBe('Choose option ...');
    expect(formatLanguage.item(1)?.label).toBe('Server language');
    expect(formatLanguage.item(2)?.label).toBe('Italiano');
    expect(screen.getByRole('link', { name: 'https://smallzone.org/main_server/client_interface/json/?switcher=GetFormats' })).toBeInTheDocument();
    // changing the root server URL should reset the operation
    await userEvent.selectOptions(rootServerMenu, ['42']);
    expect(screen.getByRole('link', { name: 'https://bigzone.org/main_server/client_interface/json/?switcher=GetServerInfo' })).toBeInTheDocument();
    await userEvent.selectOptions(operationMenu, ['GetServiceBodies']);
    await userEvent.selectOptions(rootServerMenu, ['other']);
    const boxes = screen.getAllByRole('textbox');
    expect(boxes.length).toBe(1);
    const customUrl = boxes[0];
    const acceptUrl = screen.getByRole('button', { name: 'Update root server URL' });
    await user.type(customUrl, 'https://weirdzone.org/main_server/');
    await user.click(acceptUrl);
    expect(screen.getByRole('link', { name: 'https://weirdzone.org/main_server/client_interface/json/?switcher=GetServerInfo' })).toBeInTheDocument();
    await user.clear(customUrl);
    await user.click(acceptUrl);
    expect(operationMenu).toBeDisabled();
    expect(screen.getByText(/- none -/)).toBeInTheDocument();
  });

  test('bad root server URL', async () => {
    const user = await setupTest('GetServerInfo', false);
    const rootServerMenu = screen.getByRole('combobox', { name: 'Root server URL:' }) as HTMLSelectElement;
    await userEvent.selectOptions(rootServerMenu, ['other']);
    const boxes = screen.getAllByRole('textbox');
    const customUrl = boxes[0];
    const acceptUrl = screen.getByRole('button', { name: 'Update root server URL' });
    await user.type(customUrl, 'https://BADzone.org/main_server/');
    await user.click(acceptUrl);
    expect(screen.getByText(/Server error -- Error: server response said not OK/)).toBeInTheDocument();
    expect(screen.getByText(/- none -/)).toBeInTheDocument();
  });

  test('another bad root server URL - throws an exception', async () => {
    const user = await setupTest('GetServerInfo', false);
    const rootServerMenu = screen.getByRole('combobox', { name: 'Root server URL:' }) as HTMLSelectElement;
    await userEvent.selectOptions(rootServerMenu, ['other']);
    const boxes = screen.getAllByRole('textbox');
    const customUrl = boxes[0];
    const acceptUrl = screen.getByRole('button', { name: 'Update root server URL' });
    await user.type(customUrl, 'https://THROW_EXECPTIONzone.org/main_server/');
    await user.click(acceptUrl);
    expect(screen.getByText(/Server error -- Error: mocked server error/)).toBeInTheDocument();
    expect(screen.getByText(/- none -/)).toBeInTheDocument();
  });

  test('change semantic workshop language', async () => {
    const user = await setupTest('GetServerInfo');
    const languageSettings = screen.getByRole('button', { name: 'Open language settings' });
    await user.click(languageSettings);
    const languageMenu = screen.getByRole('combobox', { name: 'Language' }) as HTMLSelectElement;
    await userEvent.selectOptions(languageMenu, ['de']);
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);
    expect(screen.getByRole('heading', { name: 'BMLT Semantische Werkstatt', level: 1 }));
  });
});

describe('check that response parameters are initially cleared', () => {
  test('no leftover response parameters from GetFormats for GetSearchResults ', async () => {
    // In theory we should have a test like this for all the options.
    // Here we are checking that the 'show_all=1' part of the parameter is dropped after we switch operations.
    const user = await setupTest('GetFormats');
    const allFormats = screen.getByRole('checkbox', { name: 'Show all formats' }) as HTMLInputElement;
    await user.click(allFormats);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFormats&show_all=1' })).toBeInTheDocument();
    const menu = screen.getByRole('combobox', { name: 'Operation:' }) as HTMLSelectElement;
    await userEvent.selectOptions(menu, ['GetSearchResults']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults' })).toBeInTheDocument();
  });
});

describe('Get Meeting Search Results tests', () => {
  test('Get Formats checkboxes', async () => {
    const user = await setupTest('GetSearchResults');
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

  test('meetings that gather on specific weekdays', async () => {
    const user = await setupTest('GetSearchResults');
    // Bit of a hack -- there is more than one legend and one explanation that match these strings, so do a getAllByText
    expect(screen.getAllByText('Search for meetings that gather on specific weekdays'));
    expect(screen.getAllByText(/If any are selected, then the search will require that the selected terms match. This is an "OR" search./));
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

  test('meetings that DO NOT gather on specific weekdays', async () => {
    const user = await setupTest('GetSearchResults');
    // similarly -- not the most precise test unfortunately
    expect(screen.getAllByText(/Search for meetings that/));
    expect(screen.getAllByText(/do not/));
    expect(screen.getAllByText(/gather on specific weekdays/));
    expect(screen.getByText('Any of these that are selected will prevent meetings that gather on the given weekday from being included in the search.')).toBeInTheDocument();
    const mondays = screen.getAllByRole('checkbox', { name: 'Monday' });
    await user.click(mondays[1] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&weekdays=-2' })).toBeInTheDocument();
    const wednesdays = screen.getAllByRole('checkbox', { name: 'Wednesday' });
    await user.click(wednesdays[1] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&weekdays[]=-2&weekdays[]=-4' })).toBeInTheDocument();
  });

  test('meetings that have specific venue types', async () => {
    const user = await setupTest('GetSearchResults');
    expect(screen.getAllByText('Search for meetings that have specific venue types'));
    expect(screen.getAllByText(/If any are selected, then the search will require that the selected terms match. This is an "OR" search./));
    const virtual = screen.getAllByRole('checkbox', { name: 'Virtual' });
    expect(virtual.length).toBe(2);
    await user.click(virtual[0] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&venue_types=2' })).toBeInTheDocument();
    const hybrid = screen.getAllByRole('checkbox', { name: 'Hybrid' });
    await user.click(hybrid[0] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&venue_types[]=2&venue_types[]=3' })).toBeInTheDocument();
  });

  test('meetings that DO NOT have specific venue types', async () => {
    const user = await setupTest('GetSearchResults');
    expect(screen.getAllByText(/Search for meetings that/));
    expect(screen.getAllByText(/do not/));
    expect(screen.getAllByText(/have specific venue types/));
    expect(screen.getByText('Any of these that are selected will prevent meetings that have the given venue type from being included in the search.')).toBeInTheDocument();
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
  test('meetings that have specific formats', async () => {
    const user = await setupTest('GetSearchResults');
    expect(screen.getAllByText(/Search for meetings that have specific formats/));
    expect(screen.getAllByText(/If none of these are selected, they will have no bearing at all on the search. If any are/));
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

  test('meetings that do not have specific formats', async () => {
    const user = await setupTest('GetSearchResults');
    expect(screen.getAllByText(/Search for meetings that/));
    expect(screen.getAllByText(/do not/));
    expect(screen.getAllByText(/have specific formats/));
    expect(screen.getAllByText(/If none of these are selected, they will have no bearing at all on the search. If any are/));
    const virtual = screen.getAllByRole('checkbox', { name: 'VM' });
    await user.click(virtual[1] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&formats=-5' })).toBeInTheDocument();
    const agnostic = screen.getAllByRole('checkbox', { name: 'Ag' });
    await user.click(agnostic[1] as HTMLInputElement);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&formats[]=-8&formats[]=-5' })).toBeInTheDocument();
  });

  test('search for meetings with a specific value of a field', async () => {
    const user = await setupTest('GetSearchResults');
    expect(screen.getByText('Search for meetings with a specific value of a field')).toBeInTheDocument();
    expect(screen.getByText(/You can either select an existing value of the chosen field using the left-hand selection menu/)).toBeInTheDocument();
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

  test('search for meetings with some specific text', async () => {
    const user = await setupTest('GetSearchResults');
    expect(screen.getByText('Search for specific text')).toBeInTheDocument();
    expect(screen.getByText('If you do not enter any text, it will have no effect on the search.')).toBeInTheDocument();
    const textBox = screen.getByRole('textbox', { name: 'Search for this text:' }) as HTMLInputElement;
    const searchType = screen.getByRole('combobox', { name: 'Search type:' }) as HTMLSelectElement;
    // searchType should be initially disabled, and then enabled after typing some text
    expect(searchType).toBeDisabled();
    await user.type(textBox, 'Octopus');
    expect(searchType).not.toBeDisabled();
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&SearchString=Octopus' })).toBeInTheDocument();
    expect(searchType.item(0)?.label).toBe('Choose option ...');
    expect(searchType.item(1)?.label).toBe('Do a general "casual" text search');
    expect(searchType.item(2)?.label).toBe('This is a location');
    await userEvent.selectOptions(searchType, ['This is a location']);
    expect(searchType.value).toBe('location');
    // typing more text into the text box should not reset the searchType
    await user.type(textBox, ' Lane');
    expect(searchType.value).toBe('location');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&SearchString=Octopus%20Lane&StringSearchIsAnAddress=1' })).toBeInTheDocument();
    // add in a search radius
    const radiusBox = screen.getByRole('textbox', { name: 'Search radius:' }) as HTMLInputElement;
    await user.type(radiusBox, '-25');
    expect(
      screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&SearchString=Octopus%20Lane&StringSearchIsAnAddress=1&SearchStringRadius=-25' })
    ).toBeInTheDocument();
    await user.type(radiusBox, 'BAD');
    expect(screen.getByText(/Invalid radius/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBe(null);
    expect(screen.getByText(/- none -/)).toBeInTheDocument();
    // clearing the radius box should leave the search type but get rid of the error and remove the radius type from the URL
    await user.clear(radiusBox);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&SearchString=Octopus%20Lane&StringSearchIsAnAddress=1' })).toBeInTheDocument();
    // make an error again
    await user.type(radiusBox, 'BAD');
    // clearing the textBox should reset the search type and the error
    await user.clear(textBox);
    expect(searchType.value).toBe('general');
    await user.type(textBox, 'Squid Road');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&SearchString=Squid%20Road' })).toBeInTheDocument();
    // searchType should remain 'general'
    expect(searchType.value).toBe('general');
  });

  test('search for meetings based on start or end time', async () => {
    const user = await setupTest('GetSearchResults');
    expect(screen.getByText('Meeting start or end time')).toBeInTheDocument();
    expect(screen.getByText('Format: HH:MM (24 hour time). 12:00 is Noon, 23:59 is Midnight. Leave blank to ignore.')).toBeInTheDocument();
    const startsAfterBox = screen.getByRole('textbox', { name: 'Meeting starts after:' }) as HTMLInputElement;
    const startsBeforeBox = screen.getByRole('textbox', { name: 'Meeting starts before:' }) as HTMLInputElement;
    const endsBeforeBox = screen.getByRole('textbox', { name: 'Meeting ends before:' }) as HTMLInputElement;
    // first test for the correct response after typing each character
    await user.type(startsAfterBox, '2');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&StartsAfterH=2' })).toBeInTheDocument();
    await user.type(startsAfterBox, '0');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&StartsAfterH=20' })).toBeInTheDocument();
    await user.type(startsAfterBox, ':');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&StartsAfterH=20' })).toBeInTheDocument();
    await user.type(startsAfterBox, '5');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&StartsAfterH=20&StartsAfterM=5' })).toBeInTheDocument();
    await user.type(startsAfterBox, '0');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&StartsAfterH=20&StartsAfterM=50' })).toBeInTheDocument();
    await user.type(startsAfterBox, '0');
    expect(screen.getByText(/Invalid time/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBe(null);
    // now just test typing something into all 3 boxes
    await user.clear(startsAfterBox);
    await user.type(startsAfterBox, '3:15');
    await user.type(startsBeforeBox, '12:00');
    await user.type(endsBeforeBox, '11:30');
    expect(
      screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&StartsAfterH=3&StartsAfterM=15&StartsBeforeH=12&EndsBeforeH=11&EndsBeforeM=30' })
    ).toBeInTheDocument();
    // test that invalid time check works for other boxes also
    await user.type(startsBeforeBox, 'Q');
    expect(screen.getByText(/Invalid time/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBe(null);
    await user.clear(startsAfterBox);
    await user.clear(startsBeforeBox);
    await user.clear(endsBeforeBox);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults' })).toBeInTheDocument();
    await user.type(endsBeforeBox, 'Q');
    expect(screen.getByText(/Invalid time/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBe(null);
  });

  test('search for meetings based on duration', async () => {
    const user = await setupTest('GetSearchResults');
    expect(screen.getByText('Meeting duration')).toBeInTheDocument();
    expect(screen.getByText('Format: HH:MM. Leave blank to ignore.')).toBeInTheDocument();
    const minDurationBox = screen.getByRole('textbox', { name: 'Meeting lasts at least:' }) as HTMLInputElement;
    const maxDurationBox = screen.getByRole('textbox', { name: 'Meeting lasts at most:' }) as HTMLInputElement;
    // testing for the correct response after typing each character was tested already in search for meetings based on start or end time
    await user.type(minDurationBox, '1:00');
    await user.type(maxDurationBox, '2:30');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&MinDurationH=1&MaxDurationH=2&MaxDurationM=30' })).toBeInTheDocument();
    await user.type(minDurationBox, 'Q');
    expect(screen.getByText(/Invalid time/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBe(null);
    await user.clear(minDurationBox);
    await user.clear(maxDurationBox);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults' })).toBeInTheDocument();
    await user.type(maxDurationBox, '24:00');
    expect(screen.getByText(/Invalid time/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBe(null);
  });

  test('return only specific fields', async () => {
    const user = await setupTest('GetSearchResults');
    expect(screen.getByText('Return only specific fields')).toBeInTheDocument();
    expect(screen.getByText('The order of the response will be determined by the server.')).toBeInTheDocument();
    const s = screen.getByRole('checkbox', { name: 'State' });
    await user.click(s);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&data_field_key=location_province' })).toBeInTheDocument();
    const k = screen.getByRole('checkbox', { name: 'Key with & in it' });
    await user.click(k);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&data_field_key=weird%26key,location_province' })).toBeInTheDocument();
  });

  test('response sort order', async () => {
    const user = await setupTest('GetSearchResults');
    expect(screen.getByText('Response sort order')).toBeInTheDocument();
    expect(screen.getByText(/Select fields to be used in sorting the result. The result will be sorted first by the field/)).toBeInTheDocument();
    const serviceBodySelect = screen.getByRole('combobox', { name: 'Service Body ID' }) as HTMLSelectElement;
    // no sort options selected yet -- the enabled options should only be "Don't sort" and "1"
    expect(serviceBodySelect.length).toBe(5);
    expect(serviceBodySelect.item(0)?.label).toBe('Choose option ...');
    expect(serviceBodySelect.item(1)?.label).toBe('Don\'t sort');
    expect(serviceBodySelect.item(2)?.label).toBe('1');
    expect(serviceBodySelect.item(3)?.label).toBe('2');
    expect(serviceBodySelect.item(4)?.label).toBe('3');
    expect(serviceBodySelect.item(1)).not.toBeDisabled();
    expect(serviceBodySelect.item(2)).not.toBeDisabled();
    expect(serviceBodySelect.item(3)).toBeDisabled();
    expect(serviceBodySelect.item(4)).toBeDisabled();
    expect(serviceBodySelect.value).toBe('0');
    expect(serviceBodySelect.item(1)).not.toBeDisabled();
    // make 'Service Body ID' be the first field in the sort order, and check the URL
    await userEvent.selectOptions(serviceBodySelect, ['1']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&sort_keys=service_body_bigint' })).toBeInTheDocument();
    const stateSelect = screen.getByRole('combobox', { name: 'State' }) as HTMLSelectElement;
    // make 'Key with & in it' be the second field in the sort order
    const weirdKeySelect = screen.getByRole('combobox', { name: 'Key with & in it' }) as HTMLSelectElement;
    await userEvent.selectOptions(weirdKeySelect, ['2']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&sort_keys=service_body_bigint,weird%26key' })).toBeInTheDocument();
    // check that the appropriate options are enabled or disabled for the three fields
    expect(serviceBodySelect.item(1)).not.toBeDisabled();
    expect(serviceBodySelect.item(2)).not.toBeDisabled();
    expect(serviceBodySelect.item(3)).toBeDisabled();
    expect(serviceBodySelect.item(4)).not.toBeDisabled();
    expect(stateSelect.item(1)).not.toBeDisabled();
    expect(stateSelect.item(2)).toBeDisabled();
    expect(stateSelect.item(3)).toBeDisabled();
    expect(stateSelect.item(4)).not.toBeDisabled();
    expect(weirdKeySelect.item(1)).not.toBeDisabled();
    expect(weirdKeySelect.item(2)).toBeDisabled();
    expect(weirdKeySelect.item(3)).not.toBeDisabled();
    expect(weirdKeySelect.item(4)).toBeDisabled();
    // now make 'State' be the third field in the sort, and check the new state of all options
    await userEvent.selectOptions(stateSelect, ['3']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&sort_keys=service_body_bigint,weird%26key,location_province' })).toBeInTheDocument();
    expect(serviceBodySelect.item(1)).not.toBeDisabled();
    expect(serviceBodySelect.item(2)).not.toBeDisabled();
    expect(serviceBodySelect.item(3)).toBeDisabled();
    expect(serviceBodySelect.item(4)).toBeDisabled();
    expect(stateSelect.item(1)).not.toBeDisabled();
    expect(stateSelect.item(2)).toBeDisabled();
    expect(stateSelect.item(3)).toBeDisabled();
    expect(stateSelect.item(4)).not.toBeDisabled();
    expect(weirdKeySelect.item(1)).not.toBeDisabled();
    expect(weirdKeySelect.item(2)).toBeDisabled();
    expect(weirdKeySelect.item(3)).not.toBeDisabled();
    expect(weirdKeySelect.item(4)).toBeDisabled();
    // Drop 'Key with & in it' from the sort order.  'Service Body ID' should still be first, but now 'State' should move to second.
    await userEvent.selectOptions(weirdKeySelect, ['0']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults&sort_keys=service_body_bigint,location_province' })).toBeInTheDocument();
    expect(serviceBodySelect.value).toBe('1');
    expect(stateSelect.value).toBe('2');
    expect(weirdKeySelect.value).toBe('0');
  });
});
