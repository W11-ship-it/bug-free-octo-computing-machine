"""Supabase 客户端初始化与 JWT 认证中间件"""

import os
import jwt
import logging
from functools import wraps
from flask import request, jsonify, current_app
from supabase import create_client

logger = logging.getLogger(__name__)


def get_supabase():
    """获取 Supabase 客户端（使用 service key，用于后端操作）"""
    url = current_app.config['SUPABASE_URL']
    key = current_app.config['SUPABASE_SERVICE_KEY'] or current_app.config['SUPABASE_KEY']
    return create_client(url, key)


def get_user_supabase(token):
    """使用用户 token 获取 Supabase 客户端（用于 RLS 场景）"""
    url = current_app.config['SUPABASE_URL']
    return create_client(url, token)


def token_required(f):
    """JWT 认证装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({"error": "缺少认证令牌"}), 401

        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            request.user_id = payload['user_id']
            request.username = payload.get('username', '')
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "令牌已过期"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "无效的令牌"}), 401

        return f(*args, **kwargs)
    return decorated
