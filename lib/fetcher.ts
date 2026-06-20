import { toast } from "sonner";

export async function fetcher<T>(
  url: string,
  options: RequestInit,
  defaultErrorMessage: string = "Terjadi kesalahan"
): Promise<T | null> {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      toast.error(data?.error || defaultErrorMessage);
      return null;
    }
    
    return data as T;
  } catch (error) {
    console.error("Fetch error:", error);
    toast.error("Terjadi kesalahan sistem. Silakan coba lagi.");
    return null;
  }
}
