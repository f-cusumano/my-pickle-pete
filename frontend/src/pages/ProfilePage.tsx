import { Badge, Button, Group, Paper, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { errorMessage, useProfile } from '../api/queries';
import type { CurrentUser } from '../api/types';
import { ProfileFields } from '../components/ProfileFields';
import { confirmationError, passwordError, profileFormOf, toProfile } from '../domain/userForm';

/** Profilo dell'utente della sessione: dati anagrafici e cambio password. */
export function ProfilePage({ user }: { user: CurrentUser }) {
  return (
    <Stack maw={640}>
      <Group gap="sm">
        <Title order={2}>{user.nickname}</Title>
        <Badge variant="light" color={user.role === 'ADMIN' ? 'orange' : 'pickle'}>
          {user.role === 'ADMIN' ? 'Amministratore' : 'Utente'}
        </Badge>
      </Group>
      <ProfileForm user={user} />
      <PasswordForm />
    </Stack>
  );
}

function ProfileForm({ user }: { user: CurrentUser }) {
  const { update } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({ initialValues: profileFormOf(user) });
  const submit = form.onSubmit((values) => {
    setError(null);
    update.mutate(toProfile(values), {
      onSuccess: (saved) => {
        form.setValues(profileFormOf(saved));
        form.resetDirty(profileFormOf(saved));
        notifications.show({ color: 'pickle', message: 'Dati salvati.' });
      },
      onError: (e) => setError(errorMessage(e)),
    });
  });
  return (
    <Paper withBorder radius="md" p="md">
      <form onSubmit={submit} noValidate>
        <Stack>
          <Title order={4}>Dati personali</Title>
          <ProfileFields form={form} />
          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}
          <Group justify="flex-end">
            <Button type="submit" loading={update.isPending} disabled={!form.isDirty()}>
              Salva
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

function PasswordForm() {
  const { password } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    initialValues: { currentPassword: '', newPassword: '', confirmation: '' },
    validate: {
      currentPassword: (value) => (value === '' ? 'Indica la password attuale' : null),
      newPassword: passwordError,
      confirmation: (value, values) => confirmationError(values.newPassword, value),
    },
  });
  const submit = form.onSubmit((values) => {
    setError(null);
    password.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          form.reset();
          notifications.show({
            color: 'pickle',
            message: 'Password cambiata: gli altri dispositivi con "Ricordami" dovranno accedere di nuovo.',
          });
        },
        onError: (e) => setError(errorMessage(e)),
      },
    );
  });
  return (
    <Paper withBorder radius="md" p="md">
      <form onSubmit={submit} noValidate>
        <Stack>
          <Title order={4}>Cambia password</Title>
          <PasswordInput label="Password attuale" autoComplete="current-password" {...form.getInputProps('currentPassword')} />
          <PasswordInput label="Nuova password" autoComplete="new-password" {...form.getInputProps('newPassword')} />
          <PasswordInput label="Ripeti la nuova password" autoComplete="new-password" {...form.getInputProps('confirmation')} />
          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}
          <Group justify="flex-end">
            <Button type="submit" loading={password.isPending}>
              Cambia password
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
