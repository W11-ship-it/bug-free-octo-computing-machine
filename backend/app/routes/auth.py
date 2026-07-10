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
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({"error": "用户名和密码不能为空"}), 400

    if len(password) < 6:
        return jsonify({"error": "密码长度不能少于6位"}), 400

    supabase = get_supabase()

    # 检查用户名是否已存在
    existing = supabase.table('users').select('id').eq('username', username).execute()
    if existing.data:
        return jsonify({"error": "用户名已存在"}), 409

    # 创建用户
    result = supabase.table('users').insert({
        "username": username,
        "password_hash": hash_password(password),
    }).execute()

    logger.info(f"新用户注册: {username}")
    return jsonify({"message": "注册成功", "user_id": result.data[0]['id']}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({"error": "用户名和密码不能为空"}), 400

    supabase = get_supabase()

    # 查询用户
    result = supabase.table('users').select('*').eq('username', username).execute()
    if not result.data:
        return jsonify({"error": "用户名或密码错误"}), 401

    user = result.data[0]
    if user['password_hash'] != hash_password(password):
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

    logger.info(f"用户登录: {username}")
    return jsonify({"token": token, "username": user['username']})
