export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  address?: {
    label: string;
    street: string;
    city: string;
  };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Home: undefined;
  Carrinho: undefined;
  Pedidos: undefined;
  Perfil: undefined;
};
