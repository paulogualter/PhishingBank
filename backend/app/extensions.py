"""
Phishing Bank - Extensões Flask
"""
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()
redis_client = None


class _FakeRedis:
    """Fallback quando Redis não disponível (local dev)"""
    def __init__(self):
        self._store = {}
    def get(self, key):
        return self._store.get(key)
    def set(self, key, val, ex=None):
        self._store[key] = val
    def sadd(self, key, val):
        if key not in self._store:
            self._store[key] = set()
        self._store[key].add(val)
    def hset(self, key, field, val):
        if key not in self._store:
            self._store[key] = {}
        self._store[key][field] = val


def init_extensions(app):
    global redis_client
    
    db.init_app(app)
    jwt.init_app(app)
    
    # VULN-38: CORS amplo para dev
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5001"], supports_credentials=True)
    
    try:
        import redis
        redis_client = redis.from_url(app.config["REDIS_URL"])
    except Exception:
        redis_client = _FakeRedis()
    
    import app.extensions as ext_module
    ext_module.redis_client = redis_client
    app.extensions["redis"] = redis_client
    
    with app.app_context():
        db.create_all()
