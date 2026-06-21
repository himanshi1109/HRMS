import { useState, useCallback } from 'react';

export const usePagination = (initialLimit = 10) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({});

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((term) => {
    setSearch(term);
    setPage(1);
  }, []);

  const handleSort = useCallback((field) => {
    setSortBy((prevSortBy) => {
      if (prevSortBy === field) {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortOrder('asc');
      }
      return field;
    });
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (value === '' || value === null || value === undefined) {
        delete updated[key];
      } else {
        updated[key] = value;
      }
      return updated;
    });
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(1);
    setSearch('');
    setSortBy('');
    setSortOrder('asc');
    setFilters({});
  }, []);

  const getQueryParams = useCallback(() => {
    return {
      page,
      limit,
      search,
      sortBy: sortBy || undefined,
      sortOrder: sortBy ? sortOrder : undefined,
      ...filters,
    };
  }, [page, limit, search, sortBy, sortOrder, filters]);

  return {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    filters,
    handlePageChange,
    handleLimitChange,
    handleSearchChange,
    handleSort,
    handleFilterChange,
    reset,
    getQueryParams,
  };
};

export default usePagination;
