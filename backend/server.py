from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated

import jwt
import bcrypt
import requests
import httpx
import re
import ipaddress
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Header, Query, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict, EmailStr

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("garwood-glow")

app = FastAPI(title="Garwood Glow JA API")
api_router = APIRouter(prefix="/api")

# ---------------------------------------------------------------------------
# Mongo helpers
# ---------------------------------------------------------------------------
def _validate_object_id(v):
    if isinstance(v, ObjectId):
        return str(v)
    return str(v)

PyObjectId = Annotated[str, BeforeValidator(_validate_object_id)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict):
        if not doc:
            return None
        return cls(**doc)

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude_none=True)
        data.pop("_id", None)
        return data


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Auth utilities
# ---------------------------------------------------------------------------
JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# Object storage
# ---------------------------------------------------------------------------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "garwood-glow"
storage_key = None

MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp", "heic": "image/heic",
    "pdf": "application/pdf",
}


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------------------------------------------------------------------------
# Service packages + AI Glow Guide matching
# ---------------------------------------------------------------------------
PACKAGES = [
    {
        "id": "residential-glow",
        "title": "Luxury Residential & Penthouse Glow",
        "tagline": "Sanctuary-grade purification for prestigious Jamaican homes.",
        "includes": [
            "White-glove dusting of architectural mouldings",
            "Dual-side crystal glass cleaning",
            "HEPA-filtered microfiber sanitization",
            "Marble & quartz polishing",
            "Signature ambient fragrance misting",
        ],
        "property": ["villa", "penthouse", "apartment"],
        "urgency": ["routine", "deep"],
        "frequency": ["one-time", "bi-weekly", "weekly"],
    },
    {
        "id": "commercial-concierge",
        "title": "Executive Commercial & Boardroom Cleanse",
        "tagline": "Pristine work environments that inspire high-value deals.",
        "includes": [
            "Zero-residue executive desk sanitization",
            "Conference room tech screen detailing",
            "Restroom porcelain & chrome micro-buffing",
            "Commercial floor scrub & seal",
            "Discreet after-hours scheduling",
        ],
        "property": ["office", "retail"],
        "urgency": ["routine", "deep"],
        "frequency": ["weekly", "bi-weekly", "one-time"],
    },
    {
        "id": "villa-turnover",
        "title": "Luxury Villa & Vacation Rental Turnover",
        "tagline": "5-Star hotel standards for Ocho Rios, Montego Bay & Kingston stays.",
        "includes": [
            "Rapid 4-hour turnaround capability",
            "Linen change & hospital-grade bed tucks",
            "Welcome guest amenity staging",
            "Patio & outdoor dining washdown",
            "Damage inspection & inventory log",
        ],
        "property": ["villa", "apartment", "penthouse"],
        "urgency": ["emergency", "move"],
        "frequency": ["on-demand", "one-time", "weekly"],
    },
    {
        "id": "post-construction",
        "title": "Post-Construction & Move-In Restoration",
        "tagline": "Eliminating industrial silica dust and construction film.",
        "includes": [
            "High-altitude vent vacuuming",
            "Paint splatter & grout residue removal",
            "Protective tape extraction from fixtures",
            "HVAC air intake wipe-down",
            "Move-in readiness guarantee",
        ],
        "property": ["renovation", "office", "villa", "apartment", "penthouse"],
        "urgency": ["deep", "move", "emergency"],
        "frequency": ["one-time"],
    },
    {
        "id": "deep-restorative",
        "title": "Signature Deep Restorative Glow",
        "tagline": "A total reset — every corner, fixture and surface renewed.",
        "includes": [
            "Full room-by-room deep detailing",
            "Grout, tile & baseboard restoration",
            "Interior cabinet & appliance cleanse",
            "High-heat vapor sanitation",
            "Odor neutralization & air purification",
        ],
        "property": ["villa", "apartment", "penthouse", "office", "retail", "renovation"],
        "urgency": ["deep", "emergency"],
        "frequency": ["one-time", "bi-weekly"],
    },
    {
        "id": "recurring-concierge",
        "title": "Recurring Concierge Glow Plan",
        "tagline": "Effortless, always-glowing spaces on your schedule.",
        "includes": [
            "Priority recurring time slots",
            "Consistent dedicated Glow team",
            "Rotating deep-clean focus zones",
            "Complimentary Glow Check™ audits",
            "Preferred-client concierge rates",
        ],
        "property": ["villa", "apartment", "penthouse", "office", "retail"],
        "urgency": ["routine"],
        "frequency": ["weekly", "bi-weekly", "on-demand"],
    },
]

