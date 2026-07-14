import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv('SUPABASE_URL')
service_key = os.getenv('SUPABASE_SERVICE_KEY')

print(f"Supabase URL: {supabase_url}")
print(f"Service Key: {service_key[:20]}...")

try:
    supabase = create_client(supabase_url, service_key)
    
    print("\n=== 测试连接 ===")
    result = supabase.table('users').select('*').limit(1).execute()
    print(f"查询结果类型: {type(result)}")
    print(f"查询结果: {result}")
    
    print("\n=== 检查表是否存在 ===")
    tables = supabase.sql("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'").execute()
    print(f"所有表: {tables.data}")
    
except Exception as e:
    print(f"\n错误: {e}")
    import traceback
    traceback.print_exc()