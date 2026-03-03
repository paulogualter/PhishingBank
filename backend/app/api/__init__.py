"""
Phishing Bank - API Blueprints
"""
from flask import Blueprint


def register_blueprints(app):
    """Registra todos os blueprints da API"""
    # VULN-40: Shadow API v1 - sem autenticação
    from app.api.v1 import bp as v1_bp
    app.register_blueprint(v1_bp, url_prefix="/api/v1")
    
    from app.api.v2 import bp as v2_bp
    app.register_blueprint(v2_bp, url_prefix="/api/v2")
    
    from app.api.v3 import bp as v3_bp
    app.register_blueprint(v3_bp, url_prefix="/api/v3")
    
    # Admin - VULN-36: Auth fraca
    from app.api.admin import bp as admin_bp
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    
    # Actuator - VULN-28: Debug endpoints
    from app.api.actuator import bp as actuator_bp
    app.register_blueprint(actuator_bp, url_prefix="/actuator")
    
    # JWKS - VULN-16: Chave pública exposta
    from app.api.well_known import bp as well_known_bp
    app.register_blueprint(well_known_bp, url_prefix="/.well-known")
    
    # Partner - VULN-33: API key em query string
    from app.api.partner import bp as partner_bp
    app.register_blueprint(partner_bp, url_prefix="/api/partner")
    
    # Scoreboard CTF
    from app.api.scoreboard import bp as scoreboard_bp
    app.register_blueprint(scoreboard_bp, url_prefix="/scoreboard")