PACKAGE_BY_ID = {p["id"]: p for p in PACKAGES}


def score_packages(property_type: str, size: str, urgency: str, priorities: List[str], frequency: str):
    results = []
    for p in PACKAGES:
        score = 0
        if property_type in p["property"]:
            score += 40
        if urgency in p["urgency"]:
            score += 30
        if frequency in p["frequency"]:
            score += 20
        # priority zones nudge
        pr_text = " ".join(priorities).lower()
        if "odor" in pr_text and p["id"] in ("deep-restorative", "post-construction"):
            score += 6
        if any(k in pr_text for k in ["marble", "hardwood", "glass"]) and p["id"] in ("residential-glow", "deep-restorative"):
            score += 6
        if "kitchen" in pr_text or "bathroom" in pr_text:
            score += 4
        # bigger spaces favour deep/commercial
        if size in ("3500-6000", "6000plus") and p["id"] in ("deep-restorative", "commercial-concierge", "post-construction"):
            score += 5
        results.append((p, score))
    results.sort(key=lambda x: x[1], reverse=True)
    return results


LABELS = {
    "property": {
        "villa": "Luxury Villa", "penthouse": "Penthouse", "apartment": "Apartment / Home",
        "office": "Corporate Office", "retail": "Retail / Showroom", "renovation": "Post-Renovation Site",
    },
    "size": {
        "under1500": "Under 1,500 sq ft", "1500-3500": "1,500–3,500 sq ft",
        "3500-6000": "3,500–6,000 sq ft", "6000plus": "6,000+ sq ft",
    },
    "urgency": {
        "routine": "Routine Refinement", "deep": "Deep Restorative",
        "emergency": "Emergency Turnover (24h)", "move": "Move-In / Move-Out",
    },
    "frequency": {
        "one-time": "One-Time Deep Clean", "bi-weekly": "Bi-Weekly Concierge",
        "weekly": "Weekly VIP Service", "on-demand": "On-Demand Rotation",
    },
}


async def generate_reasoning(inputs: dict, recommended: dict) -> str:
    prop = LABELS["property"].get(inputs["property_type"], inputs["property_type"])
    size = LABELS["size"].get(inputs["size"], inputs["size"])
    urg = LABELS["urgency"].get(inputs["urgency"], inputs["urgency"])
    freq = LABELS["frequency"].get(inputs["frequency"], inputs["frequency"])
    priorities = ", ".join(inputs.get("priorities", [])) or "general upkeep"

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"glow-guide-{uuid.uuid4()}",
            system_message=(
                "You are the AI Glow Guide, a warm, concise luxury cleaning concierge for "
                "Garwood Glow JA, a premium residential & commercial cleaning company in Jamaica. "
                "Explain in 3-4 short sentences why a specific cleaning package suits the client. "
                "Reference their property, size, condition/urgency, priority zones and frequency. "
                "Never mention price. Be reassuring, elegant, and specific. Plain text only."
            ),
        ).with_model("anthropic", "claude-sonnet-4-6")
        msg = UserMessage(text=(
            f"Recommended package: {recommended['title']} — {recommended['tagline']}\n"
            f"Client property: {prop}\nSize: {size}\nCondition/urgency: {urg}\n"
            f"Priority zones: {priorities}\nDesired frequency: {freq}\n\n"
            "Write the personalised 'why we recommended this' explanation."
        ))
        text = await chat.send_message(msg)
        if isinstance(text, str) and text.strip():
            return text.strip()
    except Exception as e:
        logger.warning(f"AI Glow Guide LLM fallback: {e}")

    return (
        f"For your {prop.lower()} at {size.lower()}, the {recommended['title']} is the natural fit. "
        f"Because you flagged a {urg.lower()} need with focus on {priorities.lower()}, our team leads with the "
        f"most impactful detailing first. A {freq.lower()} cadence keeps every surface consistently glowing, "
        f"finished with our signature Glow Check™ audit."
    )


