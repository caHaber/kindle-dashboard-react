import { useState, useCallback } from "react";
import { useMotherDuckClientState } from "../motherduck/context/motherduckClientContext";

export const useFetchQuery = (query: string) => {
  const { safeEvaluateQuery } = useMotherDuckClientState();
  const [error, setError] = useState<string | null>(null);

  const fetchKindleReadingData = useCallback(async () => {
    try {
      await safeEvaluateQuery('USE "kindle-data"');
      const safeResult = await safeEvaluateQuery(query);
      if (safeResult.status === "success") {
        setError(null);
        return safeResult.result.data.toRows().map((row) => {
          return row;
        });
      } else {
        setError(safeResult.err.message);
        return [];
      }
    } catch (error) {
      setError("fetchKindleReadingData failed with error: " + error);
      return [];
    }
  }, [safeEvaluateQuery, query]);

  return { fetchKindleReadingData, error };
};
