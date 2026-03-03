"""
GraphQL - VULN-14/47/48/49/50
Introspection aberta, sem depth limit, batching, alias overload
"""
from flask import Blueprint


def register_graphql(app):
    """Registra endpoint GraphQL"""
    from strawberry.flask.views import GraphQLView
    from app.graphql.schema import schema
    
    app.add_url_rule(
        "/api/graphql",
        view_func=GraphQLView.as_view("graphql", schema=schema),
        methods=["GET", "POST"]
    )
