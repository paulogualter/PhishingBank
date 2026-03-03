"""API v2 - Vulnerabilidades moderadas"""
from flask import Blueprint

bp = Blueprint("api_v2", __name__)

from app.api.v2 import auth, accounts
