"""
Sistema CTF - Scoreboard
"""
from flask import Blueprint, request, jsonify
from flask import current_app

bp = Blueprint("scoreboard", __name__)


@bp.route("", methods=["GET"])
def get_scoreboard():
    """Ranking público"""
    # Simplificado - em produção usaria estrutura Redis
    return jsonify({
        "ranking": [],
        "message": "Submeta flags em POST /scoreboard/submit"
    })


@bp.route("/submit", methods=["POST"])
def submit_flag():
    """Submeter flag do CTF"""
    data = request.get_json() or {}
    flag = data.get("flag", "")
    user = data.get("user", "anonymous")
    
    # Validar contra flags conhecidas
    from app.challenges.flags import FLAGS
    if flag in FLAGS:
        redis_client = current_app.extensions.get("redis")
        if redis_client:
            redis_client.sadd("ctf:flags_found", flag)
            redis_client.hset("ctf:user_flags", user, flag)
        return jsonify({"success": True, "message": "Flag correta!", "points": FLAGS.get(flag, {}).get("points", 100)})
    
    return jsonify({"success": False, "message": "Flag inválida"}), 400
