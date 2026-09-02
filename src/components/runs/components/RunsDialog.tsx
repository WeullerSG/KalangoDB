import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Text, View } from "react-native";
import { Doc } from "../../../../convex/_generated/dataModel";

interface RunDetailsDialogProps {
  run: Doc<"runs"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center bg-[#f2efe6] rounded-xl px-3 py-2.5">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}

export default function RunDetailsDialog({
  run,
  open,
  onOpenChange,
  onEdit,
}: RunDetailsDialogProps) {
  if (!run) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Corrida #{run.ordem}</DialogTitle>
        </DialogHeader>

        <View className="gap-2 py-2">
          <DetailRow label="Ordem" value={String(run.ordem)} />
          <DetailRow label="Temperatura" value={`${run.temperatura}°C`} />
          <DetailRow
            label="Desempenho"
            value={
              run.desempenho !== undefined
                ? String(run.desempenho)
                : "Não informado"
            }
          />
        </View>

        <DialogFooter>
          <Button variant="outline" onPress={() => onOpenChange(false)}>
            <Text>Fechar</Text>
          </Button>
          <Button onPress={onEdit}>
            <Text>Editar</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
