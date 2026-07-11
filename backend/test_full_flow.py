import requests
import json

BASE_URL = 'http://localhost:5000'

def test_register():
    print("=== 测试用户注册 ===")
    response = requests.post(
        f'{BASE_URL}/api/auth/register',
        json={'username': 'testuser2026', 'password': '123456'}
    )
    print(f"Status: {response.status_code}, Response: {response.text}")
    return response

def test_login():
    print("\n=== 测试用户登录 ===")
    response = requests.post(
        f'{BASE_URL}/api/auth/login',
        json={'username': 'testuser2026', 'password': '123456'}
    )
    print(f"Status: {response.status_code}, Response: {response.text}")
    if response.status_code == 200:
        data = response.json()
        return data.get('token', '')
    return ''

def test_create_task(token):
    print("\n=== 测试创建任务 ===")
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.post(
        f'{BASE_URL}/api/tasks',
        json={'title': '英语', 'priority': 'medium', 'due_date': '2026-07-22'},
        headers=headers
    )
    print(f"Status: {response.status_code}, Response: {response.text}")
    return response

def test_list_tasks(token):
    print("\n=== 测试获取任务列表 ===")
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{BASE_URL}/api/tasks', headers=headers)
    print(f"Status: {response.status_code}, Response: {response.text}")
    return response

if __name__ == '__main__':
    reg_response = test_register()
    
    if reg_response.status_code in (201, 409):
        token = test_login()
        if token:
            create_response = test_create_task(token)
            test_list_tasks(token)
        else:
            print("\n❌ 登录失败")
    else:
        print("\n❌ 注册失败")