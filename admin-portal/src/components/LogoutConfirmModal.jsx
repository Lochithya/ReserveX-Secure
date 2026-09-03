import { useEffect, memo } from "react";
import { createPortal } from "react-dom";

/**
 * LogoutConfirmModal - Premium dark glassmorphism sign-out confirmation dialog.
 * Uses React Portal to guarantee viewport dead-center positioning.
 */
const LogoutConfirmModal = memo(({ isOpen, onCancel, onConfirm }) => {
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
      className="logout-modal-overlay-new"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        minHeight: '100vh',
        width: '100vw',
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)"
      }}
      onClick={onCancel}
    >
      {/* Modal card — stop click propagation so backdrop click doesn't bubble inside */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="logout-modal-card-new"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '28rem',
          borderRadius: '1rem',
          overflow: 'hidden',
          margin: 'auto',
          background: "rgba(15, 23, 42, 0.96)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 30px 70px rgba(0, 0, 0, 0.75)",
          animation: "modalPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
      >
        {/* Ambient top glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '10rem',
            height: '0.25rem',
            borderRadius: '9999px',
            background: "linear-gradient(90deg, #3b82f6, #6366f1)",
            filter: "blur(6px)"
          }}
        />

        {/* Close button */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.375rem',
            borderRadius: '0.5rem',
            transition: 'all 0.15s',
            color: '#94a3b8',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.background = 'transparent';
          }}
          aria-label="Close"
        >
          ✕
        </button>

        <div style={{ padding: '2rem', paddingTop: '2.5rem', textAlign: 'center' }}>
          {/* Icon */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              borderRadius: '1rem',
              margin: '0 auto 1.25rem',
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.25)"
            }}
          >
            <svg 
              style={{ width: '2rem', height: '2rem', color: '#f87171' }} 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v8.25H21a.75.75 0 010 1.5h-8.25V21a.75.75 0 01-1.5 0v-8.25H3a.75.75 0 010-1.5h8.25V3a.75.75 0 01.75-.75z" clipRule="evenodd" transform="rotate(45 12 12)"/>
            </svg>
          </div>

          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '0.5rem',
            margin: '0 0 0.5rem 0'
          }}>
            Sign Out?
          </h2>
          <p style={{ 
            fontSize: '0.875rem', 
            marginBottom: '2rem', 
            lineHeight: '1.6',
            color: '#cbd5e1',
            margin: '0 0 2rem 0'
          }}>
            You will be signed out of your ReserveX admin session. Any unsaved changes will be lost.
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '0.625rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.15s',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                padding: '0.625rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s',
                background: 'linear-gradient(to right, #dc2626, #b91c1c)',
                boxShadow: '0 10px 15px -3px rgba(185, 28, 28, 0.4)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #ef4444, #dc2626)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)';
              }}
            >
              <svg 
                style={{ width: '1rem', height: '1rem' }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
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
});

LogoutConfirmModal.displayName = 'LogoutConfirmModal';

export default LogoutConfirmModal;
