"""学习计划路由：创建/读取/更新/删除计划"""

from flask import Blueprint, request, jsonify
from app.utils import get_supabase, token_required

plans_bp = Blueprint('plans', __name__)


@plans_bp.route('/', methods=['GET'])
@token_required
def get_plans():
    """获取用户的学习计划列表"""
    supabase = get_supabase()
    result = supabase.table('plans').select('*').eq('user_id', request.user_id).order('created_at', desc=True).execute()
    return jsonify({"data": result.data})


@plans_bp.route('/', methods=['POST'])
@token_required
def create_plan():
    """创建学习计划"""
    data = request.get_json()
    title = data.get('title', '').strip()
    plan_type = data.get('type', 'daily')
    subjects = data.get('subjects', [])
    completed = data.get('completed', False)
    
    if not title:
        return jsonify({"error": "计划标题不能为空"}), 400
    
    supabase = get_supabase()
    result = supabase.table('plans').insert({
        "user_id": request.user_id,
        "title": title,
        "type": plan_type,
        "subjects": subjects,
        "completed": completed,
    }).execute()
    
    return jsonify(result.data[0]), 201


@plans_bp.route('/<int:plan_id>', methods=['GET'])
@token_required
def get_plan(plan_id):
    """获取单个学习计划"""
    supabase = get_supabase()
    result = supabase.table('plans').select('*').eq('id', plan_id).eq('user_id', request.user_id).execute()
    
    if not result.data:
        return jsonify({"error": "计划不存在"}), 404
    
    return jsonify(result.data[0])


@plans_bp.route('/<int:plan_id>', methods=['PUT'])
@token_required
def update_plan(plan_id):
    """更新学习计划"""
    data = request.get_json()
    supabase = get_supabase()
    
    result = supabase.table('plans').select('*').eq('id', plan_id).eq('user_id', request.user_id).execute()
    if not result.data:
        return jsonify({"error": "计划不存在"}), 404
    
    update_data = {}
    if 'title' in data:
        update_data['title'] = data['title'].strip()
    if 'type' in data:
        update_data['type'] = data['type']
    if 'subjects' in data:
        update_data['subjects'] = data['subjects']
    if 'completed' in data:
        update_data['completed'] = data['completed']
    
    result = supabase.table('plans').update(update_data).eq('id', plan_id).eq('user_id', request.user_id).execute()
    return jsonify(result.data[0])


@plans_bp.route('/<int:plan_id>', methods=['DELETE'])
@token_required
def delete_plan(plan_id):
    """删除学习计划"""
    supabase = get_supabase()
    
    result = supabase.table('plans').select('*').eq('id', plan_id).eq('user_id', request.user_id).execute()
    if not result.data:
        return jsonify({"error": "计划不存在"}), 404
    
    supabase.table('plans').delete().eq('id', plan_id).eq('user_id', request.user_id).execute()
    return jsonify({"message": "计划删除成功"}), 200