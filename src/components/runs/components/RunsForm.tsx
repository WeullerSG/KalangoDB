import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Crypto from "expo-crypto";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import * as z from "zod";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

import { uploadVideoToRun } from "@/hooks/uploadVideo";
import * as ImagePicker from "expo-image-picker";

export function VideoPicker({
  onVideoSelected,
}: {
  onVideoSelected: (asset: ImagePicker.ImagePickerAsset) => void;
}) {
  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      onVideoSelected(result.assets[0]); // só guarda, não sobe ainda
    }
  };

  return (
    <Button className="bg-slate-400" variant="outline" onPress={pickVideo}>
      <Text>Selecionar vídeo</Text>
    </Button>
  );
}

// converte "28,5" -> 28.5 (teclado BR usa vírgula)
function toNumber(v?: string): number | undefined {
  if (v == null || v.trim() === "") return undefined;
  const n = parseFloat(v.replace(",", "."));
  return Number.isNaN(n) ? undefined : n;
}

// converte number -> string com vírgula pra exibir no input
function toDisplay(v?: number): string {
  if (v === undefined || v === null) return "";
  return String(v).replace(".", ",");
}

const decimalString = z
  .string()
  .optional()
  .refine((v) => !v || !Number.isNaN(parseFloat(v.replace(",", "."))), {
    message: "Valor numérico inválido",
  });

const runsSchema = z.object({
  calango: z.string().min(1, "Selecione um calango"),
  ordem: z
    .string()
    .min(1, "A ordem é obrigatória")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 1, {
      message: "A ordem deve ser um número inteiro maior que 0",
    }),
  temperatura: decimalString.refine((v) => !!v, {
    message: "A temperatura é obrigatória",
  }),
  desempenho: decimalString,
});

type RunsFormData = z.infer<typeof runsSchema>;

interface AddRunsProps {
  run?: Doc<"runs">;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export default function RunsForm({
  run,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onClose,
}: AddRunsProps) {
  const calangos = useQuery(api.observations.list) || [];

  // STOPGAP: usando calango._id (sempre definido e não-vazio) em vez de
  // calango.clientId, que causava o crash do SelectItem quando undefined.
  // Se a tabela observations tiver um campo clientId próprio que deva ser
  // usado como FK em vez do _id, me avise o nome do campo pra eu trocar
  // de volta (e ajustar o validator da mutation para v.string()).
  const lizard = calangos.map((calango) => ({
    label: calango.nome,
    value: calango._id,
  }));

  const generateUploadUrl = useAction(api.runs.generateUploadUrl);
  const attachVideoToRun = useMutation(api.runs.attachVideoToRun);
  const [pendingVideo, setPendingVideo] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled
    ? (value: boolean) => externalOnOpenChange?.(value)
    : setInternalOpen;

  const createRun = useMutation(api.runs.createRun);
  const updateRun = useMutation(api.runs.updateRun);

  const form = useForm<RunsFormData>({
    resolver: zodResolver(runsSchema),
    defaultValues: {
      calango: run?.observationClientId ?? "",
      ordem: run ? String(run.ordem) : "1",
      temperatura: toDisplay(run?.temperatura),
      desempenho: toDisplay(run?.desempenho),
    },
  });

  const handleClose = () => {
    form.reset();
    setOpen(false);
    onClose?.();
  };

  const handleSubmit = async (values: RunsFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      let currentRunId: Id<"runs">;
      if (run) {
        await updateRun({
          id: run._id,
          observationClientId: values.calango,
          ordem: Number(values.ordem),
          temperatura: toNumber(values.temperatura)!,
          desempenho: toNumber(values.desempenho),
        });
        currentRunId = run._id;
      } else {
        currentRunId = await createRun({
          clientId: Crypto.randomUUID(),
          observationClientId: values.calango,
          ordem: Number(values.ordem),
          temperatura: toNumber(values.temperatura)!,
          desempenho: toNumber(values.desempenho),
        });
      }

      if (pendingVideo) {
        await uploadVideoToRun(
          pendingVideo,
          currentRunId,
          generateUploadUrl,
          attachVideoToRun,
        );
      }

      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ocorreu um erro";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDecimalField = (
    name: "temperatura" | "desempenho",
    label: string,
    unit?: string,
  ) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <View className="space-y-1">
          <Label nativeID={name}>
            {label} {unit ? `(${unit})` : ""}
          </Label>
          <Input
            aria-labelledby={name}
            inputMode="decimal"
            placeholder="0,0"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            editable={!isSubmitting}
          />
          {form.formState.errors[name] && (
            <Text className="text-sm text-red-600">
              {form.formState.errors[name]?.message}
            </Text>
          )}
        </View>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{run ? "Editar run" : "Nova run"}</DialogTitle>
          <DialogDescription>
            {run
              ? "Atualize os dados dessa run"
              : "Cadastre uma nova run para essa observação"}
          </DialogDescription>
        </DialogHeader>

        <View className="gap-4 py-4">
          {error ? (
            <View className="bg-red-50 p-2 rounded">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          ) : null}

          <Controller
            control={form.control}
            name="calango"
            render={({ field }) => (
              <View className="space-y-1">
                <Label nativeID="calango">Calango</Label>
                <Select
                  value={
                    field.value
                      ? {
                          value: field.value,
                          label:
                            lizard.find((l) => l.value === field.value)
                              ?.label ?? "",
                        }
                      : undefined
                  }
                  onValueChange={(option) => field.onChange(option?.value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um calango" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectGroup>
                      <SelectLabel>Calangos</SelectLabel>
                      {lizard.map((calango) => (
                        <SelectItem
                          key={calango.value}
                          label={calango.label}
                          value={calango.value}
                        >
                          {calango.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {form.formState.errors.calango && (
                  <Text className="text-sm text-red-600">
                    {form.formState.errors.calango.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={form.control}
            name="ordem"
            render={({ field }) => (
              <View className="space-y-1">
                <Label nativeID="ordem">Ordem</Label>
                <Input
                  aria-labelledby="ordem"
                  inputMode="numeric"
                  placeholder="1"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  editable={!isSubmitting}
                />
                {form.formState.errors.ordem && (
                  <Text className="text-sm text-red-600">
                    {form.formState.errors.ordem.message}
                  </Text>
                )}
              </View>
            )}
          />

          {renderDecimalField("temperatura", "Temperatura", "°C")}
          {renderDecimalField("desempenho", "Desempenho (opcional)")}

          <VideoPicker onVideoSelected={setPendingVideo} />
          {pendingVideo && (
            <Text className="text-sm text-gray-500">Vídeo selecionado ✓</Text>
          )}
        </View>

        <DialogFooter>
          <Button variant="outline" onPress={handleClose}>
            <Text>Cancelar</Text>
          </Button>
          <Button
            disabled={isSubmitting}
            onPress={form.handleSubmit(handleSubmit)}
            className="bg-[#9acd32]"
            variant="secondary"
          >
            <Text>
              {isSubmitting
                ? "Salvando..."
                : run
                  ? "Atualizar Run"
                  : "Criar Run"}
            </Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
