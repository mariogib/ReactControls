type SetStateAction<T> = T | ((prevState: T) => T);
type Dispatch<T> = (value: SetStateAction<T>) => void;
type DependencyList = readonly unknown[];

interface ReactFilteredReportApi {
  useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  useEffect(effect: () => void | (() => void), dependencies?: DependencyList): void;
  useRef<T>(initialValue: T): { current: T };
}

type UseAsyncListResult<TItem> = {
  items: TItem[];
  loading: boolean;
  error: string | null;
};

type UseAsyncListLike = <TItem>(
  loadItems: () => Promise<TItem[]>,
  dependencies?: DependencyList,
  options?: { errorMessage?: string },
) => UseAsyncListResult<TItem>;

type FilterItems<TItem, TFilters> = (items: TItem[], filters: TFilters) => TItem[];

type UseFilteredReportOptions<TItem, TFilters> = {
  loadItems: () => Promise<TItem[]>;
  errorMessage: string;
  initialFilters: TFilters;
  filterItems: FilterItems<TItem, TFilters>;
};

export function createUseFilteredReport(react: ReactFilteredReportApi, useAsyncList: UseAsyncListLike) {
  return function useFilteredReport<TItem, TFilters extends object>({
    loadItems,
    errorMessage,
    initialFilters,
    filterItems,
  }: UseFilteredReportOptions<TItem, TFilters>) {
    const { items, loading, error } = useAsyncList<TItem>(loadItems, [], { errorMessage });
    const [filters, setFilters] = react.useState<TFilters>(initialFilters);
    const [filteredData, setFilteredData] = react.useState<TItem[]>([]);
    const filterItemsRef = react.useRef(filterItems);
    const initialFiltersRef = react.useRef(initialFilters);

    react.useEffect(() => {
      filterItemsRef.current = filterItems;
    }, [filterItems]);

    react.useEffect(() => {
      setFilteredData(filterItemsRef.current(items, filters));
    }, [filters, items]);

    function updateFilter<K extends keyof TFilters>(field: K, value: TFilters[K]) {
      setFilters((current) => ({
        ...current,
        [field]: value,
      }));
    }

    function resetFilters() {
      setFilters(initialFiltersRef.current);
    }

    return {
      items,
      filteredData,
      loading,
      error,
      filters,
      updateFilter,
      resetFilters,
    };
  };
}
