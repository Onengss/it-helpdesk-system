import { useEffect } from "react";

function Notification({ message, type = "success", onClose }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  if (!message) return null;

  return (
    <div
      className={`notification notification-${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <div className="notification-content">
        <span className="notification-icon">
          {type === "success" ? "✓" : "!"}
        </span>

        <span>{message}</span>
      </div>

      <button
        type="button"
        className="notification-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export default Notification;
