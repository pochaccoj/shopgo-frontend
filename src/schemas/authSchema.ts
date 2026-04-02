import * as yup from 'yup';

export const registerSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Must be a valid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

export const loginSchema = yup.object({
  email: yup.string().email('Must be a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export type RegisterInput = yup.InferType<typeof registerSchema>;
export type LoginInput = yup.InferType<typeof loginSchema>;
