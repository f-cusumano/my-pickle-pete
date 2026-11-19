import { Button, Checkbox, Center, Paper, PasswordInput, Stack, Tabs, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { errorMessage, useSession } from '../api/queries';
import { PickleLogo } from '../components/PickleLogo';
import { ProfileFields } from '../components/ProfileFields';
import { HOME, hashOf } from '../domain/navigation';
import {
  confirmationError,
  nicknameError,
  passwordError,
  profileFormOf,
  toProfile,
  type ProfileFormValues,
} from '../domain/userForm';

/** Accesso all'app: login con "Ricordami" (attivo di default, comodo da cellulare) o registrazione di un nuovo utente. */
export function AuthPage() {
  useEffect(() => {
    window.history.replaceState(null, '', hashOf(HOME)); // dopo l'accesso si parte sempre dagli Items, non dall'ultima sezione aperta
  }, []);
  return (
    <Center mih="100dvh" p="md" bg="#fbf8ee">
      <Paper withBorder radius="lg" p="lg" w="100%" maw={480}>
        <Stack align="center" gap={4} mb="md">
          <PickleLogo size={64} />
          <Text className="game-title" fz={28} c="pickle.8">
            My Pickle Pete
          </Text>
        </Stack>
        <Tabs defaultValue="login" keepMounted={false}>
          <Tabs.List grow mb="md">
            <Tabs.Tab value="login">Accedi</Tabs.Tab>
            <Tabs.Tab value="register">Registrati</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="login">
            <LoginForm />
          </Tabs.Panel>
          <Tabs.Panel value="register">
            <RegisterForm />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Center>
  );
}

function LoginForm() {
  const { login } = useSession();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    initialValues: { nickname: '', password: '', rememberMe: true },
    validate: {
      nickname: (value) => (value.trim() === '' ? 'Indica il nickname' : null),
      password: (value) => (value === '' ? 'Indica la password' : null),
    },
  });
  const submit = form.onSubmit((values) => {
    setError(null);
    login.mutate({ ...values, nickname: values.nickname.trim() }, { onError: (e) => setError(errorMessage(e)) });
  });
  return (
    <form onSubmit={submit} noValidate>
      <Stack>
        <TextInput label="Nickname" autoComplete="username" autoCapitalize="none" {...form.getInputProps('nickname')} />
        <PasswordInput label="Password" autoComplete="current-password" {...form.getInputProps('password')} />
        <Checkbox label="Ricordami su questo dispositivo" {...form.getInputProps('rememberMe', { type: 'checkbox' })} />
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}
        <Button type="submit" loading={login.isPending}>
          Accedi
        </Button>
      </Stack>
    </form>
  );
}

interface RegisterValues extends ProfileFormValues {
  nickname: string;
  password: string;
  confirmation: string;
}

function RegisterForm() {
  const { register } = useSession();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegisterValues>({
    initialValues: { nickname: '', password: '', confirmation: '', ...profileFormOf(null) },
    validate: {
      nickname: nicknameError,
      password: passwordError,
      confirmation: (value, values) => confirmationError(values.password, value),
    },
  });
  const submit = form.onSubmit((values) => {
    setError(null);
    register.mutate(
      { nickname: values.nickname.trim(), password: values.password, profile: toProfile(values) },
      { onError: (e) => setError(errorMessage(e)) },
    );
  });
  return (
    <form onSubmit={submit} noValidate>
      <Stack>
        <TextInput
          label="Nickname"
          description="Con questo accedi: lettere, numeri, punto e trattini"
          required
          maxLength={30}
          autoComplete="username"
          autoCapitalize="none"
          {...form.getInputProps('nickname')}
        />
        <PasswordInput label="Password" required autoComplete="new-password" {...form.getInputProps('password')} />
        <PasswordInput
          label="Ripeti la password"
          required
          autoComplete="new-password"
          {...form.getInputProps('confirmation')}
        />
        <Text size="sm" c="dimmed">
          Facoltativi:
        </Text>
        <ProfileFields form={form} />
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}
        <Button type="submit" loading={register.isPending}>
          Registrati
        </Button>
      </Stack>
    </form>
  );
}
