declare global {
  interface Window {
    pageManager: {
      navigateTo: (page: string) => void;
      getAvailablePages: () => string[];
      getCurrentPage: () => any;
    };
  }
}

export {}; 