import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/pacs-query");
    }
  }, [isAuthenticated, setLocation]);

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
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-20 xl:px-32 bg-white">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            {/* Logo circular com listras azuis */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 flex flex-col justify-center">
                <div className="h-1 bg-white/30 mb-1 transform -skew-y-12"></div>
                <div className="h-1.5 bg-white/50 mb-1 transform -skew-y-12"></div>
                <div className="h-2 bg-white/70 mb-1 transform -skew-y-12"></div>
                <div className="h-1.5 bg-white/50 mb-1 transform -skew-y-12"></div>
                <div className="h-1 bg-white/30 transform -skew-y-12"></div>
              </div>
            </div>
            
            {/* Texto do Logo */}
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl font-bold text-gray-800" style={{ letterSpacing: '-0.02em' }}>
                SETE ME
              </h1>
              <span className="text-xl font-medium text-blue-500">
                CLOUD
              </span>
            </div>
          </div>
          
          {/* Título de Boas-vindas */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              Bem Vindo(a),
            </h2>
            <p className="text-gray-500 text-sm">
              Acesse a sua conta abaixo
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-gray-700">
                * E-mail ou Username :
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="text"
                  placeholder="E-mail ou Username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                  }}
                  className={`pl-10 h-11 border-gray-300 ${emailError ? 'border-red-500' : ''}`}
                />
                {emailError && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
              {emailError && (
                <p className="text-sm text-red-500">
                  Entre com o seu E-mail ou Username.
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-gray-700">
                * Senha :
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  className={`pl-10 h-11 border-gray-300 ${passwordError ? 'border-red-500' : ''}`}
                />
                {passwordError && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                )}
              </div>
              {passwordError && (
                <p className="text-sm text-red-500">
                  Entre com a sua senha.
                </p>
              )}
            </div>

            {/* Link Esqueceu Senha */}
            <div className="flex justify-start pt-1">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
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
              className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 rounded-lg mt-6"
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
            backgroundPosition: 'center center',
          }}
        >
          {/* Overlay azul sutil */}
          <div className="absolute inset-0 bg-blue-600/20" />
        </div>
      </div>
    </div>
  );
}
