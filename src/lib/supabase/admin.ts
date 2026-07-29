// Конфигурация для Admin API (только на сервере)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase admin credentials')
}

// REST-клиент для Admin API
export const adminRest = {
  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Admin API error: ${response.status}`)
    }

    return response.json()
  },

  // Создание пользователя
  async createUser(userData: {
    email: string
    password: string
    email_confirm?: boolean
    user_metadata?: Record<string, any>
  }) {
    return this.request('users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  // Удаление пользователя
  async deleteUser(userId: string) {
    return this.request(`users/${userId}`, {
      method: 'DELETE',
    })
  },

  // Получение пользователя
  async getUser(userId: string) {
    return this.request(`users/${userId}`, {
      method: 'GET',
    })
  },

  // Список пользователей
  async listUsers(params?: { page?: number; perPage?: number }) {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.perPage) query.set('per_page', String(params.perPage))
    
    const url = `users${query.toString() ? `?${query.toString()}` : ''}`
    return this.request(url, { method: 'GET' })
  },

  // Обновление пользователя
  async updateUser(userId: string, data: Record<string, any>) {
    return this.request(`users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// Создание пользователя через Admin API (совместимость с существующим кодом)
export const createAuthUser = adminRest.createUser.bind(adminRest)

// Удаление пользователя через Admin API (совместимость с существующим кодом)
export const deleteAuthUser = adminRest.deleteUser.bind(adminRest)

// Для обратной совместимости с нашим новым кодом
export async function createUserViaAdminAPI(userData: {
  email: string
  password: string
  email_confirm: boolean
  user_metadata: Record<string, any>
}) {
  return adminRest.createUser(userData)
}

export async function deleteUserViaAdminAPI(userId: string) {
  return adminRest.deleteUser(userId)
}
