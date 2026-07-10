"""StudyHub API 测试"""

import pytest
import json
from app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def auth_token(client):
    """注册并登录获取 token"""
    # 注册
    client.post('/api/auth/register', json={
        "username": "testuser",
        "password": "test123456"
    })
    # 登录
    resp = client.post('/api/auth/login', json={
        "username": "testuser",
        "password": "test123456"
    })
    data = json.loads(resp.data)
    return data.get('token', '')


class TestHealthCheck:
    def test_health(self, client):
        resp = client.get('/api/health')
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert data['status'] == 'ok'


class TestAuth:
    def test_register(self, client):
        resp = client.post('/api/auth/register', json={
            "username": "newuser",
            "password": "password123"
        })
        assert resp.status_code == 201

    def test_register_missing_fields(self, client):
        resp = client.post('/api/auth/register', json={})
        assert resp.status_code == 400

    def test_register_short_password(self, client):
        resp = client.post('/api/auth/register', json={
            "username": "user2",
            "password": "123"
        })
        assert resp.status_code == 400

    def test_login_success(self, client):
        # 先注册
        client.post('/api/auth/register', json={
            "username": "loginuser",
            "password": "password123"
        })
        # 再登录
        resp = client.post('/api/auth/login', json={
            "username": "loginuser",
            "password": "password123"
        })
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert 'token' in data

    def test_login_wrong_password(self, client):
        client.post('/api/auth/register', json={
            "username": "wrongpw",
            "password": "password123"
        })
        resp = client.post('/api/auth/login', json={
            "username": "wrongpw",
            "password": "wrongpassword"
        })
        assert resp.status_code == 401


class TestNotes:
    def test_create_note(self, client, auth_token):
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = client.post('/api/notes', json={
            "title": "测试笔记",
            "content": "这是测试内容",
            "subject": "编程"
        }, headers=headers)
        assert resp.status_code == 201

    def test_list_notes(self, client, auth_token):
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = client.get('/api/notes', headers=headers)
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert 'data' in data

    def test_create_note_no_auth(self, client):
        resp = client.post('/api/notes', json={
            "title": "测试",
            "content": "内容"
        })
        assert resp.status_code == 401

    def test_create_note_missing_title(self, client, auth_token):
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = client.post('/api/notes', json={
            "content": "只有内容没有标题"
        }, headers=headers)
        assert resp.status_code == 400


class TestTasks:
    def test_create_task(self, client, auth_token):
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = client.post('/api/tasks', json={
            "title": "完成作业",
            "priority": "high",
            "due_date": "2026-07-20"
        }, headers=headers)
        assert resp.status_code == 201

    def test_list_tasks(self, client, auth_token):
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = client.get('/api/tasks', headers=headers)
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert 'data' in data

    def test_create_task_no_auth(self, client):
        resp = client.post('/api/tasks', json={
            "title": "测试任务"
        })
        assert resp.status_code == 401

    def test_create_task_invalid_priority(self, client, auth_token):
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = client.post('/api/tasks', json={
            "title": "测试",
            "priority": "invalid"
        }, headers=headers)
        # 无效 priority 会被重置为 medium，仍然创建成功
        assert resp.status_code == 201
