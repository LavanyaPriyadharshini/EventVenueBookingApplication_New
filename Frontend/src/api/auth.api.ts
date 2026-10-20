import { axiosClient } from '../lib/axiosClients';

//this file is purely for the authentication - this contains only the Registration and Login properties




export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  status: string;
  message: string;
  resetToken?: string;
}

export const forgotPasswordRequest = async (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> => {
  const { data } = await axiosClient.post<ForgotPasswordResponse>('/api/auth/forgotPassword', payload);
  return data;
};

export interface ResetPasswordPayload {
  password: string;
}

export interface ResetPasswordResponse {
  status: string;
  token: string;
}

export const resetPasswordRequest = async (
  token: string,
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> => {
  const { data } = await axiosClient.post<ResetPasswordResponse>(
    `/api/auth/resetPassword/${token}`,
    payload
  );
  return data;
};



export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

export interface RegisterResponse {
  status: string;
  data: { id: string; email: string; firstName: string; lastName: string };
  token: string;
}


export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const { data } = await axiosClient.post<RegisterResponse>('/api/auth/register', payload);
  return data;
};


//interfaces for login 
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  token: string;
}

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await axiosClient.post<LoginResponse>('/api/auth/login', payload);
  return data;
};



export interface MeResponse {
  status: string;
  data: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    mobileNumber: string;
    role: 'customer' | 'organizer' | 'admin';
    isActive: boolean;
  };
}

export const getMe = async (): Promise<MeResponse> => {
  const { data } = await axiosClient.get<MeResponse>('/api/auth/me');
  return data;
};