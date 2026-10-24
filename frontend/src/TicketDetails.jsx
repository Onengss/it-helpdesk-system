function TicketDetails({ ticket, onClose }) {
  function formatDate(value) {
    if (!value) return "Not available";

    const date = new Date(value.endsWith("Z") ? value : `${value}Z`);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString("en-MY", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kuala_Lumpur",
    });
  }

  return (
    <section className="ticket-form ticket-details">
      <div className="section-header">
        <div>
          <h2>Ticket #{String(ticket.id).padStart(3, "0")}</h2>
          <p>Support ticket details</p>
        </div>

        <button type="button" className="cancel-button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="ticket-detail-grid">
        <div>
          <strong>Title</strong>
          <p>{ticket.title}</p>
        </div>

        <div>
          <strong>Category</strong>
          <p>{ticket.category}</p>
        </div>

        <div>
          <strong>Priority</strong>
          <p>
            <span className={`badge priority-${ticket.priority.toLowerCase()}`}>
              {ticket.priority}
            </span>
          </p>
        </div>

        <div>
          <strong>Status</strong>
          <p>
            <span
              className={`badge status-${ticket.status
                .toLowerCase()
                .replaceAll(" ", "-")}`}
            >
              {ticket.status}
            </span>
          </p>
        </div>

        <div>
          <strong>Created At</strong>
          <p>{formatDate(ticket.created_at)}</p>
        </div>

        <div>
          <strong>Last Updated</strong>
          <p>{formatDate(ticket.updated_at)}</p>
        </div>
      </div>

      <div className="ticket-description">
        <strong>Description</strong>
        <p>{ticket.description}</p>
      </div>
    </section>
  );
}

export default TicketDetails;
