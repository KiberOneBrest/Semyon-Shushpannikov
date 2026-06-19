import { NextResponse } from 'next/server'
import resend from '@/lib/resend'

// Хранилище для rate limit (в памяти)
// В production рекомендуется использовать Redis или другое persisted хранилище
const rateLimitStore = new Map()

// Конфигурация rate limit
const RATE_LIMIT = {
  maxRequests: 1,
  windowMs: 10 * 60 * 1000, // 10 минут в миллисекундах
}

// Функция для очистки старых записей (опционально, для предотвращения утечек памяти)
function cleanOldEntries() {
  const now = Date.now()
  for (const [key, timestamp] of rateLimitStore.entries()) {
    if (now - timestamp > RATE_LIMIT.windowMs) {
      rateLimitStore.delete(key)
    }
  }
}

// Вызываем очистку раз в час
setInterval(cleanOldEntries, 60 * 60 * 1000)

export async function POST(request) {
  try {
    // Получаем IP адрес для идентификации пользователя
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const now = Date.now()
    const key = `rate_limit:${ip}`
    
    // Проверяем rate limit
    const lastRequestTime = rateLimitStore.get(key)
    
    if (lastRequestTime) {
      const timeElapsed = now - lastRequestTime
      const timeRemaining = RATE_LIMIT.windowMs - timeElapsed
      
      if (timeElapsed < RATE_LIMIT.windowMs) {
        const minutesRemaining = Math.ceil(timeRemaining / 60000)
        return NextResponse.json(
          { 
            error: `Слишком много запросов. Пожалуйста, подождите ${minutesRemaining} ${minutesRemaining === 1 ? 'минуту' : minutesRemaining < 5 ? 'минуты' : 'минут'} перед отправкой новой заявки.` 
          },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil(timeRemaining / 1000),
            }
          }
        )
      }
    }
    
    // Обновляем время последнего запроса
    rateLimitStore.set(key, now)

    const body = await request.json()
    const { name, age, fursuitColor, description } = body

    // Валидация
    if (!name || !age || !fursuitColor) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      )
    }

    // Формируем HTML письма
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #A855F7, #EC4899); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #6B46C1; }
            .value { margin-left: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📝 Новая заявка из формы</h2>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">👤 Имя:</span>
                <span class="value">${name}</span>
              </div>
              <div class="field">
                <span class="label">🎂 Возраст:</span>
                <span class="value">${age}</span>
              </div>
              <div class="field">
                <span class="label">🎨 Цвет фури:</span>
                <span class="value">${fursuitColor}</span>
              </div>
              ${description ? `
                <div class="field">
                  <span class="label">📝 Описание:</span>
                  <p style="margin-left: 10px; background: white; padding: 10px; border-radius: 5px; border-left: 3px solid #A855F7;">
                    ${description}
                  </p>
                </div>
              ` : ''}
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
              <p style="color: #666; font-size: 14px; text-align: center;">
                Отправлено через форму обратной связи
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Отправка письма через Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [process.env.EMAIL_TO],
      subject: `Новая заявка от ${name}`,
      html: htmlContent,
      replyTo: process.env.EMAIL_FROM,
    })

    if (error) {
      console.error('Ошибка Resend:', error)
      return NextResponse.json(
        { error: 'Ошибка при отправке письма' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Письмо отправлено успешно', data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Ошибка API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}