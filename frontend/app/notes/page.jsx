'use client';

import { useState, useEffect, useMemo } from 'react';
import { Typography, Button, Table, Modal, Form, Input, Tag, message, Space, Card, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, AppstoreOutlined, TableOutlined } from '@ant-design/icons';
import api from '../../lib/api';
import RequireAuth from '../../lib/require-auth';

const { Title } = Typography;
const { TextArea } = Input;

const subjectColors = {
  '数学': 'blue', '英语': 'green', '编程': 'purple', '其他': 'default',
};

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notes');
      setNotes(res.data.data || []);
    } catch {
      message.error('加载笔记失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingNote) {
        await api.put(`/api/notes/${editingNote.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/api/notes', values);
        message.success('创建成功');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingNote(null);
      fetchNotes();
    } catch {
      message.error('保存失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/notes/${id}`);
      message.success('删除成功');
      fetchNotes();
    } catch {
      message.error('删除失败');
    }
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchSearch = !searchText || 
        note.title.toLowerCase().includes(searchText.toLowerCase()) ||
        note.content.toLowerCase().includes(searchText.toLowerCase());
      const matchSubject = !selectedSubject || note.subject === selectedSubject;
      return matchSearch && matchSubject;
    });
  }, [notes, searchText, selectedSubject]);

  const uniqueSubjects = useMemo(() => {
    return [...new Set(notes.map(n => n.subject).filter(Boolean))];
  }, [notes]);

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '学科', dataIndex: 'subject', key: 'subject',
      render: (s) => <Tag color={subjectColors[s] || 'default'}>{s || '未分类'}</Tag>,
    },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '创建时间', dataIndex: 'created_at', key: 'created_at',
      render: (t) => t && new Date(t).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作', key: 'action', width: 120,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => { setEditingNote(record); form.setFieldsValue(record); setModalOpen(true); }}
          />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <RequireAuth>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-end' }}>
          <Title level={3} style={{ margin: 0 }}>学习笔记</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingNote(null); form.resetFields(); setModalOpen(true); }}>
            新建笔记
          </Button>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <Space wrap>
            <Space>
              <Input
                placeholder="搜索笔记..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              <Select
                placeholder="选择学科"
                value={selectedSubject}
                onChange={setSelectedSubject}
                style={{ width: 120 }}
                allowClear
              >
                {uniqueSubjects.map(subject => (
                  <Select.Option key={subject} value={subject}>{subject}</Select.Option>
                ))}
              </Select>
            </Space>
            <Space>
              <Button
                type={viewMode === 'table' ? 'primary' : 'default'}
                icon={<TableOutlined />}
                onClick={() => setViewMode('table')}
              >表格视图</Button>
              <Button
                type={viewMode === 'card' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('card')}
              >卡片视图</Button>
            </Space>
            <span style={{ color: '#999', fontSize: 12 }}>
              共 {filteredNotes.length} 条笔记
            </span>
          </Space>
        </Card>

        {viewMode === 'table' ? (
          <Table columns={columns} dataSource={filteredNotes} rowKey="id" loading={loading} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filteredNotes.map(note => (
              <Card
                key={note.id}
                hoverable
                title={note.title}
                extra={
                  <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => { setEditingNote(note); form.setFieldsValue(note); setModalOpen(true); }} />
                    <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(note.id)} />
                  </Space>
                }
              >
                <Tag color={subjectColors[note.subject] || 'default'} style={{ marginBottom: 8 }}>{note.subject || '未分类'}</Tag>
                <p style={{ color: '#666', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {note.content}
                </p>
                <p style={{ color: '#999', fontSize: 12, marginTop: 8, marginBottom: 0 }}>
                  {note.created_at && new Date(note.created_at).toLocaleDateString('zh-CN')}
                </p>
              </Card>
            ))}
            {filteredNotes.length === 0 && !loading && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#999' }}>
                暂无笔记，点击右上角创建一个吧
              </div>
            )}
          </div>
        )}

        <Modal title={editingNote ? '编辑笔记' : '新建笔记'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)}>
          <Form form={form} layout="vertical">
            <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="subject" label="学科">
              <Select placeholder="选择学科" allowClear>
                {Object.keys(subjectColors).map(subject => (
                  <Select.Option key={subject} value={subject}>{subject}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
              <TextArea rows={6} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </RequireAuth>
  );
}