// Конфигурация для Admin API (только на сервере)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase admin credentials')
}

// Создание пользователя через Admin API
export async function createUserViaAdminAPI(userData: {
  email: string
  password: string
  email_confirm: boolean
  user_metadata: Record<string, any>
}) {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Ошибка создания пользователя')
  }

  return response.json()
}

// Удаление пользователя через Admin API
export async function deleteUserViaAdminAPI(userId: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Ошибка удаления пользователя')
  }

  return response.json()
}

// Получение пользователя через Admin API
export async function getUserViaAdminAPI(userId: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Ошибка получения пользователя')
  }

  return response.json()
}
