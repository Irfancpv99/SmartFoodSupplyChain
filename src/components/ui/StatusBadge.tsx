import { cn } from "@/lib/utils";
import { VerificationStatus } from "@/types";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  verified: {
    label: 'Verified',
    icon: CheckCircle2,
    className: 'bg-verified/10 text-verified border-verified/20',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-pending/10 text-pending border-pending/20',
  },
  unverified: {
    label: 'Unverified',
    icon: AlertCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  expired: {
    label: 'Expired',
    icon: AlertCircle,
    className: 'bg-muted/10 text-muted-foreground border-muted/20',
  },
  rejected: {
    label: 'Rejected',
    icon: AlertCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

const iconSizeConfig = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function StatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true,
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        config.className,
        sizeConfig[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizeConfig[size]} />}
      {config.label}
    </span>
  );
}
