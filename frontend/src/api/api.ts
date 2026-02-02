import apiClient from './client';

export const fetchSecurity = async (ticker: string) => {
  const { data } = await apiClient.get(`/api/v1/info/${ticker}`);
  return data;
};

// export const fetchHistorical = async (ticker: string, period: string = '1y') => {
//   const { data } = await apiClient.get(`/api/v1/historical/${ticker}`, {
//     params: { period },
//   });
//   return data;
// };