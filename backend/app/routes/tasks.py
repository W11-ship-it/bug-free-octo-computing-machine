"""学习任务路由：CRUD 操作"""

from flask import Blueprint, request, jsonify
import logging
import sqlite3
import os
from app.utils import get_supabase, token_required
from postgrest.exceptions import APIError

logger = logging.getLogger(__name__)
tasks_bp = Blueprint('tasks', __name__)

def get_sqlite_connection():
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'plans.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_sqlite_tasks_table():
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title VARCHAR(200) NOT NULL,
            priority VARCHAR(10) DEFAULT 'medium',
            due_date TEXT,
            completed BOOLEAN DEFAULT FALSE,
            category VARCHAR(100),
            reminder VARCHAR(20),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_sqlite_tasks_table()

@tasks_bp.route('', methods=['GET'])
@token_required
def list_tasks():
    """获取当前用户的所有任务"""
    supabase = get_supabase()
    try:
        result = supabase.table('tasks').select('*').eq('user_id', request.user_id).order('created_at', desc=True).execute()
        return jsonify({"data": result.data})
    except (APIError, Exception) as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC", (int(request.user_id),))
            rows = cursor.fetchall()
            conn.close()
            data = []
            for row in rows:
                item = dict(row)
                item['completed'] = bool(item['completed'])
                data.append(item)
            return jsonify({"data": data}), 200
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500


@tasks_bp.route('/<int:task_id>', methods=['GET'])
@token_required
def get_task(task_id):
    """获取单条任务"""
    supabase = get_supabase()
    try:
        result = supabase.table('tasks').select('*').eq('id', task_id).eq('user_id', request.user_id).execute()
        if not result.data:
            return jsonify({"error": "任务不存在"}), 404
        return jsonify({"data": result.data[0]})
    except (APIError, Exception) as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, int(request.user_id)))
            row = cursor.fetchone()
            conn.close()
            if row:
                item = dict(row)
                item['completed'] = bool(item['completed'])
                return jsonify({"data": item})
            return jsonify({"error": "任务不存在"}), 404
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500


@tasks_bp.route('', methods=['POST'])
@token_required
def create_task():
    """创建任务"""
    data = request.get_json()
    title = data.get('title', '').strip()
    priority = data.get('priority', 'medium')
    due_date = data.get('due_date')
    category = data.get('category', '')
    reminder = data.get('reminder', '')

    if not title:
        return jsonify({"error": "任务名称不能为空"}), 400

    if priority not in ('high', 'medium', 'low'):
        priority = 'medium'

    supabase = get_supabase()
    try:
        result = supabase.table('tasks').insert({
            "user_id": request.user_id,
            "title": title,
            "priority": priority,
            "due_date": due_date,
            "completed": False,
            "category": category,
            "reminder": reminder,
        }).execute()

        logger.info(f"用户 {request.username} 创建任务: {title}")
        return jsonify({"message": "创建成功", "data": result.data[0]}), 201
    except (APIError, Exception) as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO tasks (user_id, title, priority, due_date, completed, category, reminder)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (int(request.user_id), title, priority, due_date or '', 0, category or '', reminder or ''))
            conn.commit()
            task_id = cursor.lastrowid
            cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                item = dict(row)
                item['completed'] = bool(item['completed'])
                logger.info(f"用户 {request.username} 创建任务: {title}")
                return jsonify({"message": "创建成功", "data": item}), 201
            return jsonify({"error": "创建失败"}), 500
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500


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
    if 'category' in data:
        update_data['category'] = data['category']
    if 'reminder' in data:
        update_data['reminder'] = data['reminder']

    if not update_data:
        return jsonify({"error": "没有需要更新的字段"}), 400

    supabase = get_supabase()
    try:
        result = supabase.table('tasks').update(update_data).eq('id', task_id).eq('user_id', request.user_id).execute()

        if not result.data:
            return jsonify({"error": "任务不存在或无权修改"}), 404

        logger.info(f"用户 {request.username} 更新任务: {task_id}")
        return jsonify({"message": "更新成功", "data": result.data[0]})
    except (APIError, Exception) as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, int(request.user_id)))
            row = cursor.fetchone()
            if not row:
                conn.close()
                return jsonify({"error": "任务不存在或无权修改"}), 404
            
            update_parts = []
            update_values = []
            if 'title' in data:
                update_parts.append("title = ?")
                update_values.append(data['title'])
            if 'priority' in data and data['priority'] in ('high', 'medium', 'low'):
                update_parts.append("priority = ?")
                update_values.append(data['priority'])
            if 'due_date' in data:
                update_parts.append("due_date = ?")
                update_values.append(data['due_date'])
            if 'completed' in data:
                update_parts.append("completed = ?")
                update_values.append(1 if data['completed'] else 0)
            if 'category' in data:
                update_parts.append("category = ?")
                update_values.append(data['category'])
            if 'reminder' in data:
                update_parts.append("reminder = ?")
                update_values.append(data['reminder'])
            
            if update_parts:
                update_values.extend([task_id, int(request.user_id)])
                cursor.execute(f"UPDATE tasks SET {', '.join(update_parts)} WHERE id = ? AND user_id = ?", update_values)
                conn.commit()
            
            cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                item = dict(row)
                item['completed'] = bool(item['completed'])
                logger.info(f"用户 {request.username} 更新任务: {task_id}")
                return jsonify({"message": "更新成功", "data": item})
            return jsonify({"error": "更新失败"}), 500
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500


@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(task_id):
    """删除任务"""
    supabase = get_supabase()
    try:
        result = supabase.table('tasks').delete().eq('id', task_id).eq('user_id', request.user_id).execute()

        if not result.data:
            return jsonify({"error": "任务不存在或无权删除"}), 404

        logger.info(f"用户 {request.username} 删除任务: {task_id}")
        return jsonify({"message": "删除成功"})
    except (APIError, Exception) as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks WHERE id = ? AND user_id = ?", (task_id, int(request.user_id)))
            row = cursor.fetchone()
            if not row:
                conn.close()
                return jsonify({"error": "任务不存在或无权删除"}), 404
            
            cursor.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", (task_id, int(request.user_id)))
            conn.commit()
            conn.close()
            logger.info(f"用户 {request.username} 删除任务: {task_id}")
            return jsonify({"message": "删除成功"})
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500