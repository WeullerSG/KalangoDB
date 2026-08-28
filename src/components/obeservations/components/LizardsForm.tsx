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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Crypto from "expo-crypto";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import * as z from "zod";

import { GetLocalization } from "@/hooks/getLocalization";
import { useMutation } from "convex/react";
import { MapPin, PawPrint, Ruler, Thermometer } from "lucide-react-native";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";

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

const lizardSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  notedAt: z.string().min(1, "Data é obrigatória"),

  endereco: z.string().optional(),
  cep: z.string().optional(),
  lat: decimalString,
  lng: decimalString,

  exposicaoSol: z.string().optional(),
  sexo: z.string().optional(),

  tb: decimalString,
  tSubstrato: decimalString,
  tAr: decimalString,

  ctMin: decimalString,
  ctMax: decimalString,
  tPref: decimalString,

  crc: decimalString,
  larguraCorpo: decimalString,
  alturaCorpo: decimalString,
  comprimentoCauda: decimalString,
  comprimentoCabeca: decimalString,
  alturaCabeca: decimalString,
  larguraCabeca: decimalString,
  pataDiantDir: decimalString,
  pataDiantEsq: decimalString,
  pataTrasDir: decimalString,
  pataTrasEsq: decimalString,
});

type LizardFormData = z.infer<typeof lizardSchema>;
type Tab = "geral" | "local" | "temp" | "morfo";

