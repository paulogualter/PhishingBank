"""API v2 Accounts"""
from app.api.v2 import bp
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Account


@bp.route("/accounts", methods=["GET"])
@jwt_required()
def list_accounts():
    user_id = get_jwt_identity()
    accounts = Account.query.filter_by(user_id=user_id).all()
    return {"accounts": [a.to_dict() for a in accounts]}
