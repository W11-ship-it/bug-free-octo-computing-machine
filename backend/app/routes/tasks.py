"""学习任务路由：CRUD 操作"""

from flask import Blueprint, request, jsonify
import logging
from app.utils import get_supabase, token_required

logger = logging.getLogger(__name__)
tasks_bp = Blueprint('tasks', __name__)


@tasks_bp.route('', methods=['GET'])
@token_required
def list_tasks():
    """获取当前用户的所有任务"""
    supabase = get_supabase()
    result = supabase.table('tasks').select('*').eq('user_id', request.user_id).order('created_at', desc=True).execute()
    return jsonify({"data": result.data})


@tasks_bp.route('/<int:task_id>', methods=['GET'])
@token_required
def get_task(task_id):
    """获取单条任务"""
    supabase = get_supabase()
    result = supabase.table('tasks').select('*').eq('id', task_id).eq('user_id', request.user_id).execute()
    if not result.data:
        return jsonify({"error": "任务不存在"}), 404
    return jsonify({"data": result.data[0]})


@tasks_bp.route('', methods=['POST'])
@token_required
def create_task():
    """创建任务"""
    data = request.get_json()
    title = data.get('title', '').strip()
    priority = data.get('priority', 'medium')
    due_date = data.get('due_date')

    if not title:
        return jsonify({"error": "任务名称不能为空"}), 400

    if priority not in ('high', 'medium', 'low'):
        priority = 'medium'

    supabase = get_supabase()
    result = supabase.table('tasks').insert({
        "user_id": request.user_id,
        "title": title,
        "priority": priority,
        "due_date": due_date,
        "completed": False,
    }).execute()

    logger.info(f"用户 {request.username} 创建任务: {title}")
    return jsonify({"message": "创建成功", "data": result.data[0]}), 201


@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@token_required
def update_task(task_id):
    """更新任务"""
    data = request.get_json()
    update_data = {}
    if 'title' in data:
        update_data['title'] = data['title']
    if 'priority' in data and data['priority'] in ('high', 'medium', 'low'):
        update_data['priority'] = data['priority']
    if 'due_date' in data:
        update_data['due_date'] = data['due_date']
    if 'completed' in data:
        update_data['completed'] = bool(data['completed'])

    if not update_data:
        return jsonify({"error": "没有需要更新的字段"}), 400

    supabase = get_supabase()
    result = supabase.table('tasks').update(update_data).eq('id', task_id).eq('user_id', request.user_id).execute()

    if not result.data:
        return jsonify({"error": "任务不存在或无权修改"}), 404

    logger.info(f"用户 {request.username} 更新任务: {task_id}")
    return jsonify({"message": "更新成功", "data": result.data[0]})


@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(task_id):
    """删除任务"""
    supabase = get_supabase()
    result = supabase.table('tasks').delete().eq('id', task_id).eq('user_id', request.user_id).execute()

    if not result.data:
        return jsonify({"error": "任务不存在或无权删除"}), 404

    logger.info(f"用户 {request.username} 删除任务: {task_id}")
    return jsonify({"message": "删除成功"})