interface AddLizards {
  notes?: Doc<"observations">;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

function timestampToLocalInput(ts?: number) {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

const exposicaoOptions = [
  { value: "sol", label: "Sol" },
  { value: "sombra", label: "Sombra" },
];

const sexoOptions = [
  { value: "femea", label: "Fêmea" },
  { value: "macho", label: "Macho" },
];

function findOption(
  options: { value: string; label: string }[],
  value?: string,
) {
  return options.find((o) => o.value === value);
}

export default function LizardForm({
  notes,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onClose,
}: AddLizards) {
  const [tab, setTab] = useState<Tab>("geral");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled
    ? (value: boolean) => externalOnOpenChange?.(value)
    : setInternalOpen;

  const createObservation = useMutation(api.observations.create);

  const form = useForm<LizardFormData>({
    resolver: zodResolver(lizardSchema),
    defaultValues: {
      nome: notes?.nome ?? "",
      notedAt:
        timestampToLocalInput(notes?.notedAt) ||
        timestampToLocalInput(Date.now()),
      endereco: notes?.endereco ?? "",
      cep: notes?.cep ?? "",
      lat: toDisplay(notes?.lat),
      lng: toDisplay(notes?.lng),
      exposicaoSol: notes?.exposicaoSol ?? "",
      sexo: notes?.sexo ?? "",
      tb: toDisplay(notes?.tb),
      tSubstrato: toDisplay(notes?.tSubstrato),
      tAr: toDisplay(notes?.tAr),
      ctMin: toDisplay(notes?.ctMin),
      ctMax: toDisplay(notes?.ctMax),
      tPref: toDisplay(notes?.tPref),
      crc: toDisplay(notes?.crc),
      larguraCorpo: toDisplay(notes?.larguraCorpo),
      alturaCorpo: toDisplay(notes?.alturaCorpo),
      comprimentoCauda: toDisplay(notes?.comprimentoCauda),
      comprimentoCabeca: toDisplay(notes?.comprimentoCabeca),
      alturaCabeca: toDisplay(notes?.alturaCabeca),
      larguraCabeca: toDisplay(notes?.larguraCabeca),
      pataDiantDir: toDisplay(notes?.pataDiantDir),
      pataDiantEsq: toDisplay(notes?.pataDiantEsq),
      pataTrasDir: toDisplay(notes?.pataTrasDir),
      pataTrasEsq: toDisplay(notes?.pataTrasEsq),
    },
  });

  const geralFields = ["nome", "notedAt"] as const;
  const localFields = [
    "endereco",
    "cep",
    "lat",
    "lng",
    "exposicaoSol",
    "sexo",
  ] as const;
  const tempFields = [
    "tb",
    "tSubstrato",
    "tAr",
    "ctMin",
    "ctMax",
    "tPref",
  ] as const;
  const morfoFields = [
    "crc",
    "larguraCorpo",
    "alturaCorpo",
    "comprimentoCauda",
    "comprimentoCabeca",
    "alturaCabeca",
    "larguraCabeca",
    "pataDiantDir",
    "pataDiantEsq",
    "pataTrasDir",
    "pataTrasEsq",
  ] as const;

  const countErrors = (fields: readonly string[]) =>
    fields.filter((f) => (form.formState.errors as Record<string, unknown>)[f])
      .length;

  const geralErrors = countErrors(geralFields);
  const localErrors = countErrors(localFields);
  const tempErrors = countErrors(tempFields);
  const morfoErrors = countErrors(morfoFields);

  const handleClose = () => {
    form.reset();
    setTab("geral");
    setOpen(false);
    onClose?.();
  };

  const handleSubmit = async (values: LizardFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      await createObservation({
        clientId: Crypto.randomUUID(),
        nome: values.nome,
        notedAt: new Date(values.notedAt).getTime(),

        endereco: values.endereco || undefined,
        cep: values.cep || undefined,
        lat: toNumber(values.lat),
        lng: toNumber(values.lng),

        exposicaoSol: values.exposicaoSol || undefined,
        sexo: values.sexo || undefined,

        tb: toNumber(values.tb),
        tSubstrato: toNumber(values.tSubstrato),
        tAr: toNumber(values.tAr),

        ctMin: toNumber(values.ctMin),
        ctMax: toNumber(values.ctMax),
        tPref: toNumber(values.tPref),

        crc: toNumber(values.crc),
        larguraCorpo: toNumber(values.larguraCorpo),
        alturaCorpo: toNumber(values.alturaCorpo),
        comprimentoCauda: toNumber(values.comprimentoCauda),
        comprimentoCabeca: toNumber(values.comprimentoCabeca),
        alturaCabeca: toNumber(values.alturaCabeca),
        larguraCabeca: toNumber(values.larguraCabeca),
        pataDiantDir: toNumber(values.pataDiantDir),
        pataDiantEsq: toNumber(values.pataDiantEsq),
        pataTrasDir: toNumber(values.pataTrasDir),
        pataTrasEsq: toNumber(values.pataTrasEsq),
      });

      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ocorreu um erro";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [dados, setDados] = useState<{
    endereco?: string;
    cep?: string;
    lat?: number;
    lng?: number;
  }>({});

  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState("");

  async function handlePegarLocalizacao() {
    setIsLocating(true);
    setLocError("");
    try {
      const resultado = await GetLocalization();
      setDados(resultado);

      if (resultado.endereco) form.setValue("endereco", resultado.endereco);
      if (resultado.cep) form.setValue("cep", resultado.cep);
      if (resultado.lat !== undefined)
        form.setValue("lat", toDisplay(resultado.lat));
      if (resultado.lng !== undefined)
        form.setValue("lng", toDisplay(resultado.lng));
    } catch (e) {
      setLocError(
        "Não foi possível obter a localização. Preencha manualmente.",
      );
      console.error(e);
    } finally {
      setIsLocating(false);
    }
  }

  const handleSubmitWithTabSwitch = form.handleSubmit(
    handleSubmit,
    (errors) => {
      if (geralFields.some((f) => errors[f])) setTab("geral");
      else if (localFields.some((f) => errors[f])) setTab("local");
      else if (tempFields.some((f) => errors[f])) setTab("temp");
      else if (morfoFields.some((f) => errors[f])) setTab("morfo");
    },
  );

  const tabs: {
    id: Tab;
    label: string;
    icon: React.ReactNode;
    errors: number;
  }[] = [
    {
      id: "geral",
      label: "Geral",
      icon: <PawPrint size={16} />,
      errors: geralErrors,
    },
    {
      id: "local",
      label: "Local",
      icon: <MapPin size={16} />,
      errors: localErrors,
    },
    {
      id: "temp",
      label: "Temperaturas",
      icon: <Thermometer size={16} />,
      errors: tempErrors,
    },
    {
      id: "morfo",
      label: "Morfometria",
      icon: <Ruler size={16} />,
      errors: morfoErrors,
    },
  ];

  const renderDecimalField = (
    name: keyof LizardFormData,
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
          {(form.formState.errors as Record<string, { message?: string }>)[
            name
          ] && (
            <Text className="text-sm text-red-600">
              {
                (form.formState.errors as Record<string, { message?: string }>)[
                  name
                ]?.message
              }
            </Text>
          )}
        </View>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{notes ? "Editar calango" : "Novo calango"}</DialogTitle>
          <DialogDescription>
            {notes
              ? "Atualize os dados dessa observação"
              : "Cadastre uma nova observação de campo"}
          </DialogDescription>
        </DialogHeader>

        <View className="flex flex-row items-center gap-1 rounded-lg bg-muted p-1 flex-wrap">
          {tabs.map((t) => (
            <Button
              key={t.id}
              variant="ghost"
              onPress={() => setTab(t.id)}
              className={`relative flex flex-row items-center gap-2 rounded-md px-3 py-2 ${
                tab === t.id ? "bg-background" : ""
              }`}
            >
              {t.icon}
              <Text
                className={
                  tab === t.id
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }
              >
                {t.label}
              </Text>
              {t.errors > 0 && (
                <View className="absolute -top-1.5 -right-1 bg-red-600 rounded-full h-4 w-4 items-center justify-center">
                  <Text className="text-white text-[9px] font-bold">
                    {t.errors}
                  </Text>
                </View>
              )}
            </Button>
          ))}
        </View>

        <ScrollView
          className="max-h-[400px]"
          contentContainerClassName="py-4 gap-4"
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View className="bg-red-50 p-2 rounded">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          ) : null}

          {tab === "geral" && (
            <View className="gap-4">
              <Controller
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <View className="space-y-1">
                    <Label nativeID="nome">Nome / identificação</Label>
                    <Input
                      aria-labelledby="nome"
                      placeholder="Priscilla"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      editable={!isSubmitting}
                    />
                    {form.formState.errors.nome && (
                      <Text className="text-sm text-red-600">
                        {form.formState.errors.nome.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              <Controller
                control={form.control}
                name="notedAt"
                render={({ field }) => (
                  <View className="space-y-1">
                    <Label nativeID="notedAt">Data e hora</Label>
                    <Input
                      aria-labelledby="notedAt"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      editable={!isSubmitting}
                    />
                    {form.formState.errors.notedAt && (
                      <Text className="text-sm text-red-600">
                        {form.formState.errors.notedAt.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              <View className="flex flex-row gap-3">
                <Controller
                  control={form.control}
                  name="exposicaoSol"
                  render={({ field }) => (
                    <View className="flex-1 space-y-1">
                      <Label>Exposição ao sol</Label>
                      <Select
                        value={findOption(exposicaoOptions, field.value)}
                        onValueChange={(option) =>
                          field.onChange(option?.value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {exposicaoOptions.map((o) => (
                            <SelectItem
                              key={o.value}
                              label={o.label}
                              value={o.value}
                            >
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </View>
                  )}
                />
                <Controller
                  control={form.control}
                  name="sexo"
                  render={({ field }) => (
                    <View className="flex-1 space-y-1">
                      <Label>Sexo</Label>
                      <Select
                        value={findOption(sexoOptions, field.value)}
                        onValueChange={(option) =>
                          field.onChange(option?.value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {sexoOptions.map((o) => (
                            <SelectItem
                              key={o.value}
                              label={o.label}
                              value={o.value}
                            >
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </View>
                  )}
                />
              </View>
            </View>
          )}

          {tab === "local" && (
            <View className="gap-4">
              <Button
                variant="outline"
                onPress={handlePegarLocalizacao}
                disabled={isLocating}
                className="flex flex-row items-center gap-2 self-start"
              >
                <MapPin size={16} />
                <Text>
                  {isLocating
                    ? "Localizando..."
                    : "Usar minha localização atual"}
                </Text>
              </Button>

              {dados.lat !== undefined && !isLocating && !locError && (
                <View className="bg-green-50 px-3 py-2 rounded-md">
                  <Text className="text-sm text-green-700">
                    📍 Localização capturada
                    {dados.endereco ? `: ${dados.endereco}` : ""}
                  </Text>
                </View>
              )}

              {locError ? (
                <Text className="text-sm text-amber-600">{locError}</Text>
              ) : null}

              <Controller
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <View className="space-y-1">
                    <Label nativeID="endereco">Local</Label>
                    <Input
                      aria-labelledby="endereco"
                      placeholder="Avenida Amazonas, 1720, Umuarama, Uberlândia MG"
                      value={field.value ?? ""}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      editable={!isSubmitting}
                    />
                  </View>
                )}
              />

              <Controller
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <View className="space-y-1">
                    <Label nativeID="cep">CEP</Label>
                    <Input
                      aria-labelledby="cep"
                      placeholder="38405-302"
                      value={field.value ?? ""}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      editable={!isSubmitting}
                    />
                  </View>
                )}
              />

              <View className="flex flex-row gap-3">
                <View className="flex-1">
                  {renderDecimalField("lat", "Latitude")}
                </View>
                <View className="flex-1">
                  {renderDecimalField("lng", "Longitude")}
                </View>
              </View>
            </View>
          )}

          {tab === "temp" && (
            <View className="flex flex-row flex-wrap gap-3">
              <View className="w-[47%]">
                {renderDecimalField("tb", "Tb (basal)", "°C")}
              </View>
              <View className="w-[47%]">
                {renderDecimalField("tSubstrato", "T substrato", "°C")}
              </View>
              <View className="w-[47%]">
                {renderDecimalField("tAr", "T ar", "°C")}
              </View>
              <View className="w-[47%]">
                {renderDecimalField("ctMin", "Tc mín", "°C")}
              </View>
              <View className="w-[47%]">
                {renderDecimalField("ctMax", "CTMax", "°C")}
              </View>
              <View className="w-[47%]">
                {renderDecimalField("tPref", "T preferencial", "°C")}
              </View>
            </View>
          )}

          {tab === "morfo" && (
            <View className="flex flex-row flex-wrap gap-3">
              <View className="w-[47%]">
                {renderDecimalField("crc", "CRC", "mm")}
              </View>
              <View className="w-[47%]">
                {renderDecimalField("larguraCorpo", "Largura do corpo", "mm")}
              </View>
              <View className="w-[47%]">
                {renderDecimalField("alturaCorpo", "Altura do corpo", "mm")}
              </View>
              <View className="w-[47%]">
                {renderDecimalField(
                  "comprimentoCauda",
                  "Comprimento cauda",
                  "mm",
                )}
              </View>
              <View className="w-[47%]">
                {renderDecimalField(
                  "comprimentoCabeca",
                  "Comprimento cabeça",
                  "mm",
                )}
              </View>
              <View className="w-[47%]">
                {renderDecimalField("alturaCabeca", "Altura cabeça", "mm")}
              </View>
              <View className="w-[47%]">
                {renderDecimalField("larguraCabeca", "Largura cabeça", "mm")}
              </View>
              <View className="w-[47%]">
                {renderDecimalField(
                  "pataDiantDir",
                  "Pata diant. direita",
                  "mm",
                )}
              </View>
              <View className="w-[47%]">
                {renderDecimalField(
                  "pataDiantEsq",
                  "Pata diant. esquerda",
                  "mm",
                )}
              </View>
              <View className="w-[47%]">
                {renderDecimalField("pataTrasDir", "Pata tras. direita", "mm")}
              </View>
              <View className="w-[47%]">
                {renderDecimalField("pataTrasEsq", "Pata tras. esquerda", "mm")}
              </View>
            </View>
          )}
        </ScrollView>

        <DialogFooter>
          <Button variant="outline" onPress={handleClose}>
            <Text>Cancelar</Text>
          </Button>
          <Button disabled={isSubmitting} onPress={handleSubmitWithTabSwitch}>
            <Text>
              {isSubmitting ? "Salvando..." : notes ? "Atualizar" : "Criar"}{" "}
              Calango
            </Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
