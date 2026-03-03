"""
Phishing Bank - Aplicação Flask
Plataforma educacional com vulnerabilidades intencionais
"""
import os
from flask import Flask

def create_app(config_name=None):
    config_name = config_name or os.getenv("FLASK_ENV", "development")
    app = Flask(__name__)
    
    from app.config import config
    app.config.from_object(config.get(config_name, config["default"]))
    
    from app.extensions import init_extensions
    init_extensions(app)
    
    from app.middleware import init_middleware
    init_middleware(app)
    
    from app.api import register_blueprints
    register_blueprints(app)
    
    try:
        from app.graphql import register_graphql
        register_graphql(app)
    except ImportError:
        pass  # strawberry-graphql opcional
    
    # VULN-44: Error handler expõe stack trace completo proposital
    @app.errorhandler(500)
    def internal_error(error):
        import traceback
        import os
        tb = traceback.format_exc()
        # VULN-44: Incluir variáveis de ambiente no contexto (proposital)
        env_vars = {k: str(v)[:50] for k, v in os.environ.items() if 'PASS' in k or 'SECRET' in k or 'KEY' in k}
        return {
            "error": "Internal Server Error",
            "traceback": tb,
            "env_context": env_vars  # VULN-44: Credential disclosure proposital
        }, 500
    
    return app
