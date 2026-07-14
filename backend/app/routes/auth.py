"""用户认证路由：注册 / 登录"""

from flask import Blueprint, request, jsonify, current_app
import jwt
import hashlib
import logging
from datetime import datetime, timedelta
import psycopg2
import urllib.parse

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)


def hash_password(password):
    """简单的密码哈希（生产环境建议使用 bcrypt）"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def get_db_connection():
    """获取数据库连接"""
    supabase_url = current_app.config['SUPABASE_URL']
    service_key = current_app.config['SUPABASE_SERVICE_KEY']
    
    parsed_url = urllib.parse.urlparse(supabase_url)
    host = parsed_url.hostname or supabase_url.replace('https://', '').replace('http://', '').split('/')[0]
    
    conn = psycopg2.connect(
        host=host,
        database="postgres",
        user="postgres",
        password=service_key,
        port=5432,
        sslmode='require'
    )
    return conn


@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username or not password:
            return jsonify({"error": "用户名和密码不能为空"}), 400

        if len(password) < 6:
            return jsonify({"error": "密码长度不能少于6位"}), 400

        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            existing = cursor.fetchone()
            
            if existing:
                return jsonify({"error": "用户名已存在"}), 409

            cursor.execute(
                "INSERT INTO users (username, password_hash) VALUES (%s, %s) RETURNING id",
                (username, hash_password(password))
            )
            user_id = cursor.fetchone()[0]
            conn.commit()

            logger.info(f"新用户注册成功: {username}, ID: {user_id}")
            return jsonify({"message": "注册成功", "user_id": user_id}), 201
        except psycopg2.Error as e:
            if conn:
                conn.rollback()
            logger.error(f"数据库错误: {str(e)}")
            return jsonify({"error": f"注册失败: {str(e)}"}), 500
        finally:
            if conn:
                conn.close()
    
    except Exception as e:
        logger.error(f"注册失败: {str(e)}", exc_info=True)
        return jsonify({"error": f"注册失败: {str(e)}"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username or not password:
            return jsonify({"error": "用户名和密码不能为空"}), 400

        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT id, username, password_hash FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({"error": "用户名或密码错误"}), 401

            user_id, db_username, password_hash = user
            
            if password_hash != hash_password(password):
                return jsonify({"error": "用户名或密码错误"}), 401

            token = jwt.encode(
                {
                    "user_id": user_id,
                    "username": db_username,
                    "exp": datetime.utcnow() + timedelta(days=7),
                },
                current_app.config['SECRET_KEY'],
                algorithm='HS256',
            )

            logger.info(f"用户登录成功: {db_username}")
            return jsonify({"token": token, "username": db_username})
        except psycopg2.Error as e:
            logger.error(f"数据库错误: {str(e)}")
            return jsonify({"error": f"登录失败: {str(e)}"}), 500
        finally:
            if conn:
                conn.close()
    
    except Exception as e:
        logger.error(f"登录失败: {str(e)}", exc_info=True)
        return jsonify({"error": f"登录失败: {str(e)}"}), 500