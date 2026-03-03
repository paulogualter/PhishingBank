"""
VULN-28: Debug endpoints ativos em produção
Simula Spring Boot Actuator
"""
from flask import Blueprint, jsonify, Response
import os

bp = Blueprint("actuator", __name__)


@bp.route("/env", methods=["GET"])
def env():
    """VULN-28: Expõe todas as variáveis de ambiente"""
    env_vars = dict(os.environ)
    return jsonify(env_vars)


@bp.route("/heapdump", methods=["GET"])
def heapdump():
    """VULN-28: Retorna heap dump fake com strings de credenciais"""
    fake_heap = b"Binary heap dump with fake credentials: MYSQL_PASSWORD=bank123 JWT_SECRET=bank@2024"
    return Response(fake_heap, mimetype="application/octet-stream")


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "UP"})


@bp.route("/vars", methods=["GET"])
def debug_vars():
    """VULN-28: Expõe variáveis internas"""
    from flask import current_app
    return jsonify({
        "config_keys": list(current_app.config.keys()),
        "secret_key_set": bool(current_app.config.get("SECRET_KEY")),
    })
