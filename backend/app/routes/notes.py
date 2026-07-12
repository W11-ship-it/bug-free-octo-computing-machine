"""学习笔记路由：CRUD 操作"""

from flask import Blueprint, request, jsonify
import logging
import sqlite3
import os
from app.utils import get_supabase, token_required
from postgrest.exceptions import APIError

logger = logging.getLogger(__name__)
notes_bp = Blueprint('notes', __name__)

def get_sqlite_connection():
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'plans.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_sqlite_notes_table():
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            subject VARCHAR(50),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_sqlite_notes_table()

@notes_bp.route('', methods=['GET'])
@token_required
def list_notes():
    """获取当前用户的所有笔记"""
    supabase = get_supabase()
    try:
        result = supabase.table('notes').select('*').eq('user_id', request.user_id).order('created_at', desc=True).execute()
        return jsonify({"data": result.data})
    except (APIError, Exception) as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC", (int(request.user_id),))
            rows = cursor.fetchall()
            conn.close()
            return jsonify({"data": [dict(row) for row in rows]}), 200
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500


@notes_bp.route('/<int:note_id>', methods=['GET'])
@token_required
def get_note(note_id):
    """获取单条笔记"""
    supabase = get_supabase()
    try:
        result = supabase.table('notes').select('*').eq('id', note_id).eq('user_id', request.user_id).execute()
        if not result.data:
            return jsonify({"error": "笔记不存在"}), 404
        return jsonify({"data": result.data[0]})
    except (APIError, Exception) as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM notes WHERE id = ? AND user_id = ?", (note_id, int(request.user_id)))
            row = cursor.fetchone()
            conn.close()
            if row:
                return jsonify({"data": dict(row)})
            return jsonify({"error": "笔记不存在"}), 404
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500


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
    try:
        result = supabase.table('notes').insert({
            "user_id": request.user_id,
            "title": title,
            "content": content,
            "subject": subject or None,
        }).execute()

        logger.info(f"用户 {request.username} 创建笔记: {title}")
        return jsonify({"message": "创建成功", "data": result.data[0]}), 201
    except (APIError, Exception) as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO notes (user_id, title, content, subject)
                VALUES (?, ?, ?, ?)
            """, (int(request.user_id), title, content, subject or ''))
            conn.commit()
            note_id = cursor.lastrowid
            cursor.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                logger.info(f"用户 {request.username} 创建笔记: {title}")
                return jsonify({"message": "创建成功", "data": dict(row)}), 201
            return jsonify({"error": "创建失败"}), 500
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500


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
    try:
        result = supabase.table('notes').update(update_data).eq('id', note_id).eq('user_id', request.user_id).execute()

        if not result.data:
            return jsonify({"error": "笔记不存在或无权修改"}), 404

        logger.info(f"用户 {request.username} 更新笔记: {note_id}")
        return jsonify({"message": "更新成功", "data": result.data[0]})
    except (APIError, Exception) as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM notes WHERE id = ? AND user_id = ?", (note_id, int(request.user_id)))
            row = cursor.fetchone()
            if not row:
                conn.close()
                return jsonify({"error": "笔记不存在或无权修改"}), 404
            
            update_parts = []
            update_values = []
            if 'title' in data:
                update_parts.append("title = ?")
                update_values.append(data['title'])
            if 'content' in data:
                update_parts.append("content = ?")
                update_values.append(data['content'])
            if 'subject' in data:
                update_parts.append("subject = ?")
                update_values.append(data['subject'])
            
            if update_parts:
                update_values.extend([note_id, int(request.user_id)])
                cursor.execute(f"UPDATE notes SET {', '.join(update_parts)} WHERE id = ? AND user_id = ?", update_values)
                conn.commit()
            
            cursor.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                logger.info(f"用户 {request.username} 更新笔记: {note_id}")
                return jsonify({"message": "更新成功", "data": dict(row)})
            return jsonify({"error": "更新失败"}), 500
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500


@notes_bp.route('/<int:note_id>', methods=['DELETE'])
@token_required
def delete_note(note_id):
    """删除笔记"""
    supabase = get_supabase()
    try:
        result = supabase.table('notes').delete().eq('id', note_id).eq('user_id', request.user_id).execute()

        if not result.data:
            return jsonify({"error": "笔记不存在或无权删除"}), 404

        logger.info(f"用户 {request.username} 删除笔记: {note_id}")
        return jsonify({"message": "删除成功"})
    except (APIError, Exception) as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM notes WHERE id = ? AND user_id = ?", (note_id, int(request.user_id)))
            row = cursor.fetchone()
            if not row:
                conn.close()
                return jsonify({"error": "笔记不存在或无权删除"}), 404
            
            cursor.execute("DELETE FROM notes WHERE id = ? AND user_id = ?", (note_id, int(request.user_id)))
            conn.commit()
            conn.close()
            logger.info(f"用户 {request.username} 删除笔记: {note_id}")
            return jsonify({"message": "删除成功"})
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500