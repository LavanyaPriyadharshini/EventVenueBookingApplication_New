import { useMutation, useQuery } from '@tanstack/react-query';

import { registerUser, loginUser, getMe, type RegisterPayload, type LoginPayload } from '../api/auth.api';

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