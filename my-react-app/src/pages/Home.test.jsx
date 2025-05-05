import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Home } from './Home';

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          {
            id: 1,
            title: 'Cyberpunk 2077',
            content: 'Крутая игра с багами :)',
            nickname: 'Игроман',
            created_at: '2023-01-01T00:00:00Z',
          },
        ]),
    })
  );
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('Home Page', () => {
  test('рендерит заголовок и кнопки', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Gemu')).toBeInTheDocument();
    expect(screen.getByText('Написать обзор')).toBeInTheDocument();
    expect(screen.getByText('Профиль')).toBeInTheDocument();
  });

  test('загружает и отображает обзоры', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
      expect(screen.getByText(/Игроман/)).toBeInTheDocument();
    });
  });

  test('фильтрует обзоры по названию', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('Cyberpunk 2077'));

    const input = screen.getByPlaceholderText('Поиск обзора по названию...');
    fireEvent.change(input, { target: { value: 'Cyberpunk' } });
    expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Witcher' } });
    expect(screen.queryByText('Cyberpunk 2077')).not.toBeInTheDocument();
    expect(screen.getByText('Обзоров не найдено.')).toBeInTheDocument();
  });

  test('отображает сообщение при пустом списке', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      })
    );

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Обзоров не найдено.')).toBeInTheDocument();
    });
  });
});
