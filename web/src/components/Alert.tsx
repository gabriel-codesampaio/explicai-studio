interface Props {
  message: string;
  onClose: () => void;
}

export function Alert({ message, onClose }: Props) {
  return (
    <div className="alert" role="alert">
      <span>{message}</span>
      <button type="button" className="link-btn" onClick={onClose}>
        Fechar
      </button>
    </div>
  );
}
