import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowRightOnRectangleIcon, XMarkIcon, ShieldExclamationIcon } from "@heroicons/react/24/solid";

/**
 * LogoutConfirmModal - Premium dark glassmorphism sign-out confirmation dialog.
 * Uses React Portal to guarantee viewport dead-center positioning.
 */
const LogoutConfirmModal = ({ isOpen, onCancel, onConfirm }) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 min-h-screen w-screen"
      style={{
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)"
      }}
      onClick={onCancel}
    >
      {/* Modal card — stop click propagation so backdrop click doesn't bubble inside */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl overflow-hidden my-auto"
        style={{
          background: "rgba(15, 23, 42, 0.96)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 30px 70px rgba(0, 0, 0, 0.75)",
          animation: "modalPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
      >
        {/* Ambient top glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 rounded-full"
          style={{ background: "linear-gradient(90deg, #3b82f6, #6366f1)", filter: "blur(6px)" }}
        />

        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-white/10"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="p-8 pt-10 text-center">
          {/* Icon */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-5"
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.25)"
            }}
          >
            <ShieldExclamationIcon className="h-8 w-8 text-red-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Sign Out?</h2>
          <p className="text-sm mb-8 leading-relaxed text-slate-300">
            You will be signed out of your ReserveX vendor session. Any unsaved changes will be lost.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-150 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-900/40"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default LogoutConfirmModal;
