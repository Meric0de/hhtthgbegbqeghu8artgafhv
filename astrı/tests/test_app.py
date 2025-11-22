import pytest
import json
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_status(client):
    resp = client.get('/api/status')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['status'] == 'ok'

def test_solve_valid_equation(client):
    eq = "dy/dx = -0.1 * y"
    resp = client.post('/api/equation/solve', json={"equation": eq})
    assert resp.status_code == 200
    data = resp.get_json()
    assert "solution" in data or "solutions" in data
    assert data.get("equation") == eq

def test_solve_invalid_equation(client):
    eq = "invalid equation string ^^^"
    resp = client.post('/api/equation/solve', json={"equation": eq})
    assert resp.status_code == 400
    data = resp.get_json()
    assert "error" in data

def test_solve_empty_equation(client):
    resp = client.post('/api/equation/solve', json={"equation": ""})
    assert resp.status_code == 400
    data = resp.get_json()
    assert "error" in data

def test_missing_equation(client):
    resp = client.post('/api/equation/solve', json={})
    assert resp.status_code == 400
    data = resp.get_json()
    assert "error" in data
