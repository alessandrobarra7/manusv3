import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples
    if (!email) {
      setEmailError(true);
      return;
    }
    if (!password) {
      setPasswordError(true);
      return;
    }

    // Redirecionar para OAuth
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-background">
        <div className="max-w-md w-full mx-auto">
          {/* Logo e Título */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-7 h-7 text-primary-foreground"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">SETE ME</h1>
                <p className="text-sm text-primary font-medium">CLOUD</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Bem Vindo(a),
            </h2>
            <p className="text-muted-foreground">
              Acesse a sua conta abaixo
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                * E-mail ou Username :
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder="E-mail ou Username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                  }}
                  className={`pl-10 ${emailError ? 'border-destructive' : ''}`}
                />
                {emailError && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
                )}
              </div>
              {emailError && (
                <p className="text-sm text-destructive">
                  Entre com o seu E-mail ou Username.
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                * Senha :
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  className={`pl-10 ${passwordError ? 'border-destructive' : ''}`}
                />
                {passwordError && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
                )}
              </div>
              {passwordError && (
                <p className="text-sm text-destructive">
                  Entre com a sua senha.
                </p>
              )}
            </div>

            {/* Link Esqueceu Senha */}
            <div className="flex justify-start">
              <a
                href="#"
                className="text-sm text-primary hover:underline font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  // Aqui poderia abrir modal de recuperação de senha
                }}
              >
                Esqueceu sua senha?
              </a>
            </div>

            {/* Botão Acessar */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
            >
              Acessar
            </Button>
          </form>
        </div>
      </div>

      {/* Lado Direito - Imagem */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/login-medical-bg.jpg)',
          }}
        >
          {/* Overlay escuro para melhor contraste */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/60" />
        </div>
      </div>
    </div>
  );
}
