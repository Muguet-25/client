type ButtonProps = {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    type?: "button" | "submit" | "reset";
    icon?: React.ReactNode;
    fullWidth?: boolean;
    loading?: boolean;
    asChild?: boolean;
    as?: React.ElementType;
    href?: string;
    target?: string;
    rel?: string;
}

export type { ButtonProps };