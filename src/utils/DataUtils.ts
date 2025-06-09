export async function fetchData(url: string): Promise<any[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data found');
    }
    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error loading data');
  }
}

export function processExportData(data: any[]): any[] {
  return data.map((row) =>
    Object.keys(row).reduce((acc, key) => {
      let value: string | number = row[key];
      if (typeof value === 'string' && value.includes('#@-@#')) {
        [, value] = value.split('#@-@#');
      }
      acc[key] = value;
      return acc;
    }, {} as any)
  );
}
