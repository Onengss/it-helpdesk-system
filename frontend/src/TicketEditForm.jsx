import { useState } from "react";

function TicketEditForm({ ticket, onSubmit, onCancel, submitting = false }) {
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await onSubmit(ticket.id, {
        status,
        priority,
      });
    } catch (err) {
      setError(err.message || "Failed to update ticket.");
    }
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <h2>Edit Ticket #{String(ticket.id).padStart(3, "0")}</h2>
      <p>{ticket.title}</p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-group">
        <label htmlFor="edit-status">Ticket Status</label>
        <select
          id="edit-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="edit-priority">Priority</label>
        <select
          id="edit-priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="cancel-button"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>

        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default TicketEditForm;