def build_factors(inputs: dict) -> List[dict]:
    return [
        {"label": "Property Type", "value": LABELS["property"].get(inputs["property_type"], inputs["property_type"]),
         "detail": "Determines the surfaces, fabrics and finishes our specialists prioritise."},
        {"label": "Approx. Size", "value": LABELS["size"].get(inputs["size"], inputs["size"]),
         "detail": "Sets the crew size and time on site for a thorough, unrushed clean."},
        {"label": "Condition & Urgency", "value": LABELS["urgency"].get(inputs["urgency"], inputs["urgency"]),
         "detail": "Decides the intensity — from routine refinement to full restorative depth."},
        {"label": "Priority Zones", "value": ", ".join(inputs.get("priorities", [])) or "General upkeep",
         "detail": "Guides where we lead first for maximum visible impact."},
        {"label": "Desired Frequency", "value": LABELS["frequency"].get(inputs["frequency"], inputs["frequency"]),
         "detail": "Shapes the ongoing plan that keeps your space consistently glowing."},
    ]


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GlowGuideRequest(BaseModel):
    property_type: str
    size: str
    urgency: str
    priorities: List[str] = []
    frequency: str


class QuoteRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    preferred_contact: str = "whatsapp"
    property_type: str
    service: str = ""
    size: str = ""
    bedrooms: str = ""
    bathrooms: str = ""
    frequency: str = ""
    extras: List[str] = []
    notes: str = ""
    preferred_date: str = ""
    preferred_time: str = ""
    photo_paths: List[str] = []
    recommended_package: str = ""


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "Garwood Glow JA API — Leaving Every Space Glowing."}


@api_router.get("/packages")
async def list_packages():
    return {"packages": PACKAGES}


@api_router.post("/auth/login")
async def login(body: LoginRequest):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), email)
    return {"access_token": token, "user": {"email": email, "name": user.get("name", "Admin"), "role": user.get("role", "admin")}}


@api_router.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return {"email": admin["email"], "name": admin.get("name", "Admin"), "role": admin.get("role", "admin")}


@api_router.post("/glow-guide")
async def glow_guide(body: GlowGuideRequest):
    inputs = body.model_dump()
    ranked = score_packages(body.property_type, body.size, body.urgency, body.priorities, body.frequency)
    top = ranked[0]
    recommended = top[0]
    raw = top[1]
    confidence = min(98, max(72, int(raw + 12)))
    alternates = [p for p, _ in ranked[1:3]]
    reasoning = await generate_reasoning(inputs, recommended)
    factors = build_factors(inputs)

    # persist consult
    await db.glow_consults.insert_one({
        "id": str(uuid.uuid4()),
        "inputs": inputs,
        "recommended": recommended["id"],
        "created_at": now_iso(),
    })

    return {
        "recommended": recommended,
        "alternates": alternates,
        "comparison": [recommended] + alternates,
        "confidence": confidence,
        "reasoning": reasoning,
        "factors": factors,
    }


@api_router.post("/uploads")
async def upload_file(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1].lower() if "." in (file.filename or "") else "bin"
    content_type = file.content_type or MIME_TYPES.get(ext, "application/octet-stream")
    path = f"{APP_NAME}/quotes/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, content_type)
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": now_iso(),
    })
    return {"path": result["path"], "filename": file.filename}


@api_router.get("/files/{path:path}")
async def download_file(path: str, admin: dict = Depends(get_current_admin)):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))


