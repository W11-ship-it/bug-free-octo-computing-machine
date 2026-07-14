"""用户认证路由：注册 / 登录"""

from flask import Blueprint, request, jsonify, current_app
import jwt
import hashlib
import logging
from datetime import datetime, timedelta
from app.utils import get_supabase

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)


def hash_password(password):
    """简单的密码哈希（生产环境建议使用 bcrypt）"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


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

        supabase = get_supabase()

        # 检查用户名是否已存在
        logger.info(f"检查用户名是否存在: {username}")
        existing = supabase.table('users').select('id').eq('username', username).execute()
        logger.info(f"查询结果: {existing}")
        
        if existing.data:
            logger.info(f"用户名已存在: {username}")
            return jsonify({"error": "用户名已存在"}), 409

        # 创建用户
        logger.info(f"创建新用户: {username}")
        result = supabase.table('users').insert({
            "username": username,
            "password_hash": hash_password(password),
        }).execute()
        logger.info(f"创建结果: {result}")

        logger.info(f"新用户注册成功: {username}")
        return jsonify({"message": "注册成功", "user_id": result.data[0]['id']}), 201
    
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

        supabase = get_supabase()

        # 查询用户
        logger.info(f"查询用户: {username}")
        result = supabase.table('users').select('*').eq('username', username).execute()
        logger.info(f"查询结果: {result}")
        
        if not result.data:
            logger.info(f"用户不存在: {username}")
            return jsonify({"error": "用户名或密码错误"}), 401

        user = result.data[0]
        logger.info(f"找到用户: {user}")
        
        if user['password_hash'] != hash_password(password):
            logger.info(f"密码不匹配: {username}")
            return jsonify({"error": "用户名或密码错误"}), 401

        # 生成 JWT
        token = jwt.encode(
            {
                "user_id": user['id'],
                "username": user['username'],
                "exp": datetime.utcnow() + timedelta(days=7),
            },
            current_app.config['SECRET_KEY'],
            algorithm='HS256',
        )

        logger.info(f"用户登录成功: {username}")
        return jsonify({"token": token, "username": user['username']})
    
    except Exception as e:
        logger.error(f"登录失败: {str(e)}", exc_info=True)
        return jsonify({"error": f"登录失败: {str(e)}"}), 500
