import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import fesaLogo from '@/assets/fesa-logo.png';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth(); // Ya no necesitamos signUp
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form only
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast.error(error.message === 'Invalid login credentials' 
        ? 'Credenciales inválidas' 
        : error.message);
    } else {
      toast.success('Bienvenido');
      navigate('/');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl border p-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src={fesaLogo} 
              alt="FESA" 
              className="h-12 mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold font-display">Sistema de Inventario</h1>
            <p className="text-muted-foreground mt-2">Acceso exclusivo para personal autorizado</p>
          </div>

          {/* Formulario Único (Sin Tabs) */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Correo electrónico</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="usuario@fesa.cl"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Contraseña</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2024 FESA Ltda. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}