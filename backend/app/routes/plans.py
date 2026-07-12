"""学习计划路由：创建/读取/更新/删除计划"""

from flask import Blueprint, request, jsonify, current_app
from app.utils import get_supabase, token_required
from postgrest.exceptions import APIError
import sqlite3
import os
import json

plans_bp = Blueprint('plans', __name__)

def get_sqlite_connection():
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'plans.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_sqlite_plans_table():
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title VARCHAR(255) NOT NULL,
            type VARCHAR(50) DEFAULT 'daily',
            subject VARCHAR(100) DEFAULT '',
            duration INTEGER DEFAULT 60,
            time TEXT,
            date TEXT,
            days TEXT,
            reminder VARCHAR(20),
            completed BOOLEAN DEFAULT FALSE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_sqlite_plans_table()

@plans_bp.route('', methods=['GET'])
@token_required
def get_plans():
    """获取用户的学习计划列表"""
    supabase = get_supabase()
    try:
        result = supabase.table('plans').select('*').eq('user_id', request.user_id).order('created_at', desc=True).execute()
        return jsonify({"data": result.data})
    except APIError as e:
        if 'PGRST205' in str(e):
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC", (int(request.user_id),))
            rows = cursor.fetchall()
            conn.close()
            data = []
            for row in rows:
                item = dict(row)
                item['days'] = json.loads(item['days']) if item['days'] else []
                item['completed'] = bool(item['completed'])
                data.append(item)
            return jsonify({"data": data}), 200
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC", (int(request.user_id),))
            rows = cursor.fetchall()
            conn.close()
            data = []
            for row in rows:
                item = dict(row)
                item['days'] = json.loads(item['days']) if item['days'] else []
                item['completed'] = bool(item['completed'])
                data.append(item)
            return jsonify({"data": data}), 200
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500


