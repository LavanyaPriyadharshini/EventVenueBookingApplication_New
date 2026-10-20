import { useMutation, useQuery } from '@tanstack/react-query';

import { registerUser, loginUser, getMe, type RegisterPayload, 
    forgotPasswordRequest,
  resetPasswordRequest,
    type ForgotPasswordPayload,
  type ResetPasswordPayload,
  type LoginPayload } from '../api/auth.api';

export const useRegister=()=>
   
    useMutation({
        mutationFn:(payload: RegisterPayload) => registerUser(payload),
    })


 export const useLogin = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
  });


export const useMe = (enabled: boolean) =>
  useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled,
    retry: false,
  });


  export const useForgotPassword = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPasswordRequest(payload),
  });


export const useResetPassword = () =>
  useMutation({
    mutationFn: ({ token, payload }: { token: string; payload: ResetPasswordPayload }) =>
      resetPasswordRequest(token, payload),
  });




  //add the eye toggle in the login page 