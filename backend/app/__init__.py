from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging

load_dotenv()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)
logger = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'dev-secret-key')
    app.config['SUPABASE_URL'] = os.getenv('SUPABASE_URL')
    app.config['SUPABASE_KEY'] = os.getenv('SUPABASE_KEY')
    app.config['SUPABASE_SERVICE_KEY'] = os.getenv('SUPABASE_SERVICE_KEY')

    # 允许前端跨域访问
    CORS(app, resources={r"/api/*": {"origins": "*", "allow_headers": "*", "methods": "*"}})

    # 注册路由蓝图
    from app.routes.auth import auth_bp
    from app.routes.notes import notes_bp
    from app.routes.tasks import tasks_bp
    from app.routes.plans import plans_bp
    from app.routes.init import init_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(plans_bp, url_prefix='/api/plans')
    app.register_blueprint(init_bp, url_prefix='/api/init')

    # 健康检查
    @app.route('/api/health')
    def health():
        return {"status": "ok", "message": "StudyHub API is running"}

    logger.info("StudyHub 后端服务启动成功")
    return app
