import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'warning' | 'success' | 'destructive';
  className?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-primary/5 border-primary/20',
  warning: 'bg-warning/5 border-warning/20',
  success: 'bg-success/5 border-success/20',
  destructive: 'bg-destructive/5 border-destructive/20',
};

const iconVariantStyles = {
  default: 'bg-secondary text-foreground',
  primary: 'gradient-cool text-primary-foreground',
  warning: 'bg-warning text-warning-foreground',
  success: 'bg-success text-success-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
};

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "relative rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden animate-fade-in",
      variantStyles[variant],
      className
    )}>
      {/* Decorative gradient */}
      {variant === 'primary' && (
        <div className="absolute top-0 right-0 w-32 h-32 gradient-warm opacity-10 blur-3xl" />
      )}
      
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-display tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-sm font-medium flex items-center gap-1",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </p>
          )}
        </div>
        <div className={cn(
          "rounded-xl p-3",
          iconVariantStyles[variant]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
