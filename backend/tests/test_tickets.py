
def test_create_ticket(client):
    ticket_data = {
        "title": "Laptop cannot connect to Wi-Fi",
        "description": "Unable to connect to the office Wi-Fi network.",
        "category": "Network",
        "priority": "High",
    }

    response = client.post("/tickets", json=ticket_data)

    assert response.status_code == 201

    data = response.json()

    assert data["id"] == 1
    assert data["title"] == ticket_data["title"]
    assert data["description"] == ticket_data["description"]
    assert data["category"] == "Network"
    assert data["priority"] == "High"
    assert data["status"] == "Open"
    assert "created_at" in data


def test_get_all_tickets(client):
    ticket_data = {
        "title": "Printer not responding",
        "description": "Office printer is not responding.",
        "category": "Hardware",
        "priority": "Medium",
    }

    create_response = client.post("/tickets", json=ticket_data)

    assert create_response.status_code == 201

    response = client.get("/tickets")

    assert response.status_code == 200

    tickets = response.json()

    assert len(tickets) == 1
    assert tickets[0]["title"] == "Printer not responding"
    assert tickets[0]["status"] == "Open"


def test_create_ticket_invalid_title(client):
    ticket_data = {
        "title": "Hi",
        "description": "This description is valid.",
        "category": "General",
        "priority": "Low",
    }

    response = client.post("/tickets", json=ticket_data)

    assert response.status_code == 422

    tickets_response = client.get("/tickets")

    assert tickets_response.status_code == 200
    assert tickets_response.json() == []


def test_get_ticket_by_id(client):
    ticket_data = {
        "title": "Email application not working",
        "description": "User cannot open their email application.",
        "category": "Software",
        "priority": "High",
    }

    create_response = client.post("/tickets", json=ticket_data)
    assert create_response.status_code == 201
    ticket_id = create_response.json()["id"]

    response = client.get(f"/tickets/{ticket_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == ticket_id
    assert data["title"] == ticket_data["title"]
    assert data["category"] == "Software"
    assert data["priority"] == "High"
    assert data["status"] == "Open"


def test_get_nonexistent_ticket(client):
    response = client.get("/tickets/99999")

    assert response.status_code == 404


def test_update_ticket(client):
    ticket_data = {
        "title": "Laptop running slowly",
        "description": "User reports that their laptop is very slow.",
        "category": "Hardware",
        "priority": "Medium",
    }

    # Step 1: Create a ticket
    create_response = client.post("/tickets", json=ticket_data)
    assert create_response.status_code == 201
    ticket_id = create_response.json()["id"]

    # Step 2: Update the ticket
    update_data = {
        "priority": "Critical",
        "status": "In Progress",
    }
    response = client.patch(
        f"/tickets/{ticket_id}",
        json=update_data,
    )

    # Step 3: Verify the update response
    assert response.status_code == 200
    updated_ticket = response.json()
    assert updated_ticket["id"] == ticket_id
    assert updated_ticket["priority"] == "Critical"
    assert updated_ticket["status"] == "In Progress"
    assert updated_ticket["title"] == ticket_data["title"]


def test_update_nonexistent_ticket(client):
    update_data = {
        "priority": "High",
        "status": "In Progress",
    }

    response = client.patch(
        "/tickets/99999",
        json=update_data,
    )

    assert response.status_code == 404


def test_delete_ticket(client):
    # Step 1: Create a ticket
    ticket_data = {
        "title": "Monitor display issue",
        "description": "External monitor is not displaying anything.",
        "category": "Hardware",
        "priority": "Medium",
    }
    create_response = client.post(
        "/tickets",
        json=ticket_data,
    )
    assert create_response.status_code == 201
    ticket_id = create_response.json()["id"]

    # Step 2: Delete the ticket
    delete_response = client.delete(
        f"/tickets/{ticket_id}"
    )
    assert delete_response.status_code == 204

    # Step 3: Verify ticket no longer exists
    get_response = client.get(
        f"/tickets/{ticket_id}"
    )
    assert get_response.status_code == 404

    # Step 4: Verify ticket list is empty
    list_response = client.get("/tickets")
    assert list_response.status_code == 200
    assert list_response.json() == []


def test_delete_nonexistent_ticket(client):
    response = client.delete("/tickets/99999")

    assert response.status_code == 404
