import { vi } from 'vitest';

export function setUpMockFetch() {
  vi.spyOn(global, 'fetch').mockImplementation(mockFetch);
}

function mockResponse(url: string) {
  if (/badzone/.test(url)) {
    throw new Error('mocked server error');
  } else if (/smallzone.*GetServerInfo/.test(url)) {
    return [{ langs: 'it', nativeLang: 'it' }];
  } else if (/GetServerInfo/.test(url)) {
    return [{ langs: 'en,es,de', nativeLang: 'en' }];
  } else if (/GetServiceBodies/.test(url)) {
    return [
      { name: 'Big Zone', id: 5 },
      { name: 'Northern Region', id: 8 },
      { name: 'Southern Region', id: 9 }
    ];
  } else if (/GetFieldKeys/.test(url)) {
    return [
      { key: 'service_body_bigint', description: 'Service Body ID' },
      { key: 'start_time', description: 'Start Time' }
    ];
  } else {
    throw new Error('Internal error: no mocked response for this request' + url);
  }
}

// hack around the type system -- what we want is something like this:
//     function mockFetch(url: string): Promise<Response>
function mockFetch(url: any): any {
  return Promise.resolve({
    json: () => Promise.resolve(mockResponse(url))
  });
}
