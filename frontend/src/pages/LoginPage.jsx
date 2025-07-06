import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'

const LoginPage = () => {

  const [loginData , setLoginData] = useState({
    email:"",
    password:"",
  })

  const  queryClient = useQueryClient();

  const {
    mutate : loginMutation ,
    isPending,
    error,
  }=useMutation({
    mutationFn: login ,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  })

   const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };
  return (
    <div>LoginPage</div>
  )
}

export default LoginPage