import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Form, FormField } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useAlert } from "@/shared/contexts/AlertContext";
import { api } from "@repo/api/convex/_generated/api";
import { Doc } from "@repo/api/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { MapPin, PawPrint, Ruler, Thermometer } from "lucide-react";

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

  // localização
  endereco: z.string().optional(),
  cep: z.string().optional(),
  lat: decimalString,
  lng: decimalString,

  // condições
  exposicaoSol: z.string().optional(),
  sexo: z.string().optional(),

  // temperaturas do momento
  tb: decimalString,
  tSubstrato: decimalString,
  tAr: decimalString,

  // limites térmicos
  ctMin: decimalString,
  ctMax: decimalString,
  tPref: decimalString,

  // morfometria
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

// yyyy-MM-ddThh:mm pro <input type="datetime-local">
function timestampToLocalInput(ts?: number) {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
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

  const { showAlert } = useAlert();
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
        clientId: crypto.randomUUID(),
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

      showAlert({
        variant: "default",
        title: "Sucesso!",
        description: `${values.nome} foi registrado com sucesso.`,
      });

      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ocorreu um erro";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWithTabSwitch = form.handleSubmit(
    handleSubmit,
    (errors: any) => {
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
      icon: <PawPrint className="h-4 w-4" />,
      errors: geralErrors,
    },
    {
      id: "local",
      label: "Local",
      icon: <MapPin className="h-4 w-4" />,
      errors: localErrors,
    },
    {
      id: "temp",
      label: "Temperaturas",
      icon: <Thermometer className="h-4 w-4" />,
      errors: tempErrors,
    },
    {
      id: "morfo",
      label: "Morfometria",
      icon: <Ruler className="h-4 w-4" />,
      errors: morfoErrors,
    },
  ];

  const renderDecimalField = (
    name: keyof LizardFormData,
    label: string,
    unit?: string,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <div className="space-y-1">
          <Label htmlFor={name}>
            {label}{" "}
            {unit && <span className="text-muted-foreground">({unit})</span>}
          </Label>
          <Input
            id={name}
            inputMode="decimal"
            placeholder="0,0"
            {...field}
            value={field.value ?? ""}
            disabled={isSubmitting}
          />
          {(form.formState.errors as Record<string, { message?: string }>)[
            name
          ] && (
            <p className="text-sm text-red-600">
              {
                (form.formState.errors as Record<string, { message?: string }>)[
                  name
                ]?.message
              }
            </p>
          )}
        </div>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onCloseAutoFocus={() => form.reset()}
        className="sm:max-w-[520px]"
      >
        <DialogHeader>
          <DialogTitle>{notes ? "Editar calango" : "Novo calango"}</DialogTitle>
          <DialogDescription>
            {notes
              ? "Atualize os dados dessa observação"
              : "Cadastre uma nova observação de campo"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit flex-wrap">
          {tabs.map((t) => (
            <Button
              key={t.id}
              type="button"
              variant="ghost"
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
              {t.errors > 0 && (
                <div className="absolute -top-1.5 -right-1 bg-red-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center leading-none">
                  {t.errors}
                </div>
              )}
            </Button>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmitWithTabSwitch}>
            <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              {tab === "geral" && (
                <React.Fragment key="geral">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label htmlFor="nome">Nome / identificação</Label>
                        <Input
                          id="nome"
                          placeholder="Priscilla"
                          {...field}
                          disabled={isSubmitting}
                        />
                        {form.formState.errors.nome && (
                          <p className="text-sm text-red-600">
                            {form.formState.errors.nome.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notedAt"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label htmlFor="notedAt">Data e hora</Label>
                        <Input
                          id="notedAt"
                          type="datetime-local"
                          {...field}
                          disabled={isSubmitting}
                        />
                        {form.formState.errors.notedAt && (
                          <p className="text-sm text-red-600">
                            {form.formState.errors.notedAt.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="exposicaoSol"
                      render={({ field }) => (
                        <div className="space-y-1">
                          <Label>Exposição ao sol</Label>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sol">Sol</SelectItem>
                              <SelectItem value="sombra">Sombra</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sexo"
                      render={({ field }) => (
                        <div className="space-y-1">
                          <Label>Sexo</Label>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="femea">Fêmea</SelectItem>
                              <SelectItem value="macho">Macho</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />
                  </div>
                </React.Fragment>
              )}

              {tab === "local" && (
                <React.Fragment key="local">
                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label htmlFor="endereco">Local</Label>
                        <Input
                          id="endereco"
                          placeholder="Avenida Amazonas, 1720, Umuarama, Uberlândia MG"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          placeholder="38405-302"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    {renderDecimalField("lat", "Latitude")}
                    {renderDecimalField("lng", "Longitude")}
                  </div>
                </React.Fragment>
              )}

              {tab === "temp" && (
                <div className="grid grid-cols-2 gap-3">
                  {renderDecimalField("tb", "Tb (basal)", "°C")}
                  {renderDecimalField("tSubstrato", "T substrato", "°C")}
                  {renderDecimalField("tAr", "T ar", "°C")}
                  {renderDecimalField("ctMin", "Tc mín", "°C")}
                  {renderDecimalField("ctMax", "CTMax", "°C")}
                  {renderDecimalField("tPref", "T preferencial", "°C")}
                </div>
              )}

              {tab === "morfo" && (
                <div className="grid grid-cols-2 gap-3">
                  {renderDecimalField("crc", "CRC", "mm")}
                  {renderDecimalField("larguraCorpo", "Largura do corpo", "mm")}
                  {renderDecimalField("alturaCorpo", "Altura do corpo", "mm")}
                  {renderDecimalField(
                    "comprimentoCauda",
                    "Comprimento cauda",
                    "mm",
                  )}
                  {renderDecimalField(
                    "comprimentoCabeca",
                    "Comprimento cabeça",
                    "mm",
                  )}
                  {renderDecimalField("alturaCabeca", "Altura cabeça", "mm")}
                  {renderDecimalField("larguraCabeca", "Largura cabeça", "mm")}
                  {renderDecimalField(
                    "pataDiantDir",
                    "Pata diant. direita",
                    "mm",
                  )}
                  {renderDecimalField(
                    "pataDiantEsq",
                    "Pata diant. esquerda",
                    "mm",
                  )}
                  {renderDecimalField(
                    "pataTrasDir",
                    "Pata tras. direita",
                    "mm",
                  )}
                  {renderDecimalField(
                    "pataTrasEsq",
                    "Pata tras. esquerda",
                    "mm",
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : notes ? "Atualizar" : "Criar"}{" "}
                Calango
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
