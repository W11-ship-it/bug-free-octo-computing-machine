import requests
import json

def test_register_success():
    print("=== 测试用户注册成功 ===")
    try:
        response = requests.post(
            'http://localhost:5000/api/auth/register',
            json={'username': 'testuser', 'password': '123456'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 201
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_register_duplicate():
    print("\n=== 测试用户名已存在 ===")
    try:
        response = requests.post(
            'http://localhost:5000/api/auth/register',
            json={'username': 'testuser', 'password': '123456'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 409
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_register_short_password():
    print("\n=== 测试密码长度不足 ===")
    try:
        response = requests.post(
            'http://localhost:5000/api/auth/register',
            json={'username': 'newuser', 'password': '123'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 400
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_login_success():
    print("\n=== 测试用户登录成功 ===")
    try:
        response = requests.post(
            'http://localhost:5000/api/auth/login',
            json={'username': 'testuser', 'password': '123456'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        data = response.json()
        return response.status_code == 200 and 'token' in data and 'username' in data
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_login_wrong_password():
    print("\n=== 测试密码错误 ===")
    try:
        response = requests.post(
            'http://localhost:5000/api/auth/login',
            json={'username': 'testuser', 'password': 'wrongpass'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 401
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    results = []
    
    results.append(("注册成功", test_register_success()))
    results.append(("用户名已存在", test_register_duplicate()))
    results.append(("密码长度不足", test_register_short_password()))
    results.append(("登录成功", test_login_success()))
    results.append(("密码错误", test_login_wrong_password()))
    
    print("\n=== 测试结果汇总 ===")
    all_passed = True
    for name, passed in results:
        status = "✓ 通过" if passed else "✗ 失败"
        print(f"{name}: {status}")
        if not passed:
            all_passed = False
    
    exit(0 if all_passed else 1)