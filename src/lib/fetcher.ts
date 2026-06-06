export const fetcher = (url: string) => {
  const token = localStorage.getItem("access_token");
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => {
    if (!res.ok) throw new Error("An error occurred while fetching the data.");
    return res.json();
  });
};
