import { Button, Stack, TextInput } from '@mantine/core';
import { useState } from 'react';
import { categorySchema, type CategoryInput } from '../../schemas/categorySchema';

interface Props {
  initialValues?: Partial<CategoryInput>;
  onSubmit: (values: CategoryInput) => Promise<void>;
  submitLabel?: string;
}

interface FormErrors {
  name?: string;
  slug?: string;
}

export default function CategoryForm({ initialValues, onSubmit, submitLabel = 'Save Category' }: Props) {
  const [values, setValues] = useState<Partial<CategoryInput>>({
    name: initialValues?.name ?? '',
    slug: initialValues?.slug ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const validated = await categorySchema.validate(values, { abortEarly: false });
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
          onChange={(event) => setValues((prev) => ({ ...prev, name: event.currentTarget.value }))}
          error={errors.name}
        />
        <TextInput
          label="Slug"
          value={values.slug ?? ''}
          onChange={(event) => setValues((prev) => ({ ...prev, slug: event.currentTarget.value }))}
          error={errors.slug}
        />
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
