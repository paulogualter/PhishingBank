"""
Phishing Bank - Model Transaction
VULN-20/32: UUID v1 previsível - IDOR proposital
"""
from app.extensions import db
from datetime import datetime
import uuid


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    # VULN-20/32: UUID v1 (timestamp-based) previsível para IDOR
    uuid = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid1()))
    account_from_id = db.Column(db.Integer, db.ForeignKey("accounts.id"))
    account_to_id = db.Column(db.Integer, db.ForeignKey("accounts.id"))
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(50), default="pix")  # pix, ted, doc, boleto, debit
    # VULN-25: observacao sem sanitização - Stored XSS
    observacao = db.Column(db.Text)
    status = db.Column(db.String(50), default="completed")
    pix_key = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    account_from = db.relationship("Account", foreign_keys=[account_from_id])
    account_to = db.relationship("Account", foreign_keys=[account_to_id])

    def to_dict(self):
        return {
            "id": self.id,
            "uuid": self.uuid,
            "amount": self.amount,
            "type": self.type,
            "observacao": self.observacao,  # VULN-25: Retornado sem sanitizar
            "status": self.status,
            "pix_key": self.pix_key,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
