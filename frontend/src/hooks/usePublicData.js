import { useEffect, useState } from "react";

/**
 * Small fetch helper shared by every public section/page that reads from
 * the CMS. Keeps loading/error/empty state handling consistent instead of
 * repeating it in every component.
 *
 * fetcher: () => Promise<AxiosResponse<{ success, data }>>
 */
function usePublicData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetcher()
      .then((res) => {
        if (!active) return;
        setData(res?.data?.data ?? null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

export default usePublicData;
