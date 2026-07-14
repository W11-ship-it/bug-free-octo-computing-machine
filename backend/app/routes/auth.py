"""用户认证路由：注册 / 登录"""

from flask import Blueprint, request, jsonify, current_app
import jwt
import hashlib
import logging
from datetime import datetime, timedelta
from supabase import create_client
import urllib.parse

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)


def hash_password(password):
    """简单的密码哈希（生产环境建议使用 bcrypt）"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def get_supabase():
    """获取 Supabase 客户端（使用 service key）"""
    url = current_app.config['SUPABASE_URL']
    key = current_app.config['SUPABASE_SERVICE_KEY'] or current_app.config['SUPABASE_KEY']
    
    parsed_url = urllib.parse.urlparse(url)
    if parsed_url.hostname:
        base_url = f"{parsed_url.scheme}://{parsed_url.hostname}"
    else:
        base_url = url
    
    return create_client(base_url, key)


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
        
        try:
            result = supabase.table('users').select('id').eq('username', username).execute()
            
            if result.data and len(result.data) > 0:
                return jsonify({"error": "用户名已存在"}), 409

            insert_result = supabase.table('users').insert({
                'username': username,
                'password_hash': hash_password(password)
            }).execute()
            
            if insert_result.data and len(insert_result.data) > 0:
                user_id = insert_result.data[0]['id']
                logger.info(f"新用户注册成功: {username}, ID: {user_id}")
                return jsonify({"message": "注册成功", "user_id": user_id}), 201
            else:
                return jsonify({"error": "注册失败"}), 500
                
        except Exception as e:
            logger.error(f"数据库错误: {str(e)}")
            return jsonify({"error": f"注册失败: {str(e)}"}), 500
    
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
        
        try:
            result = supabase.table('users').select('id', 'username', 'password_hash').eq('username', username).execute()
            
            if not result.data or len(result.data) == 0:
                return jsonify({"error": "用户名或密码错误"}), 401

            user = result.data[0]
            user_id = user['id']
            db_username = user['username']
            password_hash = user['password_hash']
            
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
            
        except Exception as e:
            logger.error(f"数据库错误: {str(e)}")
            return jsonify({"error": f"登录失败: {str(e)}"}), 500
    
    except Exception as e:
        logger.error(f"登录失败: {str(e)}", exc_info=True)
        return jsonify({"error": f"登录失败: {str(e)}"}), 500