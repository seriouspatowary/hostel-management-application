import { toast, Toast } from "react-hot-toast";
import { createElement, MouseEvent } from "react";

type ConfirmOptions = {
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

const useToast = () => {
  const showSuccess = (message: string): void => {
    toast.success(message);
  };

  const showError = (message: string): void => {
    toast.error(message);
  };

  const showMessage = (message: string): void => {
    toast(message);
  };

  const showConfirm = ({ message, onConfirm, onCancel }: ConfirmOptions): void => {
    toast.custom(
      (t: Toast) =>
        // Create a positioning container that covers the entire screen
        createElement(
          "div",
          {
            style: {
              position: "fixed",
              top: "0",
              left: "0",
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              pointerEvents: "none", // Allow clicks to pass through the container
            },
          },
          // The actual modal content
          createElement(
            "div",
            {
              style: {
                background: "#1e293b",
                color: "#f1f5f9",
                padding: "1.25rem",
                borderRadius: "10px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                width: "100%",
                maxWidth: "320px",
                fontFamily: "'Inter', sans-serif",
                pointerEvents: "auto", // Re-enable pointer events for the modal
              },
            },
            createElement(
              "p",
              {
                style: {
                  margin: "0 0 1rem 0",
                  fontSize: "0.95rem",
                  lineHeight: "1.4",
                },
              },
              message
            ),
            createElement(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                },
              },
              createElement(
                "button",
                {
                  onClick: () => {
                    toast.dismiss(t.id);
                    onCancel?.();
                  },
                  style: {
                    padding: "6px 14px",
                    backgroundColor: "#475569",
                    color: "#e2e8f0",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  },
                },
                "Cancel"
              ),
              createElement(
                "button",
                {
                  onClick: () => {
                    toast.dismiss(t.id);
                    onConfirm?.();
                  },
                  style: {
                    padding: "6px 14px",
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500",
                  },
                },
                "Confirm"
              )
            )
          )
        ),
      {
        duration: Infinity,
        position: "top-center",
        style: {
          position: "static",
          background: "transparent",
          boxShadow: "none",
          padding: "0",
          margin: "0",
        },
      }
    );
  };

  return {
    showSuccess,
    showError,
    showMessage,
    showConfirm,
  };
};

export default useToast;