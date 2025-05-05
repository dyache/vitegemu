import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Reviews } from './reviews';
import { vi } from 'vitest';

describe('Reviews', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('отображает индикатор загрузки', async () => {
    vi.useFakeTimers(); // ускорим эффект useEffect
    global.fetch = vi.fn(() => new Promise(() => {})); // зависнет

    render(<Reviews />, { wrapper: MemoryRouter });

    expect(screen.getByText('Загрузка обзоров...')).toBeInTheDocument();

    vi.useRealTimers();
  });

  test('отображает ошибку при неудачной загрузке', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
      })
    );

    render(<Reviews />, { wrapper: MemoryRouter });

    expect(await screen.findByText('Ошибка загрузки обзоров')).toBeInTheDocument();
  });

  test('отображает сообщение если обзоров нет', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => [],
      })
    );

    render(<Reviews />, { wrapper: MemoryRouter });

    expect(await screen.findByText('Обзоров пока нет. Будьте первым!')).toBeInTheDocument();
  });

  test('отображает список обзоров', async () => {
    const mockReviews = [
      {
        id: 1,
        title: 'Dark Souls',
        nickname: 'Игрок',
        content: 'Сложная, революционная в свое время игра',
      },
      {
        id: 2,
        title: 'Stardew Valley',
        nickname: 'Фермер',
        content: 'Спокойствие, уют и картошка',
      },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockReviews,
      })
    );

    render(<Reviews />, { wrapper: MemoryRouter });

    expect(await screen.findByText('Dark Souls')).toBeInTheDocument();
    expect(screen.getByText('Stardew Valley')).toBeInTheDocument();
    expect(screen.getAllByText('Читать полностью →')).toHaveLength(2);
  });
});
