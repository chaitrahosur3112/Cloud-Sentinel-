import { QueryClient } from "react-query";

// Global React Query client.
// staleTime: 2 minutes — data fetched less than 2 minutes ago
//            is not re-fetched even if the component re-mounts.
// retry: 1   — on failure, try once more before showing an error.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          2 * 60 * 1000,
      retry:              1,
      refetchOnWindowFocus: false,
    },
  },
});