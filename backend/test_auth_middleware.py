import requests

def test_no_token():
    print("=== 测试无 token 访问受保护接口 ===")
    try:
        response = requests.get('http://localhost:5000/api/notes')
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 401 and response.json().get('error') == '缺少认证令牌'
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_invalid_token():
    print("\n=== 测试无效 token 访问受保护接口 ===")
    try:
        response = requests.get(
            'http://localhost:5000/api/notes',
            headers={'Authorization': 'Bearer invalid-token-123'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 401 and response.json().get('error') == '无效的令牌'
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_expired_token():
    print("\n=== 测试过期 token 访问受保护接口 ===")
    import jwt
    import os
    from datetime import datetime, timedelta
    
    secret_key = os.getenv('JWT_SECRET', 'dev-secret-key')
    expired_token = jwt.encode(
        {
            "user_id": 1,
            "username": "test",
            "exp": datetime.utcnow() - timedelta(days=1)
        },
        secret_key,
        algorithm='HS256'
    )
    
    try:
        response = requests.get(
            'http://localhost:5000/api/notes',
            headers={'Authorization': f'Bearer {expired_token}'}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 401 and response.json().get('error') == '令牌已过期'
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    results = []
    results.append(("无 token 访问", test_no_token()))
    results.append(("无效 token 访问", test_invalid_token()))
    results.append(("过期 token 访问", test_expired_token()))
    
    print("\n=== 测试结果汇总 ===")
    all_passed = True
    for name, passed in results:
        status = "✓ 通过" if passed else "✗ 失败"
        print(f"{name}: {status}")
        if not passed:
            all_passed = False
    
    exit(0 if all_passed else 1)