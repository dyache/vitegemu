import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OtherProfile from './OtherProfile';
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');

const mockRender = (nick = 'gamer') => {
  return render(
    <MemoryRouter initialEntries={[`/user/${nick}`]}>
      <Routes>
        <Route path="/user/:nick" element={<OtherProfile />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('OtherProfile', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('отображает никнейм и био пользователя', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { nickname: 'gamer', bio: 'Обожаю ролевки' } }) // профиль
      .mockResolvedValueOnce({ data: [] }); // обзоры

    mockRender('gamer');

    expect(await screen.findByText('gamer')).toBeInTheDocument();
    expect(screen.getByText('Обожаю ролевки')).toBeInTheDocument();
  });

  test('отображает список обзоров с лайками и дизлайками', async () => {
    const reviews = [
      {
        id: 1,
        title: 'Skyrim',
        content: 'Fus Ro Dah!',
        created_at: '2024-01-01T00:00:00.000Z',
      },
    ];

    axios.get
      .mockResolvedValueOnce({ data: { nickname: 'dovahkiin', bio: '' } }) // профиль
      .mockResolvedValueOnce({ data: reviews }) // обзоры
      .mockResolvedValueOnce({ data: { count: 42 } }) // лайки
      .mockResolvedValueOnce({ data: { count: 2 } }); // дизлайки

    mockRender('dovahkiin');

    expect(await screen.findByText('Skyrim')).toBeInTheDocument();
    expect(screen.getByText('Fus Ro Dah!')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('отображает сообщение если у пользователя нет обзоров', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { nickname: 'emptyuser', bio: '' } }) // профиль
      .mockResolvedValueOnce({ data: [] }); // обзоры

    mockRender('emptyuser');

    expect(await screen.findByText('Нет обзоров')).toBeInTheDocument();
  });
});
