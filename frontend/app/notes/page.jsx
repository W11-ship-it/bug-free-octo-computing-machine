'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { memo } from 'react';
import { Typography, Button, Table, Modal, Form, Input, Tag, message, Space, Card, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, AppstoreOutlined, TableOutlined } from '@ant-design/icons';
import api from '../../lib/api';
import RequireAuth from '../../lib/require-auth';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const subjectColors = {
  '数学': 'blue', '英语': 'green', '编程': 'purple', '其他': 'default',
};

const NoteCard = memo(function NoteCard({ note, onEdit, onDelete, onClick }) {
  return (
    <Card
      key={note.id}
      hoverable
      title={note.title}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      extra={
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={(e) => { e.stopPropagation(); onEdit(note); }} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} />
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
  );
});

const TableAction = memo(function TableAction({ record, onEdit, onDelete }) {
  return (
    <Space>
      <Button
        icon={<EditOutlined />}
        size="small"
        onClick={() => onEdit(record)}
      />
      <Button icon={<DeleteOutlined />} size="small" danger onClick={() => onDelete(record.id)} />
    </Space>
  );
});

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [detailNote, setDetailNote] = useState(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notes');
      setNotes(res.data.data || []);
    } catch {
      message.error('加载笔记失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSave = useCallback(async () => {
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
  }, [editingNote, form, fetchNotes]);

  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/api/notes/${id}`);
      message.success('删除成功');
      fetchNotes();
    } catch {
      message.error('删除失败');
    }
  }, [fetchNotes]);

  const handleEdit = useCallback((note) => {
    setEditingNote(note);
    form.setFieldsValue(note);
    setModalOpen(true);
  }, [form]);

  const handleViewDetail = useCallback((note) => {
    setDetailNote(note);
  }, []);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchSearch = !debouncedSearch || 
        note.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        note.content.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchSubject = !selectedSubject || note.subject === selectedSubject;
      return matchSearch && matchSubject;
    });
  }, [notes, debouncedSearch, selectedSubject]);

  const uniqueSubjects = useMemo(() => {
    return [...new Set(notes.map(n => n.subject).filter(Boolean))];
  }, [notes]);

  const columns = useMemo(() => [
    { 
      title: '标题', 
      dataIndex: 'title', 
      key: 'title', 
      ellipsis: true,
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>{text}</Button>
      ),
    },
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
      title: '操作', key: 'action', width: 180,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ], [handleEdit, handleDelete, handleViewDetail]);

  const handleNewNote = useCallback(() => {
    setEditingNote(null);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  return (
    <RequireAuth>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-end' }}>
          <Title level={3} style={{ margin: 0 }}>学习笔记</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNewNote}>
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
              <NoteCard 
                key={note.id} 
                note={note} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onClick={() => handleViewDetail(note)}
              />
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

        <Modal 
          title="笔记详情" 
          open={!!detailNote} 
          onCancel={() => setDetailNote(null)}
          footer={
            detailNote ? (
              <Space>
                <Button onClick={() => setDetailNote(null)}>关闭</Button>
                <Button type="primary" onClick={() => {
                  handleEdit(detailNote);
                  setDetailNote(null);
                }}>编辑</Button>
              </Space>
            ) : null
          }
        >
          {detailNote && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Tag color={subjectColors[detailNote.subject] || 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {detailNote.subject || '未分类'}
                </Tag>
              </div>
              <Title level={4} style={{ marginBottom: 16 }}>{detailNote.title}</Title>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>
                {detailNote.content}
              </Paragraph>
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0', color: '#999', fontSize: 12 }}>
                创建时间：{detailNote.created_at && new Date(detailNote.created_at).toLocaleString('zh-CN')}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RequireAuth>
  );
}