import React from "react";
import { ButtonProps } from "@/types/button";
import { cn } from "@/lib/utils";

const Button = ({ children, variant, size, disabled, onClick, className, type, icon, fullWidth, loading, asChild, as, href, target, rel }: ButtonProps) => {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
                variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/90",
                variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
                variant === "link" && "text-primary underline-offset-4 hover:underline",
                size === "sm" && "h-9 px-4",
                size === "md" && "h-10 px-4",
                size === "lg" && "h-11 px-8",
                className
            )}
            disabled={disabled}
            onClick={onClick}
            type={type}
        >
            {children}
            {icon && <span className="ml-2">{icon}</span>}
            {loading && <span className="ml-2">Loading...</span>}
            {asChild && children}
            {as && React.createElement(as, { className, onClick, disabled, type }, children)}
            {href && <a href={href} target={target} rel={rel}>{children}</a>}
        </button>
    )
}

export default Button;