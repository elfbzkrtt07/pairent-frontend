const API_URL = "http://127.0.0.1:5000";

export type Breakroom = {
  id: string;
  name: string;
  url: string;
};

// Get all breakrooms
export async function listBreakrooms(): Promise<Breakroom[]> {
  const res = await fetch(`${API_URL}/breakrooms`);
  const data = await res.json();

  // Daily API returns {data: [...]}
  return (
    data.data?.map((r: any) => ({
      id: r.name,
      name: r.name,
      url: r.url,
    })) || []
  );
}

// Create new breakroom
export async function createBreakroom(name: string): Promise<Breakroom> {
  const res = await fetch(`${API_URL}/breakrooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return await res.json();
}