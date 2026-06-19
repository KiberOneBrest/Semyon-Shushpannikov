"use client"
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// Схема валидации
const schema = yup.object().shape({
  name: yup.string().required('Имя обязательно').min(2, 'Минимум 2 символа'),
  age: yup
    .number()
    .typeError('Должно быть число')
    .required('Возраст обязателен')
    .min(1, 'Минимум 1 год')
    .max(120, 'Максимум 120 лет'),
  fursuitColor: yup.string().required('Цвет фури обязателен'),
  description: yup.string().optional(),
})

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      age: '',
      fursuitColor: '',
      description: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: 'Форма успешно отправлена!' })
        reset()
      } else {
        setStatus({ type: 'error', message: result.error || 'Ошибка при отправке' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Ошибка соединения' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Форма обратной связи
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Поле Имя */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-1">
            Имя *
          </label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
            placeholder="Введите ваше имя"
          />
          {errors.name && (
            <p className="mt-1 text-red-400 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Поле Возраст */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-1">
            Возраст *
          </label>
          <input
            {...register('age')}
            type="number"
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
            placeholder="Введите ваш возраст"
          />
          {errors.age && (
            <p className="mt-1 text-red-400 text-sm">{errors.age.message}</p>
          )}
        </div>

        {/* Поле Цвет фури */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-1">
            Цвет фури *
          </label>
          <input
            {...register('fursuitColor')}
            type="text"
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors"
            placeholder="Например: синий, розовый, фиолетовый"
          />
          {errors.fursuitColor && (
            <p className="mt-1 text-red-400 text-sm">{errors.fursuitColor.message}</p>
          )}
        </div>

        {/* Поле Описание (опционально) */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-1">
            Описание (необязательно)
          </label>
          <textarea
            {...register('description')}
            rows="3"
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400 transition-colors resize-none"
            placeholder="Расскажите о себе или своей фури..."
          />
        </div>

        {/* Статус сообщения */}
        {status.message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              status.type === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                : 'bg-red-500/20 text-red-400 border border-red-500/20'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Отправка...' : 'Отправить'}
        </button>
      </form>
    </div>
  )
}