def test_create_emergency(client, dispatcher_token):
    resp = client.post("/api/emergency/", json={
        "patient_name": "John Smith",
        "patient_phone": "9876543210",
        "lat": 12.9716,
        "lng": 77.5946,
        "severity": "critical",
        "address": "MG Road, Bengaluru",
    }, headers={"Authorization": f"Bearer {dispatcher_token}"})

    assert resp.status_code == 201
    data = resp.json()
    assert data["patient_name"] == "John Smith"
    assert data["status"] == "pending"
    assert data["severity"] == "critical"


def test_get_emergency(client, dispatcher_token):
    create = client.post("/api/emergency/", json={
        "patient_name": "Alice",
        "lat": 12.9716,
        "lng": 77.5946,
        "severity": "medium",
    }, headers={"Authorization": f"Bearer {dispatcher_token}"})

    eid = create.json()["id"]
    resp = client.get(f"/api/emergency/{eid}", headers={"Authorization": f"Bearer {dispatcher_token}"})
    assert resp.status_code == 200
    assert resp.json()["id"] == eid


def test_list_emergencies(client, dispatcher_token):
    for i in range(3):
        client.post("/api/emergency/", json={
            "patient_name": f"Patient {i}",
            "lat": 12.97 + i * 0.01,
            "lng": 77.59,
            "severity": "low",
        }, headers={"Authorization": f"Bearer {dispatcher_token}"})

    resp = client.get("/api/emergency/", headers={"Authorization": f"Bearer {dispatcher_token}"})
    assert resp.status_code == 200
    assert len(resp.json()) >= 3


def test_update_emergency_status(client, dispatcher_token):
    create = client.post("/api/emergency/", json={
        "patient_name": "Bob",
        "lat": 12.9716,
        "lng": 77.5946,
        "severity": "medium",
    }, headers={"Authorization": f"Bearer {dispatcher_token}"})

    eid = create.json()["id"]
    resp = client.patch(f"/api/emergency/{eid}/status",
                        json={"status": "resolved"},
                        headers={"Authorization": f"Bearer {dispatcher_token}"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "resolved"
