import requests

BASE_URL = "http://localhost:5000/api"

def test_login():
    print("测试登录API...")
    response = requests.post(f"{BASE_URL}/auth/login", json={"username": "testuser", "password": "test123"})
    print(f"登录状态码: {response.status_code}")
    print(f"登录响应: {response.text}")
    if response.status_code == 200:
        return response.json().get("token")
    return None

def test_create_plan(token):
    print("\n测试创建计划API...")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    data = {
        "title": "测试计划",
        "type": "daily",
        "subject": "数学",
        "duration": 60,
        "time": "09:00",
        "date": "2026-07-13",
        "days": [],
        "completed": False
    }
    response = requests.post(f"{BASE_URL}/plans", json=data, headers=headers)
    print(f"创建计划状态码: {response.status_code}")
    print(f"创建计划响应: {response.text}")
    return response.status_code == 201

def test_get_plans(token):
    print("\n测试获取计划API...")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    response = requests.get(f"{BASE_URL}/plans", headers=headers)
    print(f"获取计划状态码: {response.status_code}")
    print(f"获取计划响应: {response.text}")
    return response.status_code == 200

def test_create_note(token):
    print("\n测试创建笔记API...")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    data = {
        "title": "测试笔记",
        "content": "这是一篇测试笔记",
        "subject": "编程"
    }
    response = requests.post(f"{BASE_URL}/notes", json=data, headers=headers)
    print(f"创建笔记状态码: {response.status_code}")
    print(f"创建笔记响应: {response.text}")
    return response.status_code == 201

def test_create_task(token):
    print("\n测试创建任务API...")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    data = {
        "title": "测试任务",
        "priority": "high",
        "due_date": "2026-07-15",
        "completed": False
    }
    response = requests.post(f"{BASE_URL}/tasks", json=data, headers=headers)
    print(f"创建任务状态码: {response.status_code}")
    print(f"创建任务响应: {response.text}")
    return response.status_code == 201

if __name__ == "__main__":
    token = test_login()
    if token:
        test_create_plan(token)
        test_get_plans(token)
        test_create_note(token)
        test_create_task(token)
    else:
        print("登录失败，无法继续测试")