import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import fesaLogo from '@/assets/fesa-logo.png';
import { toast } from 'sonner';

export default function Login() {
  const { users, setCurrentUser } = useApp();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    setTimeout(() => {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.active);
      
      if (user) {
        setCurrentUser(user);
        toast.success(`Bienvenido, ${user.name}`);
      } else {
        toast.error('Usuario no encontrado o inactivo');
      }
      setIsLoading(false);
    }, 500);
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
            <p className="text-muted-foreground mt-2">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@fesa.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Cuentas de demostración:
            </p>
            <div className="space-y-2">
              {users.slice(0, 3).map((user) => (
                <button
                  key={user.id}
                  onClick={() => setEmail(user.email)}
                  className="w-full text-left px-4 py-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-muted-foreground text-xs">{user.email} • {user.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2024 FESA Ltda. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