@api_router.post("/quotes")
async def create_quote(body: QuoteRequest):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "new"
    doc["amount_paid"] = 0.0
    doc["created_at"] = now_iso()
    await db.quotes.insert_one(doc)
    doc.pop("_id", None)
    # Owner alert on new quote request
    if OWNER_EMAIL:
        extras = ", ".join(doc.get("extras", [])) or "—"
        inner = (
            f'<h1 style="font-size:22px;margin:0 0 12px">✨ New Glow Quote&trade; request</h1>'
            f'<p style="color:#B0B0C3"><strong style="color:#fff">{escape(doc.get("name",""))}</strong> just submitted a request.</p>'
            f'<p style="color:#B0B0C3">Service: <strong style="color:#fff">{escape(doc.get("service") or doc.get("property_type",""))}</strong><br/>'
            f'Property: {escape(doc.get("property_type",""))} · Size: {escape(doc.get("size","") or "—")}<br/>'
            f'Frequency: {escape(doc.get("frequency","") or "—")} · Photos: {len(doc.get("photo_paths", []))}<br/>'
            f'Extras: {escape(extras)}</p>'
            f'<p style="color:#B0B0C3">Contact: {escape(doc.get("email",""))} · {escape(doc.get("phone",""))} '
            f'(prefers {escape(doc.get("preferred_contact","")) or "any"})</p>'
            f'<p style="color:#B0B0C3">Notes: {escape(doc.get("notes","") or "—")}</p>'
            f'<p style="font-size:12px;color:#8E8EA8">Log in to your admin dashboard to review, price and approve this request.</p>'
        )
        try:
            await send_email(to=OWNER_EMAIL, subject=f"[Garwood Glow] New quote request from {doc.get('name','a client')}", html=_email_shell(inner))
        except Exception as e:
            logger.warning(f"Owner alert email failed: {e}")
    return {"success": True, "id": doc["id"], "message": "Your Glow Quote™ request has been received."}


@api_router.get("/quotes")
async def list_quotes(admin: dict = Depends(get_current_admin), status: Optional[str] = Query(None)):
    query = {}
    if status and status != "all":
        query["status"] = status
    quotes = await db.quotes.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"quotes": quotes}


@api_router.get("/quotes/stats")
async def quote_stats(admin: dict = Depends(get_current_admin)):
    total = await db.quotes.count_documents({})
    new = await db.quotes.count_documents({"status": "new"})
    scheduled = await db.quotes.count_documents({"status": "scheduled"})
    completed = await db.quotes.count_documents({"status": "completed"})
    return {"total": total, "new": new, "scheduled": scheduled, "completed": completed}


class StatusUpdate(BaseModel):
    status: str


