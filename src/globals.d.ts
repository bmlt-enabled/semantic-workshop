declare const settings: {
  apiBaseUrl: string;
};

declare global {
  interface Window {
    settings: {
      apiBaseUrl: string;
    };
  }
}
