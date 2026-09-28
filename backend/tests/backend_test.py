"""Backend API tests for Garwood Glow JA."""
import io
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://glow-trust-portal.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "garwoodglowja@gmail.com"
ADMIN_PASSWORD = "GlowAdmin2026!"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---- Auth ----
def test_root():
    r = requests.get(f"{API}/", timeout=30)
    assert r.status_code == 200

def test_login_success(token):
    assert isinstance(token, str) and len(token) > 20

def test_login_wrong_password():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=30)
    assert r.status_code == 401

def test_me_requires_auth():
    r = requests.get(f"{API}/auth/me", timeout=30)
    assert r.status_code in (401, 403)

def test_me_with_token(auth_headers):
    r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=30)
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == ADMIN_EMAIL
    assert body.get("role") == "admin"


# ---- Glow Guide (AI) ----
def test_glow_guide_shape():
    payload = {
        "property_type": "villa",
        "size": "3500-6000",
        "urgency": "deep",
        "priorities": ["marble floors", "kitchen"],
        "frequency": "bi-weekly",
    }
    r = requests.post(f"{API}/glow-guide", json=payload, timeout=90)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "recommended" in data and data["recommended"].get("title")
    assert isinstance(data.get("alternates"), list) and len(data["alternates"]) == 2
    assert isinstance(data.get("comparison"), list) and len(data["comparison"]) == 3
    assert isinstance(data.get("confidence"), int)
    assert isinstance(data.get("reasoning"), str) and len(data["reasoning"].strip()) > 0
    assert isinstance(data.get("factors"), list) and len(data["factors"]) == 5


# ---- Quotes (public create) ----
def test_create_quote():
    payload = {
        "name": "TEST_User",
        "email": "test_user@example.com",
        "phone": "+18761234567",
        "property_type": "villa",
        "service": "residential-glow",
        "size": "3500-6000",
        "bedrooms": "3",
        "bathrooms": "2",
        "frequency": "bi-weekly",
        "extras": ["marble polish"],
        "notes": "TEST",
        "preferred_date": "2026-02-01",
        "preferred_time": "10:00",
        "photo_paths": [],
        "recommended_package": "residential-glow",
    }
    r = requests.post(f"{API}/quotes", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["success"] is True
    assert "id" in data
    global _CREATED_QUOTE_ID
    pytest._created_quote_id = data["id"]


def test_list_quotes_requires_auth():
    r = requests.get(f"{API}/quotes", timeout=30)
    assert r.status_code in (401, 403)


def test_list_quotes(auth_headers):
    r = requests.get(f"{API}/quotes", headers=auth_headers, timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data.get("quotes"), list)
    # Verify our created quote is in there
    ids = [q.get("id") for q in data["quotes"]]
    assert pytest._created_quote_id in ids


def test_quote_stats_requires_auth():
    r = requests.get(f"{API}/quotes/stats", timeout=30)
    assert r.status_code in (401, 403)


def test_quote_stats(auth_headers):
    r = requests.get(f"{API}/quotes/stats", headers=auth_headers, timeout=30)
    assert r.status_code == 200
    data = r.json()
    for k in ("total", "new", "scheduled", "completed"):
        assert k in data and isinstance(data[k], int)


def test_patch_quote_status(auth_headers):
    qid = pytest._created_quote_id
    r = requests.patch(f"{API}/quotes/{qid}", headers=auth_headers, json={"status": "scheduled"}, timeout=30)
    assert r.status_code == 200
    # Verify persisted
    r2 = requests.get(f"{API}/quotes", headers=auth_headers, timeout=30)
    q = next((x for x in r2.json()["quotes"] if x["id"] == qid), None)
    assert q is not None and q["status"] == "scheduled"


# ---- Uploads / Files ----
PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8"
    b"\xcf\xc0\x00\x00\x00\x03\x00\x01\x5b\xf1\x8f\xdd\x00\x00\x00\x00IEND\xaeB`\x82"
)


def test_upload_and_download(auth_headers):
    files = {"file": ("test.png", io.BytesIO(PNG_BYTES), "image/png")}
    r = requests.post(f"{API}/uploads", files=files, timeout=60)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "path" in data and data.get("filename") == "test.png"
    path = data["path"]

    # Download requires auth
    r_no_auth = requests.get(f"{API}/files/{path}", timeout=60)
    assert r_no_auth.status_code in (401, 403)

    r_auth = requests.get(f"{API}/files/{path}", headers=auth_headers, timeout=60)
    assert r_auth.status_code == 200
    assert r_auth.headers.get("content-type", "").startswith("image/")
    assert len(r_auth.content) > 0
