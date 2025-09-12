export interface InfinitePaginationProps {
  hasNext: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}
