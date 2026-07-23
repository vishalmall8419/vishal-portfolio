import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export function useResourceList(api, extraParams = {}) {
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [pagination, setPagination] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const extraKey = JSON.stringify(extraParams);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .list({ page, limit: 10, q: q || undefined, ...JSON.parse(extraKey) })
      .then(({ data }) => {
        if (!active) return;
        setRows(data.data);
        setPagination(data.pagination);
      })
      .catch(() => {
        if (active) setRows([]);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, reloadKey, extraKey]);

  const onSearch = (value) => {
    setQ(value);
    setPage(1);
  };

  return { rows, loading, page, setPage, q, onSearch, pagination, reload };
}
