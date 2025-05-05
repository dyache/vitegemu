import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateReview } from './CreateReview';
import { vi } from 'vitest';

describe('CreateReview', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  test('показывает сообщение, если поля не заполнены', async () => {
    render(<CreateReview />);

    const submitButton = screen.getByText('Опубликовать');
    fireEvent.click(submitButton);

    expect(await screen.findByText('Заполните все поля!')).toBeInTheDocument();
  });

  test('показывает сообщение, если пользователь не авторизован', async () => {
    render(<CreateReview />);

    fireEvent.change(screen.getByPlaceholderText('Название игры'), {
      target: { value: 'The Witcher 3' },
    });

    fireEvent.change(screen.getByPlaceholderText('Описание обзора...'), {
      target: { value: 'Отличная RPG с открытым миром' },
    });

    fireEvent.click(screen.getByText('Опубликовать'));

    expect(await screen.findByText(/вы не авторизованы/i)).toBeInTheDocument();
  });

  test('успешно отправляет обзор, если данные и токен есть', async () => {
    localStorage.setItem('token', 'mock-token');

    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    global.fetch = mockFetch;

    render(<CreateReview />);

    fireEvent.change(screen.getByPlaceholderText('Название игры'), {
      target: { value: 'Hollow Knight' },
    });

    fireEvent.change(screen.getByPlaceholderText('Описание обзора...'), {
      target: { value: 'Невероятно атмосферный метроидвания-платформер' },
    });

    fireEvent.click(screen.getByText('Опубликовать'));

    await waitFor(() =>
      expect(screen.getByText('Обзор успешно опубликован!')).toBeInTheDocument()
    );

    expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:8000/reviews/', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Authorization: 'Bearer mock-token',
      }),
    }));
  });

  test('показывает сообщение об ошибке при неудачном ответе от сервера', async () => {
    localStorage.setItem('token', 'mock-token');

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
    );

    render(<CreateReview />);

    fireEvent.change(screen.getByPlaceholderText('Название игры'), {
      target: { value: 'DOOM' },
    });

    fireEvent.change(screen.getByPlaceholderText('Описание обзора...'), {
      target: { value: 'Мясо, скорость, ад.' },
    });

    fireEvent.click(screen.getByText('Опубликовать'));

    expect(await screen.findByText(/Ошибка: /)).toBeInTheDocument();
  });
});
