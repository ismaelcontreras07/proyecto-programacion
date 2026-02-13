from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time

from .models import TokenPayload


SECRET_KEY = os.getenv("APP_SECRET_KEY", "change-me-in-production")
PASSWORD_SALT = os.getenv("APP_PASSWORD_SALT", "change-me-password-salt")
ACCESS_TOKEN_TTL_SECONDS = int(os.getenv("APP_ACCESS_TOKEN_TTL_SECONDS", "86400"))


class TokenError(ValueError):
    pass


def hash_password(plain_password: str) -> str:
    payload = f"{PASSWORD_SALT}:{plain_password}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def verify_password(plain_password: str, password_hash: str) -> bool:
    expected_hash = hash_password(plain_password)
    return hmac.compare_digest(expected_hash, password_hash)


def _b64encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def _b64decode(encoded: str) -> bytes:
    padding = "=" * (-len(encoded) % 4)
    return base64.urlsafe_b64decode(f"{encoded}{padding}")


def create_access_token(subject: str, role: str) -> str:
    payload = {
        "sub": subject,
        "role": role,
        "exp": int(time.time()) + ACCESS_TOKEN_TTL_SECONDS,
    }
    payload_segment = _b64encode(
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    )
    signature_segment = _b64encode(
        hmac.new(SECRET_KEY.encode("utf-8"), payload_segment.encode("utf-8"), hashlib.sha256).digest()
    )
    return f"{payload_segment}.{signature_segment}"


def decode_access_token(token: str) -> TokenPayload:
    try:
        payload_segment, signature_segment = token.split(".", 1)
    except ValueError as exc:
        raise TokenError("Invalid token format") from exc

    expected_signature = _b64encode(
        hmac.new(SECRET_KEY.encode("utf-8"), payload_segment.encode("utf-8"), hashlib.sha256).digest()
    )
    if not hmac.compare_digest(expected_signature, signature_segment):
        raise TokenError("Invalid token signature")

    try:
        payload_data = json.loads(_b64decode(payload_segment).decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError) as exc:
        raise TokenError("Malformed token payload") from exc

    payload = TokenPayload.model_validate(payload_data)
    if payload.exp < int(time.time()):
        raise TokenError("Token expired")
    return payload

