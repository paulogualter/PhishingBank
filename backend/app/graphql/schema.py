"""
VULN-14: GraphQL com introspection aberta, sem depth limit
VULN-49: Campos sensíveis no schema
"""
import strawberry
from typing import Optional, List


@strawberry.type
class UserType:
    id: int
    nome: str
    email: str
    # VULN-49: Campos sensíveis expostos
    senhaHash: Optional[str] = None
    pinInterno: Optional[str] = None
    scoreAntifraude: Optional[float] = None
    limiteAprovadoInterno: Optional[float] = None


@strawberry.type
class Query:
    @strawberry.field
    def user(self, id: int) -> Optional[UserType]:
        from app.models import User
        u = User.query.get(id)
        if not u:
            return None
        return UserType(
            id=u.id,
            nome=u.nome,
            email=u.email,
            senhaHash=u.password_hash,
            pinInterno=u.pin_hash,
            scoreAntifraude=u.fraud_score,
            limiteAprovadoInterno=u.internal_credit_limit,
        )
    
    @strawberry.field
    def hello(self) -> str:
        return "Phishing Bank GraphQL"


@strawberry.type
class LoginResult:
    success: bool
    token: Optional[str] = None


@strawberry.type
class Mutation:
    @strawberry.mutation
    def login(self, email: str, password: str) -> LoginResult:
        from app.models import User
        from app.auth.jwt_handler import create_access_token
        user = User.query.filter_by(email=email).first()
        if user and user.password_hash == password:
            return LoginResult(success=True, token=create_access_token(user.id))
        return LoginResult(success=False)
    
    @strawberry.mutation
    def verifyOTP(self, code: str) -> bool:
        """VULN-47: Batching permite brute force OTP"""
        return code == "123456"


schema = strawberry.Schema(query=Query, mutation=Mutation)
