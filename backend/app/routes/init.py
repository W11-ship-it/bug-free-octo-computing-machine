"""数据库初始化路由：创建必要的表"""

from flask import Blueprint, jsonify, current_app
import os
from supabase import create_client

init_bp = Blueprint('init', __name__)


@init_bp.route('/db', methods=['POST'])
def init_database():
    """初始化数据库表"""
    try:
        supabase_url = current_app.config['SUPABASE_URL']
        service_key = current_app.config['SUPABASE_SERVICE_KEY']
        
        supabase = create_client(supabase_url, service_key)
        
        sql_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database.sql')
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        sql_statements = [s.strip() for s in sql_content.split(';') if s.strip()]
        
        for stmt in sql_statements:
            supabase.sql(stmt).execute()
        
        return jsonify({"message": "数据库初始化成功"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500