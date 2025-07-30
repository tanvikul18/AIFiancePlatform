import { useState, useEffect, useCallback } from 'react';

function useDebouncedSearch(initialValue, options = {}) {
  const { delay = 500, immediate = false } = options;

  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);

  const setSearchTermDebounced = useCallback(term => {
    setSearchTerm(term);
  }, []);

  useEffect(() => {
    if (immediate && searchTerm === initialValue) {
      setDebouncedTerm(searchTerm);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay, initialValue, immediate]);

  return { debouncedTerm, searchTerm, setSearchTerm: setSearchTermDebounced };
}

export default useDebouncedSearch;
