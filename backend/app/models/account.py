"""
Phishing Bank - Model Account (Conta Corrente)
"""
from app.extensions import db
from datetime import datetime


class Account(db.Model):
    __tablename__ = "accounts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    agency = db.Column(db.String(10), default="0001")
    number = db.Column(db.String(20), unique=True, nullable=False)
    balance = db.Column(db.Float, default=0.0)
    account_type = db.Column(db.String(50), default="corrente")
    pix_limit = db.Column(db.Float, default=5000.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


    def to_dict(self):
        return {
            "id": self.id,
            "agency": self.agency,
            "number": self.number,
            "balance": self.balance,
            "account_type": self.account_type,
            "pix_limit": self.pix_limit,
        }
