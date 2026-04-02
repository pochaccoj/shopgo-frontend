import * as yup from 'yup';

export const productSchema = yup.object({
  name: yup.string().required('Product name is required'),
  description: yup.string().optional(),
  price: yup
    .number()
    .typeError('Price must be a number')
    .positive('Price must be greater than 0')
    .required('Price is required'),
  stock: yup
    .number()
    .typeError('Stock must be a number')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .required('Stock is required'),
  category_id: yup
    .number()
    .typeError('Please select a category')
    .positive('Please select a category')
    .integer()
    .required('Category is required'),
});

export type ProductInput = yup.InferType<typeof productSchema>;
