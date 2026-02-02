
import { useQuery } from '@tanstack/react-query';
import { fetchSecurity } from '../api/api';
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