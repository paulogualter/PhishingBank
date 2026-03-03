"""
API v3 - Principal com múltiplas vulnerabilidades intencionais
"""
from flask import Blueprint

bp = Blueprint("api_v3", __name__)

from app.api.v3 import auth, accounts, transfer, profile, report
from app.api.v3.upload import register_upload_routes
from app.api.v3.redirects import register_redirect_routes
from app.api.v3.import_ofx import register_ofx_routes
from app.api.v3.address import register_address_routes
from app.api.v3.webhook import register_webhook_routes
from app.api.v3.receipts import register_receipts_routes
from app.api.v3.import_url import register_import_url_routes
from app.api.v3.corporate import register_corporate_routes
from app.api.v3.pix_validate import register_pix_validate_routes

register_upload_routes(bp)
register_redirect_routes(bp)
register_ofx_routes(bp)
register_address_routes(bp)
register_webhook_routes(bp)
register_receipts_routes(bp)
register_import_url_routes(bp)
register_corporate_routes(bp)
register_pix_validate_routes(bp)