@plans_bp.route('', methods=['POST'])
@token_required
def create_plan():
    """创建学习计划"""
    data = request.get_json()
    title = data.get('title', '').strip()
    plan_type = data.get('type', 'daily')
    subject = data.get('subject', '')
    duration = data.get('duration', 60)
    time = data.get('time', None)
    date = data.get('date', None)
    days = data.get('days', [])
    reminder = data.get('reminder', None)
    completed = data.get('completed', False)
    
    if not title:
        return jsonify({"error": "计划标题不能为空"}), 400
    
    supabase = get_supabase()
    try:
        result = supabase.table('plans').insert({
            "user_id": request.user_id,
            "title": title,
            "type": plan_type,
            "subject": subject,
            "duration": duration,
            "time": time,
            "date": date,
            "days": days,
            "reminder": reminder,
            "completed": completed,
        }).execute()
        return jsonify(result.data[0]), 201
    except APIError as e:
        if 'PGRST205' in str(e):
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO plans (user_id, title, type, subject, duration, time, date, days, reminder, completed)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (int(request.user_id), title, plan_type, subject, duration, time, date, json.dumps(days), reminder, completed))
            conn.commit()
            plan_id = cursor.lastrowid
            cursor.execute("SELECT * FROM plans WHERE id = ?", (plan_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                item = dict(row)
                item['days'] = json.loads(item['days']) if item['days'] else []
                item['completed'] = bool(item['completed'])
                return jsonify(item), 201
            return jsonify({"error": "创建失败"}), 500
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO plans (user_id, title, type, subject, duration, time, date, days, reminder, completed)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (int(request.user_id), title, plan_type, subject, duration, time, date, json.dumps(days), reminder, completed))
            conn.commit()
            plan_id = cursor.lastrowid
            cursor.execute("SELECT * FROM plans WHERE id = ?", (plan_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                item = dict(row)
                item['days'] = json.loads(item['days']) if item['days'] else []
                item['completed'] = bool(item['completed'])
                return jsonify(item), 201
            return jsonify({"error": "创建失败"}), 500
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500


@plans_bp.route('/<int:plan_id>', methods=['GET'])
@token_required
def get_plan(plan_id):
    """获取单个学习计划"""
    supabase = get_supabase()
    try:
        result = supabase.table('plans').select('*').eq('id', plan_id).eq('user_id', request.user_id).execute()
        
        if not result.data:
            return jsonify({"error": "计划不存在"}), 404
        
        return jsonify(result.data[0])
    except APIError as e:
        if 'PGRST205' in str(e):
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM plans WHERE id = ? AND user_id = ?", (plan_id, int(request.user_id)))
            row = cursor.fetchone()
            conn.close()
            if row:
                item = dict(row)
                item['days'] = json.loads(item['days']) if item['days'] else []
                item['completed'] = bool(item['completed'])
                return jsonify(item)
            return jsonify({"error": "计划不存在"}), 404
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM plans WHERE id = ? AND user_id = ?", (plan_id, int(request.user_id)))
            row = cursor.fetchone()
            conn.close()
            if row:
                item = dict(row)
                item['days'] = json.loads(item['days']) if item['days'] else []
                item['completed'] = bool(item['completed'])
                return jsonify(item)
            return jsonify({"error": "计划不存在"}), 404
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500


@plans_bp.route('/<int:plan_id>', methods=['PUT'])
@token_required
def update_plan(plan_id):
    """更新学习计划"""
    data = request.get_json()
    supabase = get_supabase()
    
    try:
        result = supabase.table('plans').select('*').eq('id', plan_id).eq('user_id', request.user_id).execute()
        if not result.data:
            return jsonify({"error": "计划不存在"}), 404
        
        update_data = {}
        if 'title' in data:
            update_data['title'] = data['title'].strip()
        if 'type' in data:
            update_data['type'] = data['type']
        if 'subject' in data:
            update_data['subject'] = data['subject']
        if 'duration' in data:
            update_data['duration'] = data['duration']
        if 'time' in data:
            update_data['time'] = data['time']
        if 'date' in data:
            update_data['date'] = data['date']
        if 'days' in data:
            update_data['days'] = data['days']
        if 'reminder' in data:
            update_data['reminder'] = data['reminder']
        if 'completed' in data:
            update_data['completed'] = data['completed']
        
        result = supabase.table('plans').update(update_data).eq('id', plan_id).eq('user_id', request.user_id).execute()
        return jsonify(result.data[0])
    except APIError as e:
        if 'PGRST205' in str(e):
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM plans WHERE id = ? AND user_id = ?", (plan_id, int(request.user_id)))
            row = cursor.fetchone()
            if not row:
                conn.close()
                return jsonify({"error": "计划不存在"}), 404
            
            update_parts = []
            update_values = []
            if 'title' in data:
                update_parts.append("title = ?")
                update_values.append(data['title'].strip())
            if 'type' in data:
                update_parts.append("type = ?")
                update_values.append(data['type'])
            if 'subject' in data:
                update_parts.append("subject = ?")
                update_values.append(data['subject'])
            if 'duration' in data:
                update_parts.append("duration = ?")
                update_values.append(data['duration'])
            if 'time' in data:
                update_parts.append("time = ?")
                update_values.append(data['time'])
            if 'date' in data:
                update_parts.append("date = ?")
                update_values.append(data['date'])
            if 'days' in data:
                update_parts.append("days = ?")
                update_values.append(json.dumps(data['days']))
            if 'reminder' in data:
                update_parts.append("reminder = ?")
                update_values.append(data['reminder'])
            if 'completed' in data:
                update_parts.append("completed = ?")
                update_values.append(1 if data['completed'] else 0)
            
            if update_parts:
                update_values.extend([plan_id, int(request.user_id)])
                cursor.execute(f"UPDATE plans SET {', '.join(update_parts)} WHERE id = ? AND user_id = ?", update_values)
                conn.commit()
            
            cursor.execute("SELECT * FROM plans WHERE id = ?", (plan_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                item = dict(row)
                item['days'] = json.loads(item['days']) if item['days'] else []
                item['completed'] = bool(item['completed'])
                return jsonify(item)
            return jsonify({"error": "更新失败"}), 500
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM plans WHERE id = ? AND user_id = ?", (plan_id, int(request.user_id)))
            row = cursor.fetchone()
            if not row:
                conn.close()
                return jsonify({"error": "计划不存在"}), 404
            
            update_parts = []
            update_values = []
            if 'title' in data:
                update_parts.append("title = ?")
                update_values.append(data['title'].strip())
            if 'type' in data:
                update_parts.append("type = ?")
                update_values.append(data['type'])
            if 'subject' in data:
                update_parts.append("subject = ?")
                update_values.append(data['subject'])
            if 'duration' in data:
                update_parts.append("duration = ?")
                update_values.append(data['duration'])
            if 'time' in data:
                update_parts.append("time = ?")
                update_values.append(data['time'])
            if 'date' in data:
                update_parts.append("date = ?")
                update_values.append(data['date'])
            if 'days' in data:
                update_parts.append("days = ?")
                update_values.append(json.dumps(data['days']))
            if 'reminder' in data:
                update_parts.append("reminder = ?")
                update_values.append(data['reminder'])
            if 'completed' in data:
                update_parts.append("completed = ?")
                update_values.append(1 if data['completed'] else 0)
            
            if update_parts:
                update_values.extend([plan_id, int(request.user_id)])
                cursor.execute(f"UPDATE plans SET {', '.join(update_parts)} WHERE id = ? AND user_id = ?", update_values)
                conn.commit()
            
            cursor.execute("SELECT * FROM plans WHERE id = ?", (plan_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                item = dict(row)
                item['days'] = json.loads(item['days']) if item['days'] else []
                item['completed'] = bool(item['completed'])
                return jsonify(item)
            return jsonify({"error": "更新失败"}), 500
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500


@plans_bp.route('/<int:plan_id>', methods=['DELETE'])
@token_required
def delete_plan(plan_id):
    """删除学习计划"""
    supabase = get_supabase()
    
    try:
        result = supabase.table('plans').select('*').eq('id', plan_id).eq('user_id', request.user_id).execute()
        if not result.data:
            return jsonify({"error": "计划不存在"}), 404
        
        supabase.table('plans').delete().eq('id', plan_id).eq('user_id', request.user_id).execute()
        return jsonify({"message": "计划删除成功"}), 200
    except APIError as e:
        if 'PGRST205' in str(e):
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM plans WHERE id = ? AND user_id = ?", (plan_id, int(request.user_id)))
            row = cursor.fetchone()
            if not row:
                conn.close()
                return jsonify({"error": "计划不存在"}), 404
            
            cursor.execute("DELETE FROM plans WHERE id = ? AND user_id = ?", (plan_id, int(request.user_id)))
            conn.commit()
            conn.close()
            return jsonify({"message": "计划删除成功"}), 200
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        try:
            conn = get_sqlite_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM plans WHERE id = ? AND user_id = ?", (plan_id, int(request.user_id)))
            row = cursor.fetchone()
            if not row:
                conn.close()
                return jsonify({"error": "计划不存在"}), 404
            
            cursor.execute("DELETE FROM plans WHERE id = ? AND user_id = ?", (plan_id, int(request.user_id)))
            conn.commit()
            conn.close()
            return jsonify({"message": "计划删除成功"}), 200
        except Exception as e2:
            return jsonify({"error": str(e2)}), 500