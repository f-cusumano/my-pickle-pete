import { SimpleGrid, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { ProfileFormValues } from '../domain/userForm';

/** Dati anagrafici facoltativi, nella registrazione e nel profilo: due colonne da tablet in su. */
export function ProfileFields<T extends ProfileFormValues>({ form }: { form: UseFormReturnType<T> }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      <TextInput label="Nome" maxLength={50} autoComplete="given-name" {...form.getInputProps('firstName')} />
      <TextInput label="Cognome" maxLength={50} autoComplete="family-name" {...form.getInputProps('lastName')} />
      <TextInput label="Data di nascita" type="date" autoComplete="bday" {...form.getInputProps('birthDate')} />
      <TextInput label="Email" type="email" maxLength={100} autoComplete="email" {...form.getInputProps('email')} />
    </SimpleGrid>
  );
}
