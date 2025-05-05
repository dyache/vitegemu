import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Profile } from './Profile';
import { vi } from 'vitest';

const renderWithRouter = () => {
  window.history.pushState({}, '', '/profile');

  return render(
    <MemoryRouter initialEntries={['/profile']}>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<p>Авторизация</p>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Profile', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  test('редиректит на /auth если нет токена', async () => {
    renderWithRouter();
    expect(await screen.findByText('Авторизация')).toBeInTheDocument();
  });

  test('отображает профиль и обзоры', async () => {
    localStorage.setItem('token', 'mock-token');

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          user: { email: 'test@example.com', nickname: 'tester', bio: 'О себе' },
          reviews: [
            { id: 1, title: 'Тест 1', content: 'Контент 1' },
            { id: 2, title: 'Тест 2', content: 'Контент 2' },
          ],
        }),
      })
    );

    renderWithRouter();

    expect(await screen.findByDisplayValue('tester')).toBeInTheDocument();
    expect(screen.getByText('Тест 1')).toBeInTheDocument();
    expect(screen.getByText('Тест 2')).toBeInTheDocument();
  });

  test('показывает сообщение если обзоров нет', async () => {
    localStorage.setItem('token', 'mock-token');

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          user: { email: 'user@mail.com', nickname: 'noob', bio: '' },
          reviews: [],
        }),
      })
    );

    renderWithRouter();

    expect(await screen.findByText('У вас ещё нет обзоров.')).toBeInTheDocument();
  });

  test('обновляет профиль при сохранении', async () => {
    localStorage.setItem('token', 'mock-token');

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { email: 'test@mail.com', nickname: 'init', bio: '' },
          reviews: [],
        }),
      })
      .mockResolvedValueOnce({ ok: true }); // PATCH

    renderWithRouter();

    expect(await screen.findByDisplayValue('init')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Никнейм/), {
      target: { value: 'обновлённый' },
    });

    fireEvent.click(screen.getByText('Сохранить изменения'));

    expect(await screen.findByText('Профиль обновлён!')).toBeInTheDocument();
  });

  test('выход из аккаунта удаляет токен и редиректит', async () => {
    localStorage.setItem('token', 'mock-token');

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          user: { email: 'test@mail.com', nickname: 'tester', bio: '' },
          reviews: [],
        }),
      })
    );

    renderWithRouter();

    expect(await screen.findByDisplayValue('tester')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Выйти из аккаунта'));

    expect(await screen.findByText('Авторизация')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
