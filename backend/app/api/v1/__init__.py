"""
VULN-40: Shadow API v1 - SEM autenticação proposital
API legada "esquecida" mas ainda registrada
"""
from flask import Blueprint

bp = Blueprint("api_v1", __name__)

from app.api.v1 import auth, transfer
