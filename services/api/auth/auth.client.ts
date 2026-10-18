import api from "@/lib/axios";
import { ENDPOINTS } from "@/services/api/endpoints";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  displayName?: string;
};

export type GoogleLoginInput = {
  credential: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  emailVerifiedAt: number | null;
};

export async function login(input: LoginInput): Promise<void> {
  await api.post(ENDPOINTS.authLogin, input);
}

export async function register(input: RegisterInput): Promise<void> {
  await api.post(ENDPOINTS.authRegister, input);
}

export async function loginWithGoogle(input: GoogleLoginInput): Promise<void> {
  await api.post(ENDPOINTS.authGoogle, input);
}

export async function logout(): Promise<void> {
  await api.post(ENDPOINTS.authLogout);
}

export async function fetchCurrentUser(): Promise<AuthenticatedUser> {
  const { data } = await api.get<AuthenticatedUser>(ENDPOINTS.authMe);
  return data;
}
