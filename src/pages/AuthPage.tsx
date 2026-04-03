import {
  Anchor,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useStore } from '@nanostores/react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { loginSchema, registerSchema } from '../schemas/authSchema';
import { authStore, setAuth } from '../stores/authStore';
import type { User } from '../types';

interface LoginFormState {
  email: string;
  password: string;
}

interface RegisterFormState {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

function extractAuthPayload(payload: unknown) {
  const data = payload as {
    user?: User;
    access_token?: string;
    refresh_token?: string;
    accessToken?: string;
    refreshToken?: string;
  };

  return {
    user: data.user,
    accessToken: data.access_token ?? data.accessToken,
    refreshToken: data.refresh_token ?? data.refreshToken,
  };
}

function extractUserPayload(payload: unknown): User | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('id' in payload && 'name' in payload && 'email' in payload && 'role' in payload) {
    return payload as User;
  }

  const data = (payload as { data?: unknown }).data;
  if (data && typeof data === 'object' && 'id' in data && 'name' in data && 'email' in data && 'role' in data) {
    return data as User;
  }

  return null;
}

export default function AuthPage() {
  const { user } = useStore(authStore);
  const navigate = useNavigate();

  const [loginValues, setLoginValues] = useState<LoginFormState>({ email: '', password: '' });
  const [registerValues, setRegisterValues] = useState<RegisterFormState>({ name: '', email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<FormErrors>({});
  const [registerErrors, setRegisterErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleValidationError = (err: unknown, target: 'login' | 'register') => {
    if (err && typeof err === 'object' && 'inner' in err) {
      const validationErrors: FormErrors = {};
      const inner = (err as { inner: Array<{ path?: string; message: string }> }).inner;
      inner.forEach((issue) => {
        if (issue.path) {
          validationErrors[issue.path as keyof FormErrors] = issue.message;
        }
      });
      if (target === 'login') {
        setLoginErrors(validationErrors);
      } else {
        setRegisterErrors(validationErrors);
      }
    }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const body = await loginSchema.validate(loginValues, { abortEarly: false });
      setLoginErrors({});
      setLoading(true);
      const response = await authApi.login(body);
      const payload = extractAuthPayload(response.data);

      if (!payload.accessToken || !payload.refreshToken) {
        throw new Error('Invalid auth response');
      }

      const meResponse = await authApi.me();
      const meUser = extractUserPayload(meResponse.data);
      if (!meUser) {
        throw new Error('Failed to resolve current user');
      }

      setAuth(meUser, payload.accessToken, payload.refreshToken);
      notifications.show({ color: 'green', title: 'Success', message: 'Logged in successfully' });
      navigate('/');
    } catch (err: unknown) {
      handleValidationError(err, 'login');
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        (err instanceof Error ? err.message : 'Something went wrong');
      notifications.show({ color: 'red', title: 'Error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const body = await registerSchema.validate(registerValues, { abortEarly: false });
      setRegisterErrors({});
      setLoading(true);
      const response = await authApi.register(body);
      const payload = extractAuthPayload(response.data);

      if (!payload.user || !payload.accessToken || !payload.refreshToken) {
        throw new Error('Invalid auth response');
      }

      setAuth(payload.user, payload.accessToken, payload.refreshToken);
      notifications.show({ color: 'green', title: 'Success', message: 'Registered successfully' });
      navigate('/');
    } catch (err: unknown) {
      handleValidationError(err, 'register');
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        (err instanceof Error ? err.message : 'Something went wrong');
      notifications.show({ color: 'red', title: 'Error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      mih="100vh"
      style={{
        backgroundColor: '#eef1f5',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
      }}
    >
      <Card withBorder shadow="sm" radius="md" maw={430} w="100%" p="xl">
        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <Stack gap="lg">
              <Stack gap={4} align="center">
                <Title order={1} size="h2">
                  Sign In
                </Title>
                <Text c="dimmed">Enter your credentials to continue</Text>
              </Stack>

              <TextInput
                label="Email"
                value={loginValues.email}
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  setLoginValues((prev) => ({ ...prev, email: value }));
                }}
                error={loginErrors.email}
              />

              <PasswordInput
                label="Password"
                value={loginValues.password}
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  setLoginValues((prev) => ({ ...prev, password: value }));
                }}
                error={loginErrors.password}
              />

              <Group justify="space-between" align="center">
                <Checkbox label="Remember me" />
                <Anchor href="#" size="sm" onClick={(event) => event.preventDefault()}>
                  Forgot password?
                </Anchor>
              </Group>

              <Button type="submit" loading={loading} fullWidth>
                Sign In
              </Button>

              <Text ta="center" c="dimmed" size="sm">
                Don't have an account?{' '}
                <Anchor
                  component="button"
                  type="button"
                  onClick={() => setMode('register')}
                  fw={600}
                >
                  Register
                </Anchor>
              </Text>
            </Stack>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <Stack gap="lg">
              <Stack gap={4} align="center">
                <Title order={1} size="h2">
                  Register
                </Title>
                <Text c="dimmed">Create your ShopGo account</Text>
              </Stack>

              <TextInput
                label="Name"
                value={registerValues.name}
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  setRegisterValues((prev) => ({ ...prev, name: value }));
                }}
                error={registerErrors.name}
              />

              <TextInput
                label="Email"
                value={registerValues.email}
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  setRegisterValues((prev) => ({ ...prev, email: value }));
                }}
                error={registerErrors.email}
              />

              <PasswordInput
                label="Password"
                value={registerValues.password}
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  setRegisterValues((prev) => ({ ...prev, password: value }));
                }}
                error={registerErrors.password}
              />

              <Button type="submit" loading={loading} fullWidth>
                Register
              </Button>

              <Text ta="center" c="dimmed" size="sm">
                Already have an account?{' '}
                <Anchor
                  component="button"
                  type="button"
                  onClick={() => setMode('login')}
                  fw={600}
                >
                  Sign In
                </Anchor>
              </Text>
            </Stack>
          </form>
        )}
      </Card>
    </Box>
  );
}
