// Utility function for authenticated API calls
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
}

// Helper to make GET requests
export async function apiGet(url: string) {
  return fetchWithAuth(url, { method: 'GET' });
}

// Helper to make POST requests
export async function apiPost(url: string, data: any) {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Helper to make PUT requests
export async function apiPut(url: string, data: any) {
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Helper to make DELETE requests
export async function apiDelete(url: string) {
  return fetchWithAuth(url, { method: 'DELETE' });
}