export default function PrimaryButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-[#319795] text-white font-semibold
        px-6 py-3 rounded-lg
        transition-transform duration-200
        hover:bg-[#285e61] hover:scale-105
        ${className}
      `}
    >
      {children}
    </button>
  );
}
