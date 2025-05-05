import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ReviewPage } from './ReviewPage';
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

const renderWithRouter = (ui, { route = '/review/1' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/review/:id" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ReviewPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  test('отображает обзор и комментарии', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          title: 'Test Game',
          content: 'Test Content',
          nickname: 'tester',
          created_at: new Date().toISOString(),
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 10,
            content: 'Крутой обзор!',
            author_nickname: 'Комментатор',
            created_at: new Date().toISOString(),
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { nickname: 'tester', is_admin: false },
        }),
      });

    axios.get.mockResolvedValue({ data: { count: 0 } });

    renderWithRouter(<ReviewPage />);

    expect(await screen.findByText('Test Game')).toBeInTheDocument();
    expect(screen.getByText('Крутой обзор!')).toBeInTheDocument();
  });

  test('показывает сообщение если комментариев нет', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          title: 'No Comments',
          content: 'Пусто',
          nickname: 'tester',
          created_at: new Date().toISOString(),
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { nickname: 'tester', is_admin: false },
        }),
      });

    axios.get.mockResolvedValue({ data: { count: 0 } });

    renderWithRouter(<ReviewPage />);
    expect(await screen.findByText('Пока нет комментариев...')).toBeInTheDocument();
  });

  test('не отправляет комментарий если пользователь не авторизован', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          title: 'Test Game',
          content: 'Test Content',
          nickname: 'tester',
          created_at: new Date().toISOString(),
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    axios.get.mockResolvedValue({ data: { count: 0 } });

    renderWithRouter(<ReviewPage />);
    await screen.findByText('Test Game');

    fireEvent.change(screen.getByPlaceholderText('Напишите свой комментарий...'), {
      target: { value: 'Комментарий без авторизации' },
    });

    fireEvent.click(screen.getByText('Отправить комментарий'));

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('отображает кнопки редактирования, если пользователь автор обзора', async () => {
    localStorage.setItem('token', 'test-token');
  
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          title: 'My Review',
          content: 'My Content',
          nickname: 'me',
          created_at: new Date().toISOString(),
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { nickname: 'me', is_admin: false },
        }),
      });
  
    axios.get.mockResolvedValue({ data: { count: 0 } });
  
    renderWithRouter(<ReviewPage />);
  
    expect(await screen.findByText(/my review/i)).toBeInTheDocument();
    expect(await screen.findByText(/редактировать/i)).toBeInTheDocument();
    expect(screen.getByText(/удалить/i)).toBeInTheDocument();
  });
});  