import Link from "next/link";
import React from "react";
import "./button.css";

// Separate props for when it acts as a button vs link to avoid TS issues
type ButtonAsButton = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: undefined;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

type ButtonAsLink = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const variantClass = `ui-button-${variant}`;
    const sizeClass = size === "md" ? "" : `ui-button-${size}`;
    const classes = `ui-button ${variantClass} ${sizeClass} ${className}`;

    if (props.href) {
      return (
        <Link href={props.href} className={classes} ref={ref as React.Ref<HTMLAnchorElement>}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...props as React.ButtonHTMLAttributes<HTMLButtonElement>}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
