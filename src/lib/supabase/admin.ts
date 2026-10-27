
import "server-only";

/**
 * Серверные запросы Supabase.
 *
 * Важно:
 * - Auth Admin API используется для создания и удаления Auth-пользователей.
 * - Database REST API используется для чтения таблиц profiles, departments и других таблиц.
 * - Service Role Key никогда не должен попадать в клиентский код.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseCredentials(): {
  url: string;
  serviceKey: string;
} {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Не настроены NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return {
    url: supabaseUrl.replace(/\/+$/, ""),
    serviceKey: supabaseServiceKey,
  };
}

function serviceHeaders(options?: RequestInit): Headers {
  const { serviceKey } = getSupabaseCredentials();
  const headers = new Headers(options?.headers);

  headers.set("apikey", serviceKey);
  headers.set("Authorization", `Bearer ${serviceKey}`);

  if (!headers.has("Content-Type") && options?.body) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as
      | { message?: string; msg?: string; error_description?: string; error?: string }
      | null;

    const message =
      errorBody?.message ??
      errorBody?.msg ??
      errorBody?.error_description ??
      errorBody?.error ??
      `Supabase вернул ошибку HTTP ${response.status}.`;

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

/**
 * Auth Admin API.
 *
 * Примеры endpoint: users, users/{id}.
 */
async function authRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { url } = getSupabaseCredentials();
  const normalizedEndpoint = endpoint.replace(/^\/+/, "");

  const response = await fetch(
    `${url}/auth/v1/admin/${normalizedEndpoint}`,
    {
      ...options,
      headers: serviceHeaders(options),
      cache: "no-store",
    }
  );

  return parseResponse<T>(response);
}

/**
 * Database REST API (PostgREST).
 *
 * Примеры endpoint:
 * profiles?id=eq.<uuid>&select=id,role
 * departments?select=id,name
 */
async function databaseRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { url } = getSupabaseCredentials();
  const normalizedEndpoint = endpoint.replace(/^\/+/, "");

  const response = await fetch(
    `${url}/rest/v1/${normalizedEndpoint}`,
    {
      ...options,
      headers: serviceHeaders(options),
      cache: "no-store",
    }
  );

  return parseResponse<T>(response);
}

export const adminRest = {
  /**
   * Auth Admin API — оставлено для совместимости
   * с существующими вызовами adminRest.request().
   */
  request: authRequest,

  /**
   * Database REST API.
   * Используйте этот метод для таблиц PostgreSQL.
   */
  dbRequest: databaseRequest,

  async createUser(userData: {
    email: string;
    password: string;
    email_confirm?: boolean;
    phone?: string;
    phone_confirm?: boolean;
    user_metadata?: Record<string, unknown>;
  }) {
    return authRequest<{
      id: string;
      email?: string;
      created_at?: string;
      user_metadata?: Record<string, unknown>;
    }>("users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async deleteUser(userId: string): Promise<void> {
    await authRequest<void>(
      `users/${encodeURIComponent(userId)}`,
      { method: "DELETE" }
    );
  },

  async getUser(userId: string) {
    return authRequest<{
      id: string;
      email?: string;
      created_at?: string;
      user_metadata?: Record<string, unknown>;
    }>(`users/${encodeURIComponent(userId)}`, {
      method: "GET",
    });
  },

  async listUsers(params?: { page?: number; perPage?: number }) {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", String(params.page));
    if (params?.perPage) query.set("per_page", String(params.perPage));

    const suffix = query.toString() ? `?${query.toString()}` : "";

    return authRequest<unknown>(`users${suffix}`, {
      method: "GET",
    });
  },

  async updateUser(
    userId: string,
    data: Record<string, unknown>
  ) {
    return authRequest<unknown>(
      `users/${encodeURIComponent(userId)}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },
};

// Существующие функции оставлены, чтобы не ломать импорты других API.
export const createAuthUser = adminRest.createUser.bind(adminRest);
export const deleteAuthUser = adminRest.deleteUser.bind(adminRest);

export async function createUserViaAdminAPI(userData: {
  email: string;
  password: string;
  email_confirm: boolean;
  user_metadata: Record<string, unknown>;
}) {
  return adminRest.createUser(userData);
}

export async function deleteUserViaAdminAPI(
  userId: string
): Promise<void> {
  return adminRest.deleteUser(userId);
}

