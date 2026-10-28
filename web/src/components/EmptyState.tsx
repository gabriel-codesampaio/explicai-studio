import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, children, action }: Props) {
  return (
    <div className="empty">
      <h1>{title}</h1>
      <p>{children}</p>
      {action && (
        <button type="button" className="primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
