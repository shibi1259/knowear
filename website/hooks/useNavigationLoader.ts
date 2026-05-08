import { useLoading } from '@/providers/loading/LoadingProvider';

export const useNavigationLoader = () => {
  const { setLoading } = useLoading();

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  const withLoader = async <T,>(
    operation: () => Promise<T>,
    showLoaderForMs: number = 300
  ): Promise<T> => {
    showLoader();
    try {
      const result = await operation();
      return result;
    } finally {
      // Ensure loader shows for at least the minimum time to prevent flickering
      setTimeout(() => {
        hideLoader();
      }, showLoaderForMs);
    }
  };

  return {
    showLoader,
    hideLoader,
    withLoader,
  };
};
