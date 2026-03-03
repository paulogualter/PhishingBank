"""
Phishing Bank - JWT Handler
VULN-16: Algorithm confusion RS256->HS256
VULN-45: JWT alg:none + weak secret proposital
"""
import jwt
from datetime import datetime, timedelta
from flask import current_app


# VULN-45: Aceitar algorithms incluindo "none"
# VULN-16: Aceitar múltiplos algoritmos para confusion attack
JWT_ALGORITHMS = ["HS256", "RS256", "none"]


def create_access_token(identity, extra_claims=None):
    """Cria token JWT com claims"""
    payload = {
        "sub": str(identity),
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=24),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)
    
    return jwt.encode(
        payload,
        current_app.config["JWT_SECRET_KEY"],
        algorithm="HS256"
    )


def create_refresh_token(identity):
    """Cria refresh token"""
    payload = {
        "sub": str(identity),
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=30),
        "type": "refresh",
    }
    return jwt.encode(
        payload,
        current_app.config["JWT_SECRET_KEY"],
        algorithm="HS256"
    )


def decode_token(token):
    """
    VULN-45: Decodifica aceitando alg=none e secret fraco
    VULN-16: Aceita RS256 e HS256 - vulnerável a algorithm confusion
    """
    try:
        # VULN-45: algorithms inclui "none" - permite token forjado
        # VULN-16: Múltiplos algoritmos permitem confusion attack
        payload = jwt.decode(
            token,
            current_app.config["JWT_SECRET_KEY"],
            algorithms=JWT_ALGORITHMS
        )
        return payload
    except jwt.InvalidTokenError:
        return None
