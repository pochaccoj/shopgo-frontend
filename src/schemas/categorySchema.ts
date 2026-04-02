import * as yup from 'yup';

export const categorySchema = yup.object({
  name: yup.string().required('Category name is required'),
  slug: yup
    .string()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .required('Slug is required'),
});

export type CategoryInput = yup.InferType<typeof categorySchema>;
