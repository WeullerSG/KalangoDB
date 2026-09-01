import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import type { TriggerRef } from "@rn-primitives/popover";
import { Close as PopoverClose } from "@rn-primitives/popover";
import * as React from "react";
import { Platform, Text } from "react-native";

type Props = {
  value?: Date | string | number | null;
  onChange: (timestamp: number) => void;
  onBlur?: () => void;
  disabled?: boolean;
};

function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateValue(value?: Date | string | number | null): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  return new Date(value);
}

export function DateTimeField({ value, onChange, onBlur, disabled }: Props) {
  const dateValue = getDateValue(value);
  const triggerRef = React.useRef<TriggerRef>(null);

  function handleDateChange(selectedDate: Date) {
    onChange(selectedDate.getTime()); // Converte pra timestamp
    onBlur?.();
  }

  function openAndroidPicker() {
    DateTimePickerAndroid.open({
      value: dateValue,
      mode: "date",
      onChange: (_, selected) => {
        if (!selected) return onBlur?.();
        DateTimePickerAndroid.open({
          value: selected,
          mode: "time",
          onChange: (_, selectedTime) => {
            if (selectedTime) handleDateChange(selectedTime);
          },
        });
      },
    });
  }

  if (Platform.OS === "android") {
    return (
      <Button
        variant="outline"
        disabled={disabled}
        onPress={openAndroidPicker}
        className="justify-start"
      >
        <Text>{formatDateTime(dateValue)}</Text>
      </Button>
    );
  }

  // iOS
  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) onBlur?.();
      }}
    >
      <PopoverTrigger ref={triggerRef} asChild>
        <Button variant="outline" disabled={disabled} className="justify-start">
          <Text>{formatDateTime(dateValue)}</Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <DateTimePicker
          value={dateValue}
          mode="datetime"
          display="spinner"
          onChange={(_, selectedDate) => {
            if (selectedDate) handleDateChange(selectedDate);
          }}
        />
        <PopoverClose asChild>
          <Button className="mt-2">
            <Text>Confirmar</Text>
          </Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
