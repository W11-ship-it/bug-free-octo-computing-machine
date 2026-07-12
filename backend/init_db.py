import os
import sys
import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

def get_sql_content():
    sql_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.sql')
    with open(sql_path, 'r', encoding='utf-8') as f:
        return f.read()

def test_connection():
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    try:
        result = supabase.table('notes').select('id').limit(1).execute()
        print(f"✓ 连接成功，notes表有数据: {len(result.data)} 条")
        return True
    except Exception as e:
        print(f"✗ 连接失败: {e}")
        return False

def check_plans_table():
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    try:
        result = supabase.table('plans').select('id').limit(1).execute()
        print("✓ plans表已存在")
        return True
    except Exception as e:
        print(f"✗ plans表不存在: {e}")
        return False

def exec_sql_management_api(sql):
    project_ref = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')
    url = f"https://api.supabase.com/v1/projects/{project_ref}/database/query"
    
    headers = {
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
    }
    
    data = {
        'query': sql,
        'format': 'json'
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code in [200, 201, 202, 204]:
            print(f"✓ SQL 执行成功: {response.status_code}")
            return True
        else:
            print(f"✗ SQL 执行失败: {response.status_code} - {response.text[:200]}")
            return False
    except Exception as e:
        print(f"✗ SQL 执行失败: {e}")
        return False

def exec_sql_rest_rpc(sql):
    url = f"{SUPABASE_URL}/rest/v1/rpc/execute_sql"
    
    headers = {
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
    }
    
    data = {
        'sql': sql
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code in [200, 201]:
            print(f"✓ SQL 执行成功 (REST RPC)")
            return True
        else:
            print(f"✗ SQL 执行失败 (REST RPC): {response.status_code} - {response.text[:200]}")
            return False
    except Exception as e:
        print(f"✗ SQL 执行失败 (REST RPC): {e}")
        return False

def create_execute_sql_function():
    create_function_sql = """
    CREATE OR REPLACE FUNCTION execute_sql(p_sql text)
    RETURNS void AS $$
    BEGIN
        EXECUTE p_sql;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    """
    
    if exec_sql_management_api(create_function_sql):
        return True
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        result = supabase.rpc('execute_sql', {'p_sql': create_function_sql}).execute()
        print("✓ 创建execute_sql函数成功")
        return True
    except Exception as e:
        print(f"✗ 创建函数失败: {e}")
        return False

def init_database():
    print("步骤1: 测试连接...")
    if not test_connection():
        return False
    
    print("\n步骤2: 检查plans表是否存在...")
    if check_plans_table():
        return True
    
    sql_content = get_sql_content()
    
    print("\n步骤3: 尝试使用Management API执行SQL...")
    if exec_sql_management_api(sql_content):
        print("\n✓ 数据库初始化成功")
        return True
    
    print("\n步骤4: 尝试先创建execute_sql函数...")
    if create_execute_sql_function():
        print("\n步骤5: 使用RPC执行SQL...")
        if exec_sql_rest_rpc(sql_content):
            print("\n✓ 数据库初始化成功")
            return True
    
    print("\n✗ 所有方法都失败了")
    return False

if __name__ == '__main__':
    print("正在初始化数据库...")
    success = init_database()
    if success:
        print("\n✓ 数据库初始化成功")
    else:
        print("\n✗ 数据库初始化失败，请手动在Supabase Dashboard中执行SQL")
        print("")
        print("请登录 https://supabase.com/dashboard/project/dtzxfbxbmmfugkuagvea/sql")
        print("并执行以下SQL文件的内容:")
        print("")
        print("=" * 60)
        print(get_sql_content())
        print("=" * 60)
    print("\n数据库初始化完成")