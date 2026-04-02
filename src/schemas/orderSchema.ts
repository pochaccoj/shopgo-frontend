import * as yup from 'yup';

export const orderItemSchema = yup.object({
  product_id: yup.string().uuid('Invalid product ID').required('Product ID is required'),
  quantity: yup
    .number()
    .typeError('Quantity must be a number')
    .integer('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .required('Quantity is required'),
});

export const placeOrderSchema = yup.object({
  items: yup.array(orderItemSchema).min(1, 'Order must have at least one item').required('Items are required'),
  note: yup.string().optional(),
});

export const updateOrderStatusSchema = yup.object({
  status: yup.string().oneOf(['confirmed', 'shipped', 'delivered'], 'Invalid status value').required('Status is required'),
});

export type PlaceOrderInput = yup.InferType<typeof placeOrderSchema>;
export type UpdateOrderStatusInput = yup.InferType<typeof updateOrderStatusSchema>;
