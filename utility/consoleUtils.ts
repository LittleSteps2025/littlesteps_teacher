// Console utilities to suppress React warnings
export const suppressReactWarnings = () => {
  if (!__DEV__) {
    // In production, suppress all warnings and errors
    console.warn = () => {};
    console.error = () => {};
  } else {
    // In development, suppress specific React warnings
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args) => {
      // Suppress "Each child in a list should have a unique 'key' prop" warnings
      if (args[0] && typeof args[0] === 'string' &&
          (args[0].includes('Each child in a list should have a unique "key" prop') ||
           args[0].includes('Warning: Each child in a list should have a unique'))) {
        return;
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      // Suppress React key warnings in error level too
      if (args[0] && typeof args[0] === 'string' &&
          (args[0].includes('Each child in a list should have a unique "key" prop') ||
           args[0].includes('Warning: Each child in a list should have a unique'))) {
        return;
      }
      originalError.apply(console, args);
    };
  }
};