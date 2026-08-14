const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type Dashboard = {
  invoices: {
    total: number;
    draft: number;
    finalized: number;
    paid: number;
    pending: number;
    overdue: number;
    cancelled: number;
  };
  customers: {
    total: number;
  };
  financials: {
    invoicedAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  };
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    status: string;
    total: string;
    invoiceDate: string;
    dueDate: string | null;
    customer: {
      name: string;
      companyName: string | null;
    } | null;
  }>;
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("hisabbookes_access_token")
      : null;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? `API_ERROR_${response.status}`);
  }

  return data as T;
}

export function saveAccessToken(token: string) {
  window.localStorage.setItem("hisabbookes_access_token", token);
}

export function clearAccessToken() {
  window.localStorage.removeItem("hisabbookes_access_token");
}
