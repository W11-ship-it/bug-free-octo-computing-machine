"""学习笔记路由：CRUD 操作"""

from flask import Blueprint, request, jsonify
import logging
from app.utils import get_supabase, token_required

logger = logging.getLogger(__name__)
notes_bp = Blueprint('notes', __name__)


@notes_bp.route('', methods=['GET'])
@token_required
def list_notes():
    """获取当前用户的所有笔记"""
    supabase = get_supabase()
    result = supabase.table('notes').select('*').eq('user_id', request.user_id).order('created_at', desc=True).execute()
    return jsonify({"data": result.data})


@notes_bp.route('/<int:note_id>', methods=['GET'])
@token_required
def get_note(note_id):
    """获取单条笔记"""
    supabase = get_supabase()
    result = supabase.table('notes').select('*').eq('id', note_id).eq('user_id', request.user_id).execute()
    if not result.data:
        return jsonify({"error": "笔记不存在"}), 404
    return jsonify({"data": result.data[0]})


@notes_bp.route('', methods=['POST'])
@token_required
def create_note():
    """创建笔记"""
    data = request.get_json()
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    subject = data.get('subject', '').strip()

    if not title or not content:
        return jsonify({"error": "标题和内容不能为空"}), 400

    supabase = get_supabase()
    result = supabase.table('notes').insert({
        "user_id": request.user_id,
        "title": title,
        "content": content,
        "subject": subject or None,
    }).execute()

    logger.info(f"用户 {request.username} 创建笔记: {title}")
    return jsonify({"message": "创建成功", "data": result.data[0]}), 201


@notes_bp.route('/<int:note_id>', methods=['PUT'])
@token_required
def update_note(note_id):
    """更新笔记"""
    data = request.get_json()
    update_data = {}
    if 'title' in data:
        update_data['title'] = data['title']
    if 'content' in data:
        update_data['content'] = data['content']
    if 'subject' in data:
        update_data['subject'] = data['subject']

    if not update_data:
        return jsonify({"error": "没有需要更新的字段"}), 400

    supabase = get_supabase()
    result = supabase.table('notes').update(update_data).eq('id', note_id).eq('user_id', request.user_id).execute()

    if not result.data:
        return jsonify({"error": "笔记不存在或无权修改"}), 404

    logger.info(f"用户 {request.username} 更新笔记: {note_id}")
    return jsonify({"message": "更新成功", "data": result.data[0]})


@notes_bp.route('/<int:note_id>', methods=['DELETE'])
@token_required
def delete_note(note_id):
    """删除笔记"""
    supabase = get_supabase()
    result = supabase.table('notes').delete().eq('id', note_id).eq('user_id', request.user_id).execute()

    if not result.data:
        return jsonify({"error": "笔记不存在或无权删除"}), 404

    logger.info(f"用户 {request.username} 删除笔记: {note_id}")
    return jsonify({"message": "删除成功"})
