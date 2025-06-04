import { beforeAll, afterAll, describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import App from '../App.svelte';
import { consoleError, dummyURL, setUpMockFetch, setupTest } from './common';

beforeAll(setUpMockFetch);
afterAll(vi.resetAllMocks);

describe('server error tests', () => {
  test('aggregator error', async () => {
    const user = await setupTest('GetServerInfo', false, true);
    expect(screen.getByText(/mocked aggregator error/)).toBeInTheDocument();
    expect(consoleError).toBe('Failed to fetch server list -- Error: mocked aggregator error');
  });

  test('type in a bad root server URL', async () => {
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

  test('type in another bad root server URL - throws an exception', async () => {
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

  test('server error for search for meetings with a specific value of a field option', async () => {
    const user = await setupTest('GetSearchResults');
    const field = screen.getByRole('combobox', { name: 'Field:' }) as HTMLSelectElement;
    await userEvent.selectOptions(field, ['very_BAD_field']);
    expect(screen.getByText(/Server error -- Error: server response said not OK/)).toBeInTheDocument();
    // this doesn't kill the response URL entirely; it just leaves off the parameters to search for a specific value of a field
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults' })).toBeInTheDocument();
    // another kind of error ....
    await userEvent.selectOptions(field, ['THROW_EXECPTION_field']);
    expect(screen.getByText(/Server error -- Error: mocked server error/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetSearchResults' })).toBeInTheDocument();
  });
});
