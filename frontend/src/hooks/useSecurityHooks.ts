
import { useQuery } from '@tanstack/react-query';
import { fetchSecurity, fetchHistorical } from '../api/api';
import { customLogger } from '@/lib/utils';

export const useSecurity = (ticker: string) => {

    return useQuery({
        queryKey: ['ticker', ticker],
        queryFn: () => {
            customLogger("Security request made for: " + ticker);
            return fetchSecurity(ticker);
        },
        staleTime: 1000 * 60 * 5, // cache for 5 minutes
        enabled: !!ticker && ticker.trim().length > 0, // Only fetch when ticker is provided
    });
};

export interface HistoricalDataPoint {
    Date?: string;
    Datetime?: string;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
    Dividends: number;
    "Stock Splits": number;
}

export const useHistorical = (ticker: string, period: string, interval?: string) => {
    return useQuery<HistoricalDataPoint[]>({
        queryKey: ['historical', ticker, period, interval],
        queryFn: () => {
            customLogger(`Historical request made for: ${ticker} (${period}, ${interval ?? 'default'})`);
            return fetchHistorical(ticker, period, interval);
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!ticker && ticker.trim().length > 0,
    });
};