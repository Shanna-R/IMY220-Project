export async function apiFetch(
  url,
  options = {}
) {
    const response = await fetch(url, {
        credentials: 'include',
        headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
        },
        ...options
    });

    const data = await response.json();

    if(!response.ok)
    {
        throw new Error(
            data.message || 'Request failed'
        );
    }

    return data;
}