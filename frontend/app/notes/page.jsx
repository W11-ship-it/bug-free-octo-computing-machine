'use client';

import { useState, useEffect } from 'react';
import { Typography, Button, Table, Modal, Form, Input, Tag, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../lib/api';

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

  const fetchNotes = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
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

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>学习笔记</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingNote(null); form.resetFields(); setModalOpen(true); }}>
          新建笔记
        </Button>
      </div>
      <Table columns={columns} dataSource={notes} rowKey="id" loading={loading} />
      <Modal title={editingNote ? '编辑笔记' : '新建笔记'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="subject" label="学科">
            <Input placeholder="如：数学、英语、编程" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
