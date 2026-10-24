import { useState } from "react";

const initialForm = {
  title: "",
  description: "",
  category: "General",
  priority: "Medium",
};

function TicketForm({ onSubmit, onCancel, submitting = false }) {
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const title = formData.title.trim();
    const description = formData.description.trim();

    if (title.length < 3) {
      setError("Title must contain at least 3 characters.");
      return;
    }

    if (description.length < 5) {
      setError("Description must contain at least 5 characters.");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        title,
        description,
      });

      setFormData(initialForm);
    } catch (err) {
      setError(err.message || "Failed to create ticket.");
    }
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <h2>Create New Ticket</h2>
      <p>Provide details about the IT issue you are experiencing.</p>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-group">
        <label htmlFor="ticket-title">Ticket Title</label>
        <input
          id="ticket-title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Laptop cannot connect to Wi-Fi"
          maxLength={200}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="ticket-description">Description</label>
        <textarea
          id="ticket-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the problem in detail..."
          rows={5}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="ticket-category">Category</label>
        <select
          id="ticket-category"
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="General">General</option>
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Network">Network</option>
          <option value="Account">Account</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="ticket-priority">Priority</label>
        <select
          id="ticket-priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
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
          {submitting ? "Creating..." : "Create Ticket"}
        </button>
      </div>
    </form>
  );
}

export default TicketForm;
