from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
from supabase import create_client

load_dotenv()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)
logger = logging.getLogger(__name__)


def ensure_tables():
    """确保数据库表存在"""
    try:
        supabase_url = os.getenv('SUPABASE_URL')
        service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not supabase_url or not service_key:
            logger.warning("未配置Supabase连接信息，跳过表创建")
            return
        
        supabase = create_client(supabase_url, service_key)
        
        sql_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.sql')
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        sql_statements = [s.strip() for s in sql_content.split(';') if s.strip()]
        
        for stmt in sql_statements:
            try:
                supabase.sql(stmt).execute()
            except Exception as e:
                logger.warning(f"执行SQL语句失败: {e}")
        
        logger.info("数据库表检查/创建完成")
    except Exception as e:
        logger.error(f"数据库初始化失败: {e}")


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

    ensure_tables()
    
    logger.info("StudyHub 后端服务启动成功")
    return app
