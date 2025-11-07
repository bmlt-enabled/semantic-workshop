import { beforeAll, afterAll, describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import { dummyURL, setUpMockFetch, setupTest } from './common';

beforeAll(setUpMockFetch);
afterAll(vi.resetAllMocks);

describe('component tests (except get meetings)', () => {
  test('Get Service Bodies', async () => {
    await setupTest('GetServiceBodies');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetServiceBodies' })).toBeInTheDocument();
    // GetServiceBodies now has proper parameters (service selection, recursive, parents)
    expect(screen.getByText('Return only specific service bodies')).toBeInTheDocument();
    expect(screen.getByText('Exclude specific service bodies from results')).toBeInTheDocument();
    expect(screen.getByText('Service body hierarchy options')).toBeInTheDocument();
    expect(screen.getByText('Include child service bodies')).toBeInTheDocument();
    expect(screen.getByText('Include parent service bodies')).toBeInTheDocument();
    // Both checkboxes should be disabled initially since no service bodies are selected
    expect(screen.getByRole('checkbox', { name: 'Include child service bodies' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Include parent service bodies' })).toBeDisabled();
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
    // TODO -- should test picking a date range.  Unfortunately trying to test this gives an error (the testing library doesn't like
    // the animation).  The commented out line to click on the date picker will trigger the error.
    screen.getByRole('button', { name: /Open date picker/ });
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
    await setupTest('GetFieldKeys');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFieldKeys' })).toBeInTheDocument();
    expect(screen.getByText('- no parameters for this operation -')).toBeInTheDocument();
  });

  test('Get a List of Specific Field Values', async () => {
    await setupTest('GetFieldValues');
    expect(screen.getByText(/- none -/)).toBeInTheDocument();
    const field = screen.getByRole('combobox', { name: 'Field:' }) as HTMLSelectElement;
    expect(field.item(0)?.label).toBe('Choose option ...');
    // note that these get alphabetized
    expect(field.item(1)?.label).toBe('Key with & in it');
    expect(field.item(2)?.label).toBe('Service Body ID');
    expect(field.item(3)?.label).toBe('State');
    expect(field.item(4)?.label).toBe('Throw Exception Field');
    expect(field.item(5)?.label).toBe('Very Bad Field');
    await userEvent.selectOptions(field, ['location_province']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFieldValues&meeting_key=location_province' })).toBeInTheDocument();
    await userEvent.selectOptions(field, ['weird&key']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetFieldValues&meeting_key=weird%26key' })).toBeInTheDocument();
  });

  test('Get a NAWS Format Export', async () => {
    await setupTest('GetNAWSDump');
    expect(screen.getByText(/- none -/)).toBeInTheDocument();
    const field = screen.getByRole('combobox', { name: 'Service body:' }) as HTMLSelectElement;
    expect(field.item(0)?.label).toBe('Choose option ...');
    expect(field.item(1)?.label).toBe('Big Zone');
    expect(field.item(2)?.label).toBe('Northern Region');
    expect(field.item(3)?.label).toBe('Southern Region');
    await userEvent.selectOptions(field, ['9']);
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/csv/?switcher=GetNAWSDump&sb_id=9' })).toBeInTheDocument();
  });

  test('Get Server Information', async () => {
    await setupTest('GetServerInfo');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetServerInfo' })).toBeInTheDocument();
    expect(screen.getByText('- no parameters for this operation -')).toBeInTheDocument();
  });

  test('Get Geographic Coverage Area', async () => {
    await setupTest('GetCoverageArea');
    expect(screen.getByRole('link', { name: dummyURL + 'client_interface/json/?switcher=GetCoverageArea' })).toBeInTheDocument();
    // Should show coverage area description
    expect(screen.getByText(/Coverage area for this BMLT server/i)).toBeInTheDocument();
    // Wait for the map component to be present (it loads after data fetch)
    await waitFor(
      () => {
        // The map container div should be rendered after data loads
        const mapContainers = document.querySelectorAll('.h-96.overflow-hidden.rounded-lg');
        expect(mapContainers.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });
});
