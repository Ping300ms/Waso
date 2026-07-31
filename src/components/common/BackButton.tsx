import { IoChevronBackOutline } from "react-icons/io5";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = "" }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-sm"
    >
      <IoChevronBackOutline size={18} aria-hidden />
      {label}
    </button>
  );
}
