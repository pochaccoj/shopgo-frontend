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

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CategoryForm({ initialValues, onSubmit, submitLabel = 'Save Category' }: Props) {
  const [values, setValues] = useState<Partial<CategoryInput>>({
    name: initialValues?.name ?? '',
    slug: initialValues?.slug ?? '',
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialValues?.slug));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload = {
        ...values,
        slug: (values.slug ?? '').trim() || toSlug(values.name ?? ''),
      };
      const validated = await categorySchema.validate(payload, { abortEarly: false });
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
            setValues((prev) => ({
              ...prev,
              name: nextValue,
              slug: slugManuallyEdited ? prev.slug : toSlug(nextValue),
            }));
          }}
          error={errors.name}
        />
        <TextInput
          label="Slug"
          value={values.slug ?? ''}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            setSlugManuallyEdited(true);
            setValues((prev) => ({ ...prev, slug: nextValue }));
          }}
          description="Auto-generated from name; you can edit it if needed"
          error={errors.slug}
        />
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
