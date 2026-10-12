import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Verde cetriolo di Pickle Pete
const pickle: MantineColorsTuple = [
  '#f0fbe9',
  '#e0f4d4',
  '#c0e8a9',
  '#9ddb7a',
  '#80d053',
  '#6dc93a',
  '#62c52c',
  '#51ad1f',
  '#459a18',
  '#36850c',
];

export const theme = createTheme({
  primaryColor: 'pickle',
  primaryShade: { light: 8, dark: 6 },
  colors: { pickle },
  fontFamily: 'Nunito, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  headings: { fontFamily: '"Lilita One", Nunito, system-ui, sans-serif', fontWeight: '400' },
  defaultRadius: 'md',
  cursorType: 'pointer',
});
