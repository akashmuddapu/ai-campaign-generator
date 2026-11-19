from flask import Flask
from flask_cors import CORS
from flask_session import Session
from .config import Config


def create_app(config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if config:
        app.config.update(config)

    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
    Session(app)

    from .routes.auth_routes import auth_bp
    from .routes.preset_routes import preset_bp
    from .routes.campaign_routes import campaign_bp
    from .routes.report_card_routes import report_card_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(preset_bp, url_prefix="/api")
    app.register_blueprint(campaign_bp, url_prefix="/api/campaigns")
    app.register_blueprint(report_card_bp, url_prefix="/api/campaigns")

    @app.get("/api/health")
    def health():
        return {"status": "ok", "service": "CampaignGuard AI"}

    return app
