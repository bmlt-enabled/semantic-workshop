import { beforeAll, afterAll, describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import App from '../App.svelte';
import { dummyURL, setUpMockFetch, setupTest } from './common';

beforeAll(setUpMockFetch);
afterAll(vi.resetAllMocks);

describe('general app tests', () => {
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
