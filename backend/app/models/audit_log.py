"""
Phishing Bank - Model AuditLog
VULN-56: Log injection - observacao logada sem escape proposital
"""
from app.extensions import db
from datetime import datetime


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    action = db.Column(db.String(100))
    # VULN-56: JSON log forging - dados não escapados
    details = db.Column(db.Text)  # JSON com observacao injetável
    ip_address = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
