import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config
from backend.database import init_db, get_db

# Blueprints
from backend.routes.auth_routes import auth_bp
from backend.routes.dashboard_routes import dashboard_bp
from backend.routes.feedback_routes import feedback_bp
from backend.routes.analysis_routes import analysis_bp
from backend.routes.insights_routes import insights_bp
from backend.routes.recommendation_routes import recommendations_bp
from backend.routes.issue_routes import issues_bp
from backend.routes.report_routes import reports_bp
from backend.routes.adaption_routes import adaption_bp
from backend.routes.ask_routes import ask_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend clients
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize Database
    with app.app_context():
        init_db()

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(feedback_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(insights_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(issues_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(adaption_bp)
    app.register_blueprint(ask_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "InsightFlow Backend API",
            "version": "1.0.0",
            "environment": "production-ready"
        })

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db = get_db()
        db.remove()

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
