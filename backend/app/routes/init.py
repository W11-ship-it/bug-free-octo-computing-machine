"""数据库初始化路由：创建必要的表"""

from flask import Blueprint, jsonify, current_app
import requests
import os

init_bp = Blueprint('init', __name__)


@init_bp.route('/db', methods=['POST'])
def init_database():
    """初始化数据库表"""
    supabase_url = current_app.config['SUPABASE_URL']
    service_key = current_app.config['SUPABASE_SERVICE_KEY']
    
    headers = {
        'Authorization': f'Bearer {service_key}',
        'apikey': service_key,
        'Content-Type': 'application/json',
    }
    
    try:
        sql_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database.sql')
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        project_ref = supabase_url.replace('https://', '').replace('.supabase.co', '')
        url = f"https://api.supabase.com/v1/projects/{project_ref}/database/query"
        
        response = requests.post(url, headers=headers, json={
            'query': sql_content,
            'format': 'json'
        })
        
        if response.status_code in [200, 201, 202, 204]:
            return jsonify({"message": "数据库初始化成功"}), 200
        else:
            return jsonify({"error": f"初始化失败: {response.text}"}), 500
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500