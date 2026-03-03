"""
VULN-16: JWKS - Chave pública exposta para algorithm confusion
"""
from flask import Blueprint, jsonify

bp = Blueprint("well_known", __name__)


@bp.route("/jwks.json", methods=["GET"])
def jwks():
    """VULN-16: Expõe chave pública para attack de algorithm confusion"""
    return jsonify({
        "keys": [{
            "kty": "RSA",
            "kid": "phishingbank-2024",
            "use": "sig",
            "n": "fake_public_key_for_educational_purposes",
            "e": "AQAB"
        }]
    })
