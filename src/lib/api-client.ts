const API_BASE = "/api";

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, ...rest } = config;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    if (queryString) url += `?${queryString}`;
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...rest.headers,
    },
    ...rest,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Dashboard
  getDashboard: () => request("/dashboard"),
  getStats: () => request("/stats"),
  getHealth: () => request("/health"),

  // Inventory
  getInventory: (params?: Record<string, string>) => request("/inventory", { params }),
  createInventory: (data: any) => request("/inventory", { method: "POST", body: JSON.stringify(data) }),
  getInventoryItem: (id: string) => request(`/inventory/${id}`),
  updateInventoryItem: (id: string, data: any) => request(`/inventory/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteInventoryItem: (id: string) => request(`/inventory/${id}`, { method: "DELETE" }),

  // Consumables
  getConsumables: (params?: Record<string, string>) => request("/consumables", { params }),
  createConsumable: (data: any) => request("/consumables", { method: "POST", body: JSON.stringify(data) }),
  getConsumable: (id: string) => request(`/consumables/${id}`),
  updateConsumable: (id: string, data: any) => request(`/consumables/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteConsumable: (id: string) => request(`/consumables/${id}`, { method: "DELETE" }),

  // Stock Movements
  getStockMovements: (params?: Record<string, string>) => request("/stock-movements", { params }),
  createStockMovement: (data: any) => request("/stock-movements", { method: "POST", body: JSON.stringify(data) }),

  // Requests
  getRequests: (params?: Record<string, string>) => request("/requests", { params }),
  createRequest: (data: any) => request("/requests", { method: "POST", body: JSON.stringify(data) }),
  getRequest: (id: string) => request(`/requests/${id}`),
  approveRequest: (id: string) => request("/requests", { method: "PATCH", body: JSON.stringify({ requestId: id, action: "approve" }) }),
  rejectRequest: (id: string, reason?: string) => request("/requests", { method: "PATCH", body: JSON.stringify({ requestId: id, action: "reject", rejectionReason: reason }) }),

  // Users
  getUsers: (params?: Record<string, string>) => request("/users", { params }),
  createUser: (data: any) => request("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => request("/users", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),

  // Departments
  getDepartments: (params?: Record<string, string>) => request("/departments", { params }),
  createDepartment: (data: any) => request("/departments", { method: "POST", body: JSON.stringify(data) }),

  // Reports
  getReport: (params?: Record<string, string>) => request("/reports", { params }),

  // Notifications
  getNotifications: () => request("/notifications"),
  markNotificationRead: (id: string) => request("/notifications", { method: "PATCH", body: JSON.stringify({ id }) }),
  markAllNotificationsRead: () => request("/notifications", { method: "PATCH", body: JSON.stringify({ markAll: true }) }),

  // Audit Logs
  getAuditLogs: (params?: Record<string, string>) => request("/audit-logs", { params }),

  // Settings
  getSettings: () => request("/settings"),
  updateSettings: (data: any) => request("/settings", { method: "PATCH", body: JSON.stringify(data) }),

  // Search
  search: (query: string) => request("/search", { params: { q: query } }),

  // Backup
  getBackup: () => request("/backup"),
  restoreBackup: (data: any) => request("/backup", { method: "POST", body: JSON.stringify(data) }),

  // Import
  bulkImport: (data: any) => request("/import", { method: "POST", body: JSON.stringify(data) }),

  // Alerts
  processAlerts: () => request("/alerts"),
};

export default api;