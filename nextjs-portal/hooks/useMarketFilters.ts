import { useCallback, useEffect, useMemo, useState } from "react";
import type { MarketProperty } from "@/lib/types";

export type PriceRange = "all" | "under200" | "between200And350" | "over350";
export type MarketSortKey =
  | "id"
  | "price"
  | "squareFootage"
  | "bedrooms"
  | "yearBuilt"
  | "schoolRating"
  | "distanceToCityCenter";
export type SortDirection = "asc" | "desc";

export type MarketFilters = {
  searchId: string;
  priceRange: PriceRange;
  bedrooms: string;
  minimumSchoolRating: string;
};

const initialFilters: MarketFilters = {
  searchId: "",
  priceRange: "all",
  bedrooms: "all",
  minimumSchoolRating: "all"
};

const PAGE_SIZE = 10;

export function useMarketFilters(properties: MarketProperty[]) {
  const [filters, setFilters] = useState<MarketFilters>(initialFilters);
  const [sortKey, setSortKey] = useState<MarketSortKey>("price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  const updateFilter = useCallback(
    <Key extends keyof MarketFilters>(key: Key, value: MarketFilters[Key]) => {
      setFilters((previous) => ({ ...previous, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => setFilters(initialFilters), []);

  const toggleSort = useCallback((key: MarketSortKey) => {
    setSortKey((previousKey) => {
      if (previousKey === key) {
        setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
        return previousKey;
      }
      setSortDirection("asc");
      return key;
    });
  }, []);

  const filteredProperties = useMemo(() => {
    const filtered = properties.filter((property) => {
      const matchesId =
        filters.searchId === "" || String(property.id).includes(filters.searchId.trim());
      const matchesBedrooms =
        filters.bedrooms === "all" || property.bedrooms === Number(filters.bedrooms);
      const matchesSchoolRating =
        filters.minimumSchoolRating === "all" ||
        property.schoolRating >= Number(filters.minimumSchoolRating);
      const matchesPrice =
        filters.priceRange === "all" ||
        (filters.priceRange === "under200" && property.price < 200000) ||
        (filters.priceRange === "between200And350" &&
          property.price >= 200000 &&
          property.price < 350000) ||
        (filters.priceRange === "over350" && property.price >= 350000);

      return matchesId && matchesBedrooms && matchesSchoolRating && matchesPrice;
    });

    return filtered.sort((left, right) => {
      const difference = left[sortKey] - right[sortKey];
      return sortDirection === "asc" ? difference : -difference;
    });
  }, [filters, properties, sortDirection, sortKey]);

  useEffect(() => {
    setPage(1);
  }, [filters, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleProperties = filteredProperties.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return {
    filters,
    updateFilter,
    resetFilters,
    sortKey,
    sortDirection,
    toggleSort,
    filteredProperties,
    visibleProperties,
    page: currentPage,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE
  };
}

export type MarketFilterState = ReturnType<typeof useMarketFilters>;
