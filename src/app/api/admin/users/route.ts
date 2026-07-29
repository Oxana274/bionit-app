import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Разрешенные роли для создания
const ALLOWED_CREATOR_ROLES = ['admin', 'hr_admin']

// Кто какую роль может создавать
const ROLE_HIERARCHY: Record<string, string[]> = {
  admin: ['employee', 'manager', 'hr_admin', 'admin'],
  hr_admin: ['employee', 'manager'],
}

export async function POST(request: Request) {
  try {
    // 1. Проверяем авторизацию
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    // 2. Проверяем роль текущего пользователя
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || !currentUserProfile) {
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

    // 3. Получаем данные из тела запроса
    const body = await request.json()
    const { 
      employee_id, 
      full_name, 
      phone = null, 
      department_id = null, 
      role = 'employee',
      password 
    } = body

    // 4. Валидация
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

    // Проверяем, что роль доступна для создания текущим пользователем
    const allowedRoles = ROLE_HIERARCHY[currentRole] || []
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `Вы не можете создавать пользователей с ролью "${role}"` },
        { status: 403 }
      )
    }

    // 5. Проверяем, не существует ли уже такой табельный номер
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('employee_id')
      .eq('employee_id', employee_id)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        { error: `Сотрудник с табельным номером ${employee_id} уже существует` },
        { status: 409 }
      )
    }

    // 6. Генерируем технический email
    const email = `${employee_id}@staff.bionit.ru`

    // 7. Создаем пользователя через Admin API
    const supabaseAdmin = createAdminClient()
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        employee_id,
        full_name,
        phone,
        department_id,
        role, // Передаем роль в metadata, триггер подхватит
      },
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // 8. Ждем, пока триггер создаст профиль
    // Делаем небольшую задержку, чтобы триггер успел сработать
    await new Promise(resolve => setTimeout(resolve, 500))

    // 9. Проверяем, что профиль создался
    const { data: createdProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .maybeSingle()

    if (profileCheckError || !createdProfile) {
      // Если профиль не создался за 500мс, ждем еще
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: retryProfile, error: retryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.user.id)
        .maybeSingle()

      if (retryError || !retryProfile) {
        // Профиль не создался — откатываем создание пользователя
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        return NextResponse.json(
          { error: 'Не удалось создать профиль сотрудника. Обратитесь к администратору.' },
          { status: 500 }
        )
      }
    }

    // 10. Возвращаем результат
    return NextResponse.json({
      success: true,
      message: `Пользователь ${full_name} (${employee_id}) успешно создан`,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        employee_id,
        full_name,
        role,
        created_at: authUser.user.created_at,
      },
    })

  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
