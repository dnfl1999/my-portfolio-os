import { PropsWithChildren, ReactNode } from "react";

interface CardProps extends PropsWithChildren {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function Card({ title, description, action, className = "", children }: CardProps) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || description || action) && (
        <div className="card-header">
          <div>
            {title && <h3>{title}</h3>}
            {description && <p>{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
