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

describe('semantic workshop tests', () => {
  test('initial screen', async () => {
    // make this test independent of whether the initial default for the server URL is a valid URL or the empty string
    render(App);
    expect(screen.getByRole('heading', { name: 'BMLT Semantic Workshop', level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText('Response URL:')).toBeInTheDocument();
    const rootServerURL = screen.getByRole('textbox', { name: 'Root server URL:' }) as HTMLInputElement;
    expect(screen.getByRole('button', { name: 'Update root server URL' })).toBeDisabled();
    const operation = screen.getByRole('combobox', { name: 'Operation:' }) as HTMLSelectElement;
    expect(operation.value).toBe('GetServiceBodies');
  });

  test('test Get Service Bodies', async () => {
    const user = await selectOperation('GetServiceBodies');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetServiceBodies' })).toBeInTheDocument();
  });

  test('test Get Meeting Search Results', async () => {
    const user = await selectOperation('GetSearchResults');
    // TODO: NOT FINISHED
  });

  test('test Get Formats', async () => {
    const user = await selectOperation('GetFormats');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFormats' })).toBeInTheDocument();
    const formatLanguage = screen.getByRole('combobox', { name: 'Format language:' }) as HTMLSelectElement;
    expect(formatLanguage.item(0)?.label).toBe('Server Language');
    expect(formatLanguage.item(1)?.label).toBe('English');
    expect(formatLanguage.item(2)?.label).toBe('Español');
    expect(formatLanguage.item(3)?.label).toBe('Deutsch');
    await userEvent.selectOptions(formatLanguage, ['de']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFormats&lang_enum=de' })).toBeInTheDocument();
    const allFormats = screen.getByRole('checkbox', { name: 'Show All Formats' }) as HTMLInputElement;
    expect(allFormats.checked).toBe(false);
    await user.click(allFormats);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFormats&lang_enum=de&show_all=1' })).toBeInTheDocument();
    await userEvent.selectOptions(formatLanguage, ['']);
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
    expect(serviceBody.item(0)?.label).toBe('No service body selected');
    expect(serviceBody.item(1)?.label).toBe('Big Zone');
    expect(serviceBody.item(2)?.label).toBe('Northern Region');
    expect(serviceBody.item(3)?.label).toBe('Southern Region');
    await userEvent.selectOptions(serviceBody, ['8']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetChanges&service_body_id=8' })).toBeInTheDocument();
  });

  test('test Get a List of Available Field Keys', async () => {
    const user = await selectOperation('GetFieldKeys');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFieldKeys' })).toBeInTheDocument();
  });

  test('test Get a List of Specific Field Values', async () => {
    const user = await selectOperation('GetFieldValues');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFieldValues&meeting_key=service_body_bigint' })).toBeInTheDocument();
    const field = screen.getByRole('combobox', { name: 'Field:' }) as HTMLSelectElement;
    expect(field.item(0)?.label).toBe('Service Body ID');
    expect(field.item(1)?.label).toBe('Start Time');
    await userEvent.selectOptions(field, ['start_time']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFieldValues&meeting_key=start_time' })).toBeInTheDocument();
  });

  test('test Get a NAWS Format Export', async () => {
    const user = await selectOperation('GetNAWSDump');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetNAWSDump&sb_id=5' })).toBeInTheDocument();
    const field = screen.getByRole('combobox', { name: 'Service body:' }) as HTMLSelectElement;
    expect(field.item(0)?.label).toBe('Big Zone');
    expect(field.item(1)?.label).toBe('Northern Region');
    expect(field.item(2)?.label).toBe('Southern Region');
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
    expect(menu.value).toBe('GetServiceBodies');
    expect(screen.getByRole('link', { name: 'https://smallzone.org/main_server/client_interface/json/?switcher=GetServiceBodies' })).toBeInTheDocument();
    // we should see parameters for smallzone now
    await userEvent.selectOptions(menu, ['GetFormats']);
    const formatLanguage = screen.getByRole('combobox', { name: 'Format language:' }) as HTMLSelectElement;
    expect(formatLanguage.length).toBe(2);
    expect(formatLanguage.item(0)?.label).toBe('Server Language');
    expect(formatLanguage.item(1)?.label).toBe('Italiano');
    // finally set the root server URL to the empty string
    await user.clear(rootServerURL);
    await user.click(updateURL);
    expect(screen.queryByRole('link')).toBe(null);
    await userEvent.selectOptions(menu, ['GetNAWSDump']);
    const serviceBodiesMenu = screen.getByRole('combobox', { name: 'Service body:' }) as HTMLSelectElement;
    expect(serviceBodiesMenu.length).toBe(0);
  });

  test('bad root server URL', async () => {
    const user = userEvent.setup();
    render(App);
    const rootServerURL = screen.getByRole('textbox', { name: 'Root server URL:' }) as HTMLInputElement;
    await user.clear(rootServerURL);
    await user.type(rootServerURL, 'https://badzone.org/main_server/');
    const updateURL = screen.getByRole('button', { name: 'Update root server URL' });
    await user.click(updateURL);
    expect(screen.getByText(/Server error -- Error: mocked server error/)).toBeInTheDocument();
  });
});
