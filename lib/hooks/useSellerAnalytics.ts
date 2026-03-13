"use client";

import { useState, useEffect, useCallback } from "react";
import type { AnalyticsData, AnalyticsPeriod } from "@/lib/types/analytics";

export function useSellerAnalytics(period: AnalyticsPeriod) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/seller/analytics?period=${period}`);
            if (!res.ok) throw new Error("Failed to fetch analytics");
            const json = await res.json();
            setData(json);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return { data, isLoading, error, refetch: fetchAnalytics };
}
