import { User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'Carlos Silva',
    email: 'carlos.silva@email.com',
    password: 'senha123',
    address: {
      label: 'Residencial',
      street: 'Av. Paulista, 1578, Ap 42',
      city: 'Bela Vista, São Paulo - SP',
    },
  },
  {
    id: 2,
    name: 'Admin',
    email: 'admin@electroshop.com',
    password: 'admin123',
  },
];
