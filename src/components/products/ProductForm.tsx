import { Button, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useState } from 'react';
import type { Category } from '../../types';
import { productSchema, type ProductInput } from '../../schemas/productSchema';

interface Props {
  initialValues?: Partial<ProductInput>;
  categories: Category[];
  onSubmit: (values: ProductInput) => Promise<void>;
  submitLabel?: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  category_id?: string;
}

export default function ProductForm({ initialValues, categories, onSubmit, submitLabel = 'Save Product' }: Props) {
  const [values, setValues] = useState<Partial<ProductInput>>({
    name: initialValues?.name ?? '',
    description: initialValues?.description ?? '',
    price: initialValues?.price ?? 0,
    stock: initialValues?.stock ?? 0,
    category_id: initialValues?.category_id,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = categories.map((category) => ({ value: String(category.id), label: category.name }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const validated = await productSchema.validate(
        {
          ...values,
          category_id: values.category_id ? Number(values.category_id) : values.category_id,
        },
        { abortEarly: false }
      );

      setErrors({});
      setSubmitting(true);
      await onSubmit(validated);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'inner' in err) {
        const validationErrors: FormErrors = {};
        const inner = (err as { inner: Array<{ path?: string; message: string }> }).inner;
        inner.forEach((issue) => {
          if (issue.path) {
            validationErrors[issue.path as keyof FormErrors] = issue.message;
          }
        });
        setErrors(validationErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Name"
          value={values.name ?? ''}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            setValues((prev) => ({ ...prev, name: nextValue }));
          }}
          error={errors.name}
        />
        <TextInput
          label="Description"
          value={values.description ?? ''}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            setValues((prev) => ({ ...prev, description: nextValue }));
          }}
          error={errors.description}
        />
        <NumberInput
          label="Price"
          min={0}
          decimalScale={2}
          fixedDecimalScale
          value={values.price ?? 0}
          onChange={(value) => setValues((prev) => ({ ...prev, price: Number(value) }))}
          error={errors.price}
        />
        <NumberInput
          label="Stock"
          min={0}
          value={values.stock ?? 0}
          onChange={(value) => setValues((prev) => ({ ...prev, stock: Number(value) }))}
          error={errors.stock}
        />
        <Select
          label="Category"
          data={categoryOptions}
          value={values.category_id ? String(values.category_id) : null}
          onChange={(value) => setValues((prev) => ({ ...prev, category_id: value ? Number(value) : undefined }))}
          error={errors.category_id}
        />
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
