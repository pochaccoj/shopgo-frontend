import * as yup from 'yup';

export const updateRoleSchema = yup.object({
  role: yup.string().oneOf(['customer', 'admin'], 'Role must be customer or admin').required('Role is required'),
});

export type UpdateRoleInput = yup.InferType<typeof updateRoleSchema>;
