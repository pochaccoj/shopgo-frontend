import {
  AppShell as MantineAppShell,
  Badge,
  Button,
  Group,
  NavLink as MantineNavLink,
  Stack,
  Text,
} from '@mantine/core';
import { IconLogout, IconShoppingCart, IconUser } from '@tabler/icons-react';
import { useStore } from '@nanostores/react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authStore, clearAuth } from '../../stores/authStore';
import { cartStore } from '../../stores/cartStore';

function isPathActive(pathname: string, target: string) {
  if (target === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(target);
}

export default function AppShell() {
  const { user } = useStore(authStore);
  const cartItems = useStore(cartStore);
  const location = useLocation();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <MantineAppShell
      header={{ height: 64 }}
      navbar={{ width: 260, breakpoint: 'sm' }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Text fw={700} size="xl" component={Link} to="/" td="none" c="blue.7">
              ShopGo
            </Text>
            <Badge variant="light" color="gray">
              Frontend Demo
            </Badge>
          </Group>

          <Group>
            <Button
              variant="subtle"
              component={Link}
              to="/cart"
              leftSection={<IconShoppingCart size={16} />}
            >
              Cart ({cartCount})
            </Button>
            {user ? (
              <>
                <Button
                  variant="subtle"
                  component={Link}
                  to="/orders"
                  leftSection={<IconUser size={16} />}
                >
                  {user.name}
                </Button>
                <Button
                  color="red"
                  variant="light"
                  leftSection={<IconLogout size={16} />}
                  onClick={() => {
                    clearAuth();
                    navigate('/');
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button component={Link} to="/auth">
                Login / Register
              </Button>
            )}
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="sm">
        <Stack gap="xs">
          <MantineNavLink component={Link} to="/" label="Products" active={isPathActive(location.pathname, '/')} />
          <MantineNavLink component={Link} to="/cart" label="Cart" active={isPathActive(location.pathname, '/cart')} />
          <MantineNavLink component={Link} to="/orders" label="Orders" active={isPathActive(location.pathname, '/orders')} />
          {user?.role === 'admin' && (
            <MantineNavLink component={Link} to="/admin" label="Admin" active={isPathActive(location.pathname, '/admin')} />
          )}
        </Stack>
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
