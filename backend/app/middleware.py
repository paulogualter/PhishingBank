"""
VULN-42: HTTP Verb Tampering via X-HTTP-Method-Override
VULN-60: X-API-Version bypass de controles
"""
from flask import request, g


def init_middleware(app):
    @app.before_request
    def verb_tampering():
        """VULN-42: Aplica method override ANTES da rota - bypass de auth em DELETE"""
        override = (
            request.headers.get("X-HTTP-Method-Override") or
            request.headers.get("X-Method-Override") or
            request.headers.get("X-HTTP-Method") or
            request.args.get("_method")
        )
        if override:
            request.environ["REQUEST_METHOD"] = override.upper()

    @app.before_request
    def api_version_bypass():
        """VULN-60: Versões legacy sem 2FA/audit"""
        version = request.headers.get("X-API-Version", "v3")
        g.api_version = version
        if version in ("v1", "v0", "beta", "legacy"):
            g.skip_2fa = True  # Bypass simulado
