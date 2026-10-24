import { useCallback, useEffect, useState } from "react";
import TicketForm from "./TicketForm";
import TicketEditForm from "./TicketEditForm";
import TicketDetails from "./TicketDetails";
import Notification from "./Notification";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [notification, setNotification] = useState(null);

  function showNotification(message, type = "success") {
    setNotification({
      id: Date.now(),
      message,
      type,
    });
  }

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTickets() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/tickets`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load tickets: HTTP ${response.status}`);
        }

        const data = await response.json();
        setTickets(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchTickets();

    return () => controller.abort();
  }, []);

  async function handleCreateTicket(ticketData) {
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ticket: HTTP ${response.status}`);
      }

      const newTicket = await response.json();

      setTickets((previous) => [newTicket, ...previous]);
      setShowTicketForm(false);
      showNotification(`Ticket #${newTicket.id} created successfully!`);
    } catch (err) {
      showNotification("Unable to create ticket.", "error");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateTicket(ticketId, updates) {
    setUpdating(true);

    try {
      const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ticket: HTTP ${response.status}`);
      }

      const updatedTicket = await response.json();

      setTickets((previous) =>
        previous.map((ticket) =>
          ticket.id === ticketId ? updatedTicket : ticket,
        ),
      );

      setEditingTicket(null);
      showNotification(`Ticket #${ticketId} updated successfully!`);
    } catch (err) {
      showNotification("Unable to update ticket.", "error");
      throw err;
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteTicket(ticket) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ticket #${ticket.id}?\n\n${ticket.title}\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tickets/${ticket.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ticket: HTTP ${response.status}`);
      }

      setTickets((previous) =>
        previous.filter((item) => item.id !== ticket.id),
      );

      if (editingTicket?.id === ticket.id) {
        setEditingTicket(null);
      }
      if (selectedTicket?.id === ticket.id) {
        setSelectedTicket(null);
      }
      showNotification(`Ticket #${ticket.id} deleted successfully!`);
    } catch {
      showNotification("Unable to delete ticket.", "error");
    }
  }

  const stats = [
    { label: "Total Tickets", value: tickets.length },
    {
      label: "Open Tickets",
      value: tickets.filter((t) => t.status === "Open").length,
    },
    {
      label: "In Progress",
      value: tickets.filter((t) => t.status === "In Progress").length,
    },
    {
      label: "Resolved",
      value: tickets.filter((t) => t.status === "Resolved").length,
    },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const search = searchQuery.trim().toLowerCase();

    const matchesSearch =
      ticket.title.toLowerCase().includes(search) ||
      String(ticket.id).includes(search);

    const matchesStatus =
      statusFilter === "All" || ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="app-layout">
      {notification && (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <aside className="sidebar">
        <h2 className="brand">HelpDesk</h2>

        <nav className="sidebar-nav">
          {["Dashboard", "Tickets", "Settings"].map((page) => (
            <button
              key={page}
              className={`nav-item ${activePage === page ? "active" : ""}`}
              onClick={() => setActivePage(page)}
            >
              {page}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">IT Helpdesk Management System</div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">IT SUPPORT PORTAL</p>
            <h1>{activePage}</h1>
          </div>

          <div className="user-profile">
            <div className="avatar">IT</div>
            <span>IT Administrator</span>
          </div>
        </header>

        {activePage === "Dashboard" ? (
          <>
            <section className="welcome-section">
              <h2>Helpdesk Overview</h2>
              <p>Monitor and manage IT support requests in one place.</p>
            </section>

            <section className="stats-grid">
              {stats.map((stat) => (
                <div className="stat-card" key={stat.label}>
                  <p>{stat.label}</p>
                  <h2>{stat.value}</h2>
                </div>
              ))}
            </section>

            <section className="tickets-section">
              <div className="section-header">
                <h2>Recent Tickets</h2>
                <button
                  className="primary-button"
                  onClick={() => setActivePage("Tickets")}
                >
                  View All Tickets
                </button>
              </div>

              {loading ? (
                <p>Loading tickets...</p>
              ) : error ? (
                <p role="alert">Unable to load tickets: {error}</p>
              ) : tickets.length === 0 ? (
                <p>No support tickets found.</p>
              ) : (
                <TicketTable tickets={tickets} />
              )}
            </section>
          </>
        ) : activePage === "Tickets" ? (
          <section className="tickets-section">
            <div className="section-header">
              <h2>All Tickets</h2>
              <button
                className="primary-button"
                onClick={() => setShowTicketForm(true)}
              >
                + New Ticket
              </button>
            </div>

            <div className="ticket-filters">
              <input
                type="search"
                placeholder="Search tickets by title or ID..."
                aria-label="Search tickets"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                aria-label="Filter by priority"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {showTicketForm && (
              <TicketForm
                onSubmit={handleCreateTicket}
                onCancel={() => setShowTicketForm(false)}
                submitting={submitting}
              />
            )}

            {editingTicket && (
              <TicketEditForm
                key={editingTicket.id}
                ticket={editingTicket}
                onSubmit={handleUpdateTicket}
                onCancel={() => setEditingTicket(null)}
                submitting={updating}
              />
            )}

            {selectedTicket && (
              <TicketDetails
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
              />
            )}

            {loading ? (
              <p>Loading tickets...</p>
            ) : error ? (
              <p role="alert">Unable to load tickets: {error}</p>
            ) : tickets.length === 0 ? (
              <p>No support tickets found.</p>
            ) : filteredTickets.length === 0 ? (
              <p>No tickets match your search or filters.</p>
            ) : (
              <TicketTable
                tickets={filteredTickets}
                onView={(ticket) => {
                  setShowTicketForm(false);
                  setEditingTicket(null);
                  setSelectedTicket(ticket);
                }}
                onEdit={(ticket) => {
                  setShowTicketForm(false);
                  setSelectedTicket(null);
                  setEditingTicket(ticket);
                }}
                onDelete={handleDeleteTicket}
              />
            )}
          </section>
        ) : (
          <section className="tickets-section">
            <h2>Settings</h2>
            <p>Settings will be available in a future step.</p>
          </section>
        )}
      </main>
    </div>
  );
}

function TicketTable({ tickets, onView, onEdit, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="ticket-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Subject</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            {(onView || onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>#{String(ticket.id).padStart(3, "0")}</td>
              <td>{ticket.title}</td>
              <td>{ticket.category}</td>
              <td>
                <span
                  className={`badge priority-${ticket.priority.toLowerCase()}`}
                >
                  {ticket.priority}
                </span>
              </td>
              <td>
                <span
                  className={`badge status-${ticket.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {ticket.status}
                </span>
              </td>
              {(onView || onEdit || onDelete) && (
                <td>
                  <div className="ticket-actions">
                    {onView && (
                      <button
                        type="button"
                        className="view-button"
                        onClick={() => onView(ticket)}
                      >
                        View
                      </button>
                    )}

                    {onEdit && (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => onEdit(ticket)}
                      >
                        Edit
                      </button>
                    )}

                    {onDelete && (
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => onDelete(ticket)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
