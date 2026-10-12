import {
  ActionIcon,
  Button,
  Checkbox,
  Divider,
  Group,
  Popover,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { IconFilter, IconFilterFilled } from '@tabler/icons-react';

interface Props {
  label: string;
  options: string[];
  selected: string[];
  optionLabel: (value: string) => string;
  onChange: (selected: string[]) => void;
}

/** Imbuto in intestazione: tendina a scelta multipla, colorato quando il filtro della colonna è attivo. */
export function ColumnFilter({ label, options, selected, optionLabel, onChange }: Props) {
  const active = selected.length > 0;
  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  return (
    <Popover position="bottom-end" shadow="md" withinPortal>
      <Popover.Target>
        <ActionIcon
          variant={active ? 'filled' : 'subtle'}
          color={active ? 'orange' : 'gray'}
          size="sm"
          aria-label={`Filtra ${label}`}
          onClick={(event) => event.stopPropagation()}
        >
          {active ? <IconFilterFilled size={14} /> : <IconFilter size={14} />}
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p="xs" miw={200}>
        <Stack gap={4}>
          <Button
            variant="subtle"
            color="gray"
            size="compact-sm"
            justify="flex-start"
            onClick={() => onChange([])}
          >
            -Rimuovi filtro-
          </Button>
          <Divider />
          <ScrollArea.Autosize mah={280}>
            <Stack gap={2}>
              {options.map((value) => (
                <Group
                  key={value}
                  justify="space-between"
                  wrap="nowrap"
                  px={6}
                  py={6}
                  style={{ cursor: 'pointer', borderRadius: 6 }}
                  onClick={() => toggle(value)}
                >
                  <Text size="sm">{optionLabel(value)}</Text>
                  <Checkbox
                    checked={selected.includes(value)}
                    onChange={() => toggle(value)}
                    onClick={(event) => event.stopPropagation()}
                    aria-label={optionLabel(value)}
                    color="pickle"
                  />
                </Group>
              ))}
              {options.length === 0 && (
                <Text size="sm" c="dimmed" px={6}>
                  Nessun valore
                </Text>
              )}
            </Stack>
          </ScrollArea.Autosize>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
