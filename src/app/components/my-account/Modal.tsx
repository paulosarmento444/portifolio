import { X } from "lucide-react";

const Modal = ({ isOpen, handleClose, children }: any) => {
  if (!isOpen) return null;
  return (
    <div
      id="modal-container"
      className="fixed inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300"
    >
      <div className="w-full max-w-3xl rounded-xl py-5 px-6 shadow-shape bg-zinc-900 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Confirmar criação de endereço
          </h2>
          <button onClick={handleClose} className="text-zinc-400">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