@api_router.patch("/quotes/{quote_id}")
async def update_quote(quote_id: str, body: StatusUpdate, admin: dict = Depends(get_current_admin)):
    res = await db.quotes.update_one({"id": quote_id}, {"$set": {"status": body.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"success": True}


# ---------------------------------------------------------------------------
# Newsletter
# ---------------------------------------------------------------------------
class NewsletterSignup(BaseModel):
    email: EmailStr


@api_router.post("/newsletter")
async def newsletter(body: NewsletterSignup):
    await db.newsletter.update_one(
        {"email": body.email.lower()},
        {"$set": {"email": body.email.lower(), "created_at": now_iso()}},
        upsert=True,
    )
    return {"success": True}


# ---------------------------------------------------------------------------
# Email (Emergent managed Resend)
# ---------------------------------------------------------------------------
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Garwood Glow JA")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str) -> Optional[str]:
    if not EMAIL_KEY:
        logger.warning("Email not configured; skipping send")
        return None
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if EMAIL_REPLY_TO:
        payload["contact_email"] = EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:
        logger.error(f"Email send error: {e}")
        return None


def _email_shell(inner: str) -> str:
    return (
        '<table role="presentation" width="100%" style="background:#0A0A0C;padding:32px 0">'
        '<tr><td align="center">'
        '<table role="presentation" width="520" style="background:#121217;border-radius:16px;'
        'font-family:Arial,Helvetica,sans-serif;color:#ffffff;overflow:hidden">'
        '<tr><td style="padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.1)">'
        '<span style="font-size:20px;font-weight:700;color:#ffffff">Garwood <span style="color:#B87CF8">Glow</span> JA</span>'
        '</td></tr>'
        f'<tr><td style="padding:32px">{inner}</td></tr>'
        '<tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.1);'
        'font-size:12px;color:#8E8EA8">Sent by Garwood Glow JA. We never ask for your password '
        'or card details by email. Leaving Every Space Glowing.</td></tr>'
        '</table></td></tr></table>'
    )


def _btn(url: str, label: str) -> str:
    return (f'<a href="{escape(url)}" style="display:inline-block;background:#8B2FC9;color:#ffffff;'
            f'text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600">{escape(label)}</a>')



PAYPAL_MODE = (os.environ.get("PAYPAL_MODE") or "sandbox").strip() or "sandbox"
PAYPAL_CLIENT_ID = (os.environ.get("PAYPAL_CLIENT_ID") or "").strip()
PAYPAL_SECRET = (os.environ.get("PAYPAL_SECRET") or "").strip()
PAYPAL_BASE = "https://api-m.paypal.com" if PAYPAL_MODE == "live" else "https://api-m.sandbox.paypal.com"
JMD_PER_USD = 158.0
DEPOSIT_PCT = 0.5
OWNER_EMAIL = os.environ.get("ADMIN_EMAIL", "")

_jmd_cache = {"rate": JMD_PER_USD, "ts": 0.0}


async def get_jmd_rate() -> float:
    import time
    now = time.time()
    if now - _jmd_cache["ts"] < 21600 and _jmd_cache["ts"] > 0:
        return _jmd_cache["rate"]
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get("https://open.er-api.com/v6/latest/USD")
        resp.raise_for_status()
        rate = float(resp.json()["rates"]["JMD"])
        if rate > 0:
            _jmd_cache["rate"] = round(rate, 2)
            _jmd_cache["ts"] = now
    except Exception as e:
        logger.warning(f"JMD rate fetch failed, using {_jmd_cache['rate']}: {e}")
    return _jmd_cache["rate"]


def paypal_configured() -> bool:
    return bool(PAYPAL_CLIENT_ID and PAYPAL_SECRET)


def paypal_token() -> str:
    r = requests.post(
        f"{PAYPAL_BASE}/v1/oauth2/token",
        auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET),
        data={"grant_type": "client_credentials"},
        headers={"Accept": "application/json"},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["access_token"]


def _fmt_money(usd: float) -> str:
    jmd = usd * _jmd_cache["rate"]
    return f"USD ${usd:,.2f} (~JMD ${jmd:,.0f})"


class ApproveRequest(BaseModel):
    amount: float
    base_url: str = ""
    allow_deposit: bool = True
    deposit_percent: float = 50.0


class CaptureRequest(BaseModel):
    order_id: str


def _sanitize_base(url: str) -> str:
    url = (url or "").strip().rstrip("/")
    if url.startswith("https://") and (urlparse(url).hostname or ""):
        return url
    return ""


@api_router.post("/quotes/{quote_id}/approve")
async def approve_quote(quote_id: str, body: ApproveRequest, admin: dict = Depends(get_current_admin)):
    q = await db.quotes.find_one({"id": quote_id})
    if not q:
        raise HTTPException(status_code=404, detail="Quote not found")
    await get_jmd_rate()
    price = round(body.amount, 2)
    dep_pct = min(99.0, max(1.0, body.deposit_percent)) / 100.0
    await db.quotes.update_one(
        {"id": quote_id},
        {"$set": {"status": "approved", "price": price, "currency": "USD",
                  "allow_deposit": body.allow_deposit, "deposit_pct": dep_pct,
                  "amount_paid": q.get("amount_paid", 0.0),
                  "paid": False, "approved_at": now_iso()}},
    )
    base = _sanitize_base(body.base_url)
    if base and q.get("email"):
        link = f"{base}/pay/{quote_id}"
        deposit_line = ""
        if body.allow_deposit:
            deposit_line = f'<p style="color:#B0B0C3">You can pay a {int(dep_pct*100)}% deposit now and settle the balance after your clean, or pay in full.</p>'
        inner = (
            f'<h1 style="font-size:22px;margin:0 0 12px">Your Glow Quote&trade; is approved</h1>'
            f'<p style="color:#B0B0C3">Hi {escape(q.get("name","there").split(" ")[0])}, thank you for choosing Garwood Glow JA.</p>'
            f'<p style="color:#B0B0C3">Service: <strong style="color:#fff">{escape(q.get("service") or q.get("property_type",""))}</strong><br/>'
            f'Total: <strong style="color:#fff">{_fmt_money(price)}</strong></p>'
            f'{deposit_line}'
            f'<p style="margin:24px 0">{_btn(link, "Pay Securely Online")}</p>'
            f'<p style="font-size:12px;color:#8E8EA8">Or open this link: {escape(link)}</p>'
        )
        await send_email(to=q["email"], subject="Your Garwood Glow JA quote is approved — Pay Now", html=_email_shell(inner))
    return {"success": True}


@api_router.get("/pay/{quote_id}")
async def payment_summary(quote_id: str):
    q = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not q:
        raise HTTPException(status_code=404, detail="Request not found")
    price = q.get("price")
    paid_amt = round(q.get("amount_paid", 0.0), 2)
    remaining = round((price or 0) - paid_amt, 2) if price is not None else None
    dep_pct = q.get("deposit_pct", DEPOSIT_PCT)
    rate = await get_jmd_rate()
    return {
        "id": q["id"],
        "name": q.get("name", ""),
        "service": q.get("service") or q.get("property_type", "Cleaning Service"),
        "amount": price,
        "currency": "USD",
        "amount_paid": paid_amt,
        "remaining": remaining,
        "allow_deposit": bool(q.get("allow_deposit", True)),
        "deposit_percent": round(dep_pct * 100),
        "deposit_amount": round(price * dep_pct, 2) if price else None,
        "jmd_rate": rate,
        "status": q.get("status"),
        "paid": bool(q.get("paid")),
    }


@api_router.get("/paypal/config")
async def paypal_config():
    rate = await get_jmd_rate()
    return {"configured": paypal_configured(), "client_id": PAYPAL_CLIENT_ID, "mode": PAYPAL_MODE, "jmd_rate": rate}


@api_router.post("/payments/{quote_id}/create-order")
async def create_payment_order(quote_id: str, mode: str = Query("full")):
    if not paypal_configured():
        raise HTTPException(status_code=503, detail="PayPal is not configured yet.")
    q = await db.quotes.find_one({"id": quote_id})
    if not q:
        raise HTTPException(status_code=404, detail="Request not found")
    price = q.get("price")
    if not price:
        raise HTTPException(status_code=400, detail="This quote has not been approved for payment yet.")
    paid_amt = round(q.get("amount_paid", 0.0), 2)
    remaining = round(price - paid_amt, 2)
    if remaining <= 0:
        raise HTTPException(status_code=400, detail="This quote has already been paid in full.")
    dep_pct = q.get("deposit_pct", DEPOSIT_PCT)
    if mode == "deposit" and paid_amt == 0 and q.get("allow_deposit", True):
        charge = round(price * dep_pct, 2)
    else:
        charge = remaining
    token = paypal_token()
    r = requests.post(
        f"{PAYPAL_BASE}/v2/checkout/orders",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={
            "intent": "CAPTURE",
            "purchase_units": [{
                "reference_id": quote_id,
                "description": f"Garwood Glow JA — {q.get('service') or 'Cleaning Service'}",
                "amount": {"currency_code": "USD", "value": f"{charge:.2f}"},
            }],
        },
        timeout=30,
    )
    r.raise_for_status()
    return {"id": r.json()["id"], "charge": charge}


@api_router.post("/payments/{quote_id}/capture")
async def capture_payment(quote_id: str, body: CaptureRequest):
    if not paypal_configured():
        raise HTTPException(status_code=503, detail="PayPal is not configured yet.")
    token = paypal_token()
    r = requests.post(
        f"{PAYPAL_BASE}/v2/checkout/orders/{body.order_id}/capture",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        timeout=30,
    )
    r.raise_for_status()
    data = r.json()
    status = data.get("status")
    if status == "COMPLETED":
        q = await db.quotes.find_one({"id": quote_id})
        cap = data["purchase_units"][0]["payments"]["captures"][0]
        captured = float(cap["amount"]["value"])
        price = float(q.get("price") or 0)
        new_paid = round(float(q.get("amount_paid", 0.0)) + captured, 2)
        fully_paid = new_paid + 0.01 >= price
        await db.quotes.update_one(
            {"id": quote_id},
            {"$set": {"amount_paid": new_paid, "paid": fully_paid,
                      "status": "paid" if fully_paid else "deposit-paid",
                      "paid_at": now_iso()}},
        )
        await db.payments.insert_one({
            "id": str(uuid.uuid4()), "quote_id": quote_id, "order_id": body.order_id,
            "capture_id": cap["id"], "amount": cap["amount"]["value"],
            "currency": cap["amount"]["currency_code"], "status": status, "created_at": now_iso(),
        })
        await get_jmd_rate()
        remaining = round(price - new_paid, 2)
        # Receipt email to client
        if q and q.get("email"):
            if fully_paid:
                bal_line = '<p style="color:#B0B0C3">Your payment is complete. Thank you!</p>'
            else:
                bal_line = f'<p style="color:#B0B0C3">Deposit received. Remaining balance: <strong style="color:#fff">{_fmt_money(remaining)}</strong>, payable after your clean.</p>'
            inner = (
                f'<h1 style="font-size:22px;margin:0 0 12px">Payment received &mdash; thank you!</h1>'
                f'<p style="color:#B0B0C3">Hi {escape(q.get("name","there").split(" ")[0])}, we&rsquo;ve received your payment of <strong style="color:#fff">{_fmt_money(captured)}</strong> for {escape(q.get("service") or "your cleaning service")}.</p>'
                f'{bal_line}'
                f'<p style="font-size:12px;color:#8E8EA8">Receipt ID: {escape(cap["id"])}</p>'
            )
            await send_email(to=q["email"], subject="Your Garwood Glow JA payment receipt", html=_email_shell(inner))
        # Owner alert on payment
        if OWNER_EMAIL:
            kind = "Full payment" if fully_paid else "Deposit"
            inner = (
                f'<h1 style="font-size:22px;margin:0 0 12px">💰 {kind} received</h1>'
                f'<p style="color:#B0B0C3"><strong style="color:#fff">{escape(q.get("name",""))}</strong> just paid <strong style="color:#fff">{_fmt_money(captured)}</strong> for {escape(q.get("service") or "a cleaning service")}.</p>'
                f'<p style="color:#B0B0C3">Total: {_fmt_money(price)}<br/>Paid so far: {_fmt_money(new_paid)}<br/>Balance: {_fmt_money(remaining)}</p>'
                f'<p style="color:#B0B0C3">Contact: {escape(q.get("email",""))} · {escape(q.get("phone",""))}</p>'
            )
            await send_email(to=OWNER_EMAIL, subject=f"[Garwood Glow] {kind} received from {q.get('name','a client')}", html=_email_shell(inner))
    return {"status": status}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Garwood Glow Admin",
            "role": "admin",
            "created_at": now_iso(),
        })
        logger.info("Seeded admin user")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Updated admin password")
    try:
        await db.users.create_index("email", unique=True)
    except Exception:
        pass
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
