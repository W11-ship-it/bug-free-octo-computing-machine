-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 2. 学习笔记表
CREATE TABLE IF NOT EXISTS notes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    subject VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. 学习任务表
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    category VARCHAR(100),
    reminder VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 4. 学习计划表
CREATE TABLE IF NOT EXISTS plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'daily' CHECK (type IN ('daily', 'weekly')),
    subject VARCHAR(100) DEFAULT '',
    duration INTEGER DEFAULT 60 CHECK (duration > 0),
    time TIME WITHOUT TIME ZONE,
    date DATE,
    days TEXT[],
    reminder VARCHAR(20),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 5. 索引优化
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_created_at ON plans(created_at);


-- 6. 自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


-- 7. 行级安全策略 (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;


-- 8. RLS 策略定义
CREATE POLICY "Users can view their own notes"
    ON notes
    FOR SELECT
    USING (user_id = auth.uid()::BIGINT);

CREATE POLICY "Users can insert their own notes"
    ON notes
    FOR INSERT
    WITH CHECK (user_id = auth.uid()::BIGINT);

CREATE POLICY "Users can update their own notes"
    ON notes
    FOR UPDATE
    USING (user_id = auth.uid()::BIGINT);

CREATE POLICY "Users can delete their own notes"
    ON notes
    FOR DELETE
    USING (user_id = auth.uid()::BIGINT);


CREATE POLICY "Users can view their own tasks"
    ON tasks
    FOR SELECT
    USING (user_id = auth.uid()::BIGINT);

CREATE POLICY "Users can insert their own tasks"
    ON tasks
    FOR INSERT
    WITH CHECK (user_id = auth.uid()::BIGINT);

CREATE POLICY "Users can update their own tasks"
    ON tasks
    FOR UPDATE
    USING (user_id = auth.uid()::BIGINT);

CREATE POLICY "Users can delete their own tasks"
    ON tasks
    FOR DELETE
    USING (user_id = auth.uid()::BIGINT);


CREATE POLICY "Users can view their own plans"
    ON plans
    FOR SELECT
    USING (user_id = auth.uid()::BIGINT);

CREATE POLICY "Users can insert their own plans"
    ON plans
    FOR INSERT
    WITH CHECK (user_id = auth.uid()::BIGINT);

CREATE POLICY "Users can update their own plans"
    ON plans
    FOR UPDATE
    USING (user_id = auth.uid()::BIGINT);

CREATE POLICY "Users can delete their own plans"
    ON plans
    FOR DELETE
    USING (user_id = auth.uid()::BIGINT);


-- 9. 授予角色权限
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON plans TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON plans TO service_role;