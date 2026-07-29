import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { 
  createUserViaAdminAPI, 
  deleteUserViaAdminAPI 
} from '@/lib/supabase/admin'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Разрешенные роли для создания
const ALLOWED_CREATOR_ROLES = ['admin', 'hr_admin']

// Кто какую роль может создавать
const ROLE_HIERARCHY: Record<string, string[]> = {
  admin: ['employee', 'manager', 'hr_admin', 'admin'],
  hr_admin: ['employee', 'manager'],
}

export async function POST(request: Request) {
  try {
    // 1. Получаем access token из cookies
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    // 2. Получаем текущего пользователя через REST
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': supabaseAnonKey,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const user = await userResponse.json()

    // 3. Проверяем роль текущего пользователя через REST
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=role`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': supabaseAnonKey,
        },
      }
    )

    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: 'Профиль пользователя не найден' },
        { status: 404 }
      )
    }

    const profiles = await profileResponse.json()
    const currentUserProfile = profiles[0]

    if (!currentUserProfile) {
      return NextResponse.json(
        { error: 'Профиль пользователя не найден' },
        { status: 404 }
      )
    }

    const currentRole = currentUserProfile.role
    
    if (!ALLOWED_CREATOR_ROLES.includes(currentRole)) {
      return NextResponse.json(
        { error: 'Недостаточно прав для создания пользователей' },
        { status: 403 }
      )
    }

    // 4. Получаем данные из тела запроса
    const body = await request.json()
    const { 
      employee_id, 
      full_name, 
      phone = null, 
      department_id = null, 
      role = 'employee',
      password 
    } = body

    // 5. Валидация
    if (!employee_id || !full_name || !password) {
      return NextResponse.json(
        { error: 'Табельный номер, ФИО и пароль обязательны' },
        { status: 400 }
      )
    }

    if (!/^\d+$/.test(employee_id)) {
      return NextResponse.json(
        { error: 'Табельный номер должен содержать только цифры' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Пароль должен быть не менее 8 символов' },
        { status: 400 }
      )
    }

    const allowedRoles = ROLE_HIERARCHY[currentRole] || []
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `Вы не можете создавать пользователей с ролью "${role}"` },
        { status: 403 }
      )
    }

    // 6. Проверяем, не существует ли уже такой табельный номер
    const existingProfileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?employee_id=eq.${employee_id}&select=employee_id`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': supabaseAnonKey,
        },
      }
    )

    if (existingProfileResponse.ok) {
      const existingProfiles = await existingProfileResponse.json()
      if (existingProfiles.length > 0) {
        return NextResponse.json(
          { error: `Сотрудник с табельным номером ${employee_id} уже существует` },
          { status: 409 }
        )
      }
    }

    // 7. Генерируем технический email
    const email = `${employee_id}@staff.bionit.ru`

    // 8. Создаем пользователя через Admin API
    const authUser = await createUserViaAdminAPI({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        employee_id,
        full_name,
        phone,
        department_id,
        role,
      },
    })

    // 9. Ждем, пока триггер создаст профиль
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 10. Проверяем, что профиль создался
    const profileCheckResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${authUser.id}&select=*`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': supabaseAnonKey,
        },
      }
    )

    if (!profileCheckResponse.ok) {
      // Откатываем создание пользователя
      await deleteUserViaAdminAPI(authUser.id)
      return NextResponse.json(
        { error: 'Не удалось создать профиль сотрудника. Обратитесь к администратору.' },
        { status: 500 }
      )
    }

    const createdProfiles = await profileCheckResponse.json()
    const createdProfile = createdProfiles[0]

    if (!createdProfile) {
      // Откатываем создание пользователя
      await deleteUserViaAdminAPI(authUser.id)
      return NextResponse.json(
        { error: 'Не удалось создать профиль сотрудника. Обратитесь к администратору.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Пользователь ${full_name} (${employee_id}) успешно создан`,
      user: {
        id: authUser.id,
        email: authUser.email,
        employee_id,
        full_name,
        role,
        created_at: authUser.created_at,
      },
    })

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
