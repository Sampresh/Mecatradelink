import axios from 'axios';

const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1').replace(/\/+$/, '');

// Access token lives in memory only; the refresh token is an httpOnly cookie.
let accessToken = null;
let onSessionChange = () => {};

export const setAccessToken = (token) => { accessToken = token; };
export const registerSessionListener = (fn) => { onSessionChange = fn; };

export const api = axios.create({ baseURL, withCredentials: true, timeout: 20_000 });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshPromise = null;

// One refresh in flight at a time; concurrent 401s wait on the same promise.
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
      .then(({ data }) => {
        setAccessToken(data.data.accessToken);
        onSessionChange(data.data.user);
        return data.data;
      })
      .catch((err) => {
        setAccessToken(null);
        onSessionChange(null);
        throw err;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

const NO_RETRY = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/register'];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const skip = NO_RETRY.some((p) => original?.url?.startsWith(p));
    if (error.response?.status !== 401 || original?._retried || skip) throw error;

    original._retried = true;
    await refreshSession();
    return api(original);
  },
);
