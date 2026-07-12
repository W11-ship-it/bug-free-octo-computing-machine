"""数据库初始化路由：创建必要的表"""

from flask import Blueprint, jsonify, current_app
import requests

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
        create_plans_sql = """
        CREATE TABLE IF NOT EXISTS plans (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID NOT NULL,
            title VARCHAR(255) NOT NULL,
            type VARCHAR(50) DEFAULT 'daily',
            subject VARCHAR(100) DEFAULT '',
            duration INTEGER DEFAULT 60,
            time TIME WITHOUT TIME ZONE,
            date DATE,
            days TEXT[],
            reminder BOOLEAN DEFAULT FALSE,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
        CREATE INDEX IF NOT EXISTS idx_plans_created_at ON plans(created_at);
        """
        
        url = f"{supabase_url}/sql/v1"
        
        response = requests.post(url, headers=headers, json={
            'query': create_plans_sql,
            'format': 'json'
        })
        
        if response.status_code in [200, 201]:
            return jsonify({"message": "数据库初始化成功"}), 200
        else:
            return jsonify({"error": f"初始化失败: {response.text}"}), 500
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500