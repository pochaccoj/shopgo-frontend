import { Button, Select, Stack } from '@mantine/core';
import { useState } from 'react';
import { updateRoleSchema, type UpdateRoleInput } from '../../schemas/userSchema';
import type { Role } from '../../types';

interface Props {
  currentRole: Role;
  onSubmit: (values: UpdateRoleInput) => Promise<void>;
}

export default function UserRoleSelect({ currentRole, onSubmit }: Props) {
  const [role, setRole] = useState<Role>(currentRole);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const validated = await updateRoleSchema.validate({ role });
      setError(null);
      setSubmitting(true);
      await onSubmit(validated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Validation failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Select
          label="Role"
          data={[
            { value: 'customer', label: 'customer' },
            { value: 'admin', label: 'admin' },
          ]}
          value={role}
          onChange={(value) => {
            if (value === 'customer' || value === 'admin') {
              setRole(value);
            }
          }}
          error={error}
          allowDeselect={false}
        />
        <Button type="submit" loading={submitting}>
          Update Role
        </Button>
      </Stack>
    </form>
  );
}
