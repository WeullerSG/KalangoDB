import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Pressable, View } from "react-native";

export function Login() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signUp" | "signIn">("signIn");
  const [accountCreated, setAccountCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tela, setTela] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    const submittedStep = step;
    setError(null);
    void signIn("password", { email, password, flow: step })
      .then(() => {
        if (submittedStep === "signUp") {
          setAccountCreated(true);
          setStep("signIn");
        }
      })
      .catch((err) => {
        console.log("erro aqui", err);
        const message = String(err?.message ?? "");
        if (message.includes("InvalidAccountId")) {
          setError("Email não cadastrado.");
        } else if (message.includes("InvalidSecret")) {
          setError("Senha incorreta.");
        } else {
          setError("Não foi possível concluir. Tente novamente.");
        }
      });
  };

  return (
    <View className="flex min-h-screen items-center justify-center bg-[#9acd32] p-4">
      <Card className="w-full max-w-sm">
        {tela === "reset" ? (
          <>
            <CardHeader>
              <CardTitle className="text-xl">Redefinir senha</CardTitle>
              <CardDescription>
                Enviaremos um código para o seu email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Pressable onPress={() => setTela("login")} className="mt-6">
                <Text className="text-center text-sm font-medium text-foreground underline-offset-4">
                  Voltar para o login
                </Text>
              </Pressable>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-xl">
                {step === "signIn" ? "Entrar" : "Criar conta"}
              </CardTitle>
              <CardDescription>
                {step === "signIn"
                  ? "Acesse sua conta para continuar"
                  : "Preencha os dados para criar sua conta"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <View className="flex flex-col gap-4">
                <View className="flex flex-col gap-1.5">
                  <Label htmlFor="email" nativeID="email">
                    Email
                  </Label>
                  <Input
                    aria-labelledby="email"
                    placeholder="voce@exemplo.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                <View className="flex flex-col gap-1.5">
                  <Label htmlFor="password" nativeID="password">
                    Senha
                  </Label>
                  <Input
                    aria-labelledby="password"
                    placeholder="••••••••"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
                {error && (
                  <Text className="text-sm text-destructive">{error}</Text>
                )}
                {accountCreated && step === "signIn" && (
                  <Text className="text-sm text-muted-foreground">
                    Conta criada! Faça login para continuar.
                  </Text>
                )}
                <Button className="mt-1 w-full" onPress={handleSubmit}>
                  <Text>{step === "signIn" ? "Entrar" : "Criar conta"}</Text>
                </Button>
              </View>

              {step === "signIn" && (
                <Pressable onPress={() => setTela("reset")} className="mt-3">
                  <Text className="text-center text-sm font-medium text-muted-foreground underline-offset-4">
                    Esqueci minha senha
                  </Text>
                </Pressable>
              )}

              <View className="mt-4 flex flex-row items-center gap-3">
                <Separator className="flex-1" />
                <Text className="text-xs text-muted-foreground">ou</Text>
                <Separator className="flex-1" />
              </View>

              <Button variant="outline" className="mt-4 w-full">
                <Text>Entrar com Google</Text>
              </Button>

              <View className="mt-6 flex flex-row items-center justify-center gap-1">
                <Text className="text-center text-sm text-muted-foreground">
                  {step === "signIn"
                    ? "Não tem uma conta?"
                    : "Já tem uma conta?"}
                </Text>
                <Pressable
                  onPress={() => {
                    setAccountCreated(false);
                    setStep(step === "signIn" ? "signUp" : "signIn");
                  }}
                >
                  <Text className="text-sm font-medium text-foreground underline-offset-4">
                    {step === "signIn" ? "Criar conta" : "Entrar"}
                  </Text>
                </Pressable>
              </View>
            </CardContent>
          </>
        )}
      </Card>
    </View>
  );
}

export default Login;
