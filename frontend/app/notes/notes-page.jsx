'use client';

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { Typography, Button, Table, Modal, Form, Input, Tag, message, Space, Card, Select, Checkbox, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, AppstoreOutlined, TableOutlined, DownloadOutlined, UndoOutlined } from '@ant-design/icons';
import RequireAuth from '../../lib/require-auth';
import api from '../../lib/api';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const subjectColors = {
  '数学': 'blue', '英语': 'green', '编程': 'purple', '其他': 'default',
};

const NoteCard = memo(function NoteCard({ note, onEdit, onDelete, onClick, selected, onSelect }) {
  return (
    <Card
      key={note.id}
      hoverable
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {onSelect && <Checkbox checked={selected} onChange={() => onSelect(note.id)} style={{ marginRight: 8 }} />}
          {note.title}
        </div>
      }
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

export default function NotesPageComponent() {
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
  const [selectedIds, setSelectedIds] = useState([]);
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
      const res = await api.get('/notes');
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

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/notes', values);
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
      await api.delete(`/notes/${id}`);
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

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredNotes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotes.map(n => n.id));
    }
  }, [selectedIds, filteredNotes]);

  const handleSelect = useCallback((id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const handleBatchDelete = useCallback(async () => {
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/notes/${id}`)));
      message.success(`已删除 ${selectedIds.length} 篇笔记`);
      setSelectedIds([]);
      fetchNotes();
    } catch {
      message.error('批量删除失败');
    }
  }, [selectedIds, fetchNotes]);

  const handleExport = useCallback(() => {
    const selectedNotes = notes.filter(n => selectedIds.includes(n.id));
    const dataToExport = selectedNotes.length > 0 ? selectedNotes : notes;
    
    const content = dataToExport.map((n, i) => {
      return `=== 笔记 ${i + 1} ===\n标题: ${n.title}\n学科: ${n.subject || '未分类'}\n创建时间: ${n.created_at || ''}\n内容:\n${n.content}\n\n`;
    }).join('');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes_export_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success(`已导出 ${dataToExport.length} 篇笔记`);
  }, [notes, selectedIds]);

  const columns = useMemo(() => [
    { 
      title: <Checkbox checked={selectedIds.length === filteredNotes.length && filteredNotes.length > 0} onChange={handleSelectAll} />,
      key: 'selection',
      width: 50,
      render: (_, record) => (
        <Checkbox checked={selectedIds.includes(record.id)} onChange={() => handleSelect(record.id)} />
      ),
    },
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
  ], [handleEdit, handleDelete, handleViewDetail, selectedIds, filteredNotes, handleSelectAll, handleSelect]);

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
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Input
                placeholder="搜索笔记..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <Select
              placeholder="选择学科"
              value={selectedSubject}
              onChange={setSelectedSubject}
              allowClear
              style={{ width: 160 }}
            >
              {uniqueSubjects.map(s => (
                <Select.Option key={s} value={s}>{s}</Select.Option>
              ))}
            </Select>
            <Space>
              <Button
                type={viewMode === 'table' ? 'primary' : 'default'}
                icon={<TableOutlined />}
                onClick={() => setViewMode('table')}
              >
                表格视图
              </Button>
              <Button
                type={viewMode === 'card' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('card')}
              >
                卡片视图
              </Button>
            </Space>
          </div>
        </Card>

        {selectedIds.length > 0 && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <span>已选择 {selectedIds.length} 篇笔记</span>
            <Space style={{ marginLeft: 16 }}>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>批量删除</Button>
              <Button onClick={() => setSelectedIds([])}>取消选择</Button>
            </Space>
          </div>
        )}

        {viewMode === 'table' ? (
          <Table
            dataSource={filteredNotes}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClick={() => handleViewDetail(note)}
                selected={selectedIds.includes(note.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}

        <Modal
          title={editingNote ? '编辑笔记' : '新建笔记'}
          open={modalOpen}
          onCancel={() => { setModalOpen(false); setEditingNote(null); }}
          footer={null}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
              <Input placeholder="请输入标题" />
            </Form.Item>
            <Form.Item name="subject" label="学科">
              <Select placeholder="选择学科">
                <Select.Option value="数学">数学</Select.Option>
                <Select.Option value="英语">英语</Select.Option>
                <Select.Option value="编程">编程</Select.Option>
                <Select.Option value="其他">其他</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="content" label="内容">
              <TextArea rows={6} placeholder="请输入笔记内容" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={handleSave}>保存</Button>
                <Button onClick={() => { setModalOpen(false); setEditingNote(null); }}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={detailNote?.title || '笔记详情'}
          open={!!detailNote}
          onCancel={() => setDetailNote(null)}
          footer={null}
          width={600}
        >
          {detailNote && (
            <div>
              <Tag color={subjectColors[detailNote.subject] || 'default'} style={{ marginBottom: 16 }}>
                {detailNote.subject || '未分类'}
              </Tag>
              <Paragraph>{detailNote.content}</Paragraph>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0', color: '#999', fontSize: 12 }}>
                创建时间：{detailNote.created_at && new Date(detailNote.created_at).toLocaleString('zh-CN')}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RequireAuth>
  );
}
