"""
Phishing Bank - Model User
VULN-34 (BOPLA): Campos sensíveis expostos no response propositalmente
"""
from app.extensions import db
from datetime import datetime
import uuid


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    nome = db.Column(db.String(255), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    telefone = db.Column(db.String(20))
    
    # VULN-34: Campos sensíveis - expostos propositalmente no profile
    password_hash = db.Column(db.String(255), nullable=False)
    pin_hash = db.Column(db.String(255))  # PIN do cartão
    security_answer = db.Column(db.String(255))  # Resposta de segurança
    
    # VULN-21/43: Mass assignment - aceitar role, kyc_status etc
    role = db.Column(db.String(50), default="user")  # user, premium, admin
    kyc_status = db.Column(db.String(50), default="pending")  # pending, approved, rejected
    kyc_level = db.Column(db.Integer, default=0)
    is_verified = db.Column(db.Boolean, default=False)
    
    # VULN-34: Campos internos sensíveis
    fraud_score = db.Column(db.Float, default=0.0)
    internal_credit_limit = db.Column(db.Float, default=5000.0)
    credit_limit = db.Column(db.Float, default=5000.0)  # Público
    
    avatar_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    accounts = db.relationship("Account", backref="user", lazy="dynamic")
    cards = db.relationship("Card", backref="user", lazy="dynamic")

    def to_dict(self, include_sensitive=False):
        """VULN-34: Inclui todos os campos por padrão para BOPLA"""
        d = {
            "id": self.id,
            "uuid": self.uuid,
            "nome": self.nome,
            "cpf": self.cpf,
            "email": self.email,
            "telefone": self.telefone,
            "role": self.role,
            "kyc_status": self.kyc_status,
            "kyc_level": self.kyc_level,
            "is_verified": self.is_verified,
            "credit_limit": self.credit_limit,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        # VULN-34: Expor campos sensíveis propositalmente
        if include_sensitive or True:  # Sempre True = vulnerável
            d.update({
                "password_hash": self.password_hash,
                "pin_hash": self.pin_hash,
                "security_answer": self.security_answer,
                "fraud_score": self.fraud_score,
                "internal_credit_limit": self.internal_credit_limit,
            })
        return d
