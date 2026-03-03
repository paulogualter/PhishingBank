"""
Phishing Bank - Model Card
VULN-26: Dados criptografados com AES-ECB proposital
"""
from app.extensions import db
from datetime import datetime


class Card(db.Model):
    __tablename__ = "cards"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    # VULN-26: PAN armazenado com AES-ECB (criptografia fraca)
    pan_encrypted = db.Column(db.LargeBinary)
    last_four = db.Column(db.String(4))
    brand = db.Column(db.String(50), default="Visa")
    expiry_month = db.Column(db.Integer)
    expiry_year = db.Column(db.Integer)
    cvv_encrypted = db.Column(db.LargeBinary)
    status = db.Column(db.String(50), default="active")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "last_four": self.last_four,
            "brand": self.brand,
            "expiry_month": self.expiry_month,
            "expiry_year": self.expiry_year,
            "status": self.status,
            "masked": f"**** **** **** {self.last_four}" if self.last_four else "**** **** **** ****",
        }
