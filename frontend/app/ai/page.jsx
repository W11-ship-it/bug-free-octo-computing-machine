'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Typography, Card, Button, Input, message, Space, Spin, Tag, Divider, Tabs, Popconfirm, Tooltip } from 'antd';
import { 
  RobotOutlined, 
  BookOutlined, 
  CheckSquareOutlined,
  MessageOutlined,
  SendOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  ClearOutlined,
  HistoryOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  CheckOutlined,
  CodeOutlined,
  PictureOutlined,
  UploadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import RequireAuth from '../../lib/require-auth';

const { TextArea } = Input;

const { Title } = Typography;

const quickActions = [
  { title: '智能笔记摘要', icon: <FileTextOutlined />, description: '帮你总结笔记内容', action: 'summarize' },
  { title: '学习计划推荐', icon: <ThunderboltOutlined />, description: '根据任务生成学习建议', action: 'plan' },
  { title: '任务优先级分析', icon: <CheckSquareOutlined />, description: '分析任务优先级', action: 'prioritize' },
  { title: '知识点关联', icon: <BulbOutlined />, description: '发现笔记间的关联', action: 'connect' },
];

const presetQuestions = [
  '如何高效学习编程？',
  '推荐一些学习资源',
  '如何制定学习计划？',
  '学习中遇到困难怎么办？',
];

const ChatMessage = React.memo(function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  const renderContent = useMemo(() => {
    const content = message.content;
    const parts = [];
    let lastIndex = 0;
    
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', language: match[1] || '', content: match[2] });
      lastIndex = codeBlockRegex.lastIndex;
    }
    
    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.slice(lastIndex) });
    }

    return parts.map((part, partIdx) => {
      if (part.type === 'code') {
        return (
          <div key={partIdx} style={{ marginBottom: 8, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '6px 12px', 
              background: '#2d2d2d', 
              color: '#fff',
              fontSize: 12
            }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <CodeOutlined style={{ marginRight: 6 }} />
                {part.language || 'code'}
              </span>
              <Button 
                type="text" 
                size="small" 
                onClick={() => { navigator.clipboard.writeText(part.content); message.success('代码已复制'); }}
                style={{ color: '#fff' }}
              >
                复制
              </Button>
            </div>
            <pre style={{ 
              margin: 0, 
              padding: 16, 
              background: '#1e1e1e', 
              color: '#d4d4d4',
              fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
              fontSize: 13,
              lineHeight: 1.6,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {part.content}
            </pre>
          </div>
        );
      }

      return part.content.split('\n').map((line, idx) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <strong key={idx} style={{ display: 'block', marginBottom: 4 }}>{line.slice(2, -2)}</strong>;
        }
        if (line.startsWith('*') && line.endsWith('*')) {
          return <em key={idx} style={{ display: 'block', marginBottom: 4 }}>{line.slice(1, -1)}</em>;
        }
        if (line.match(/^\d+\.\s/)) {
          return <div key={idx} style={{ paddingLeft: 24, textIndent: -16, marginBottom: 4 }}>{line}</div>;
        }
        if (line.startsWith('- ')) {
          return <div key={idx} style={{ paddingLeft: 24, textIndent: -16, marginBottom: 4 }}>• {line.slice(2)}</div>;
        }
        if (line.startsWith('🔴') || line.startsWith('🟡') || line.startsWith('🟢')) {
          return <div key={idx} style={{ marginBottom: 4, padding: 8, borderRadius: 6, background: line.startsWith('🔴') ? '#fff2f0' : line.startsWith('🟡') ? '#fffbe6' : '#f6ffed' }}>{line}</div>;
        }
        if (line.startsWith('> ')) {
          return <blockquote key={idx} style={{ margin: '4px 0', padding: '8px 12px', background: '#f5f5f5', borderRadius: 6, borderLeft: '3px solid #1890ff', fontStyle: 'italic' }}>{line.slice(2)}</blockquote>;
        }
        const urlRegex = /https?:\/\/[^\s]+/g;
        const hasUrl = urlRegex.test(line);
        if (hasUrl) {
          return (
            <div key={idx} style={{ marginBottom: 4 }}>
              {line.split(urlRegex).map((text, i, arr) => (
                <span key={i}>
                  {text}
                  {i < arr.length - 1 && (
                    <a 
                      href={line.match(urlRegex)[i]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#1890ff', textDecoration: 'underline', margin: '0 4px' }}
                    >
                      {line.match(urlRegex)[i]}
                    </a>
                  )}
                </span>
              ))}
            </div>
          );
        }
        return <div key={idx} style={{ marginBottom: 4 }}>{line}</div>;
      });
    });
  }, [message]);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ 
          width: 36, 
          height: 36, 
          borderRadius: 50, 
          background: message.role === 'assistant' ? 'linear-gradient(135deg, #1890ff, #722ed1)' : '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
          boxShadow: message.role === 'assistant' ? '0 4px 12px rgba(24, 144, 255, 0.3)' : 'none'
        }}>
          {message.role === 'assistant' ? (
            <RobotOutlined style={{ color: '#fff', fontSize: 18 }} />
          ) : (
            <MessageOutlined style={{ color: '#666', fontSize: 18 }} />
          )}
        </div>
        <div>
          <span style={{ fontWeight: 'bold', color: '#333', fontSize: 14 }}>
            {message.role === 'assistant' ? 'AI 学习助手' : '我'}
          </span>
          {message.time && (
            <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
              {dayjs(message.time).format('HH:mm')}
            </span>
          )}
        </div>
        <Tooltip title={copied ? '已复制' : '复制消息'}>
          <Button 
            type="text" 
            size="small" 
            onClick={handleCopy}
            style={{ marginLeft: 'auto', padding: 0, color: '#999' }}
          >
            {copied ? <CheckOutlined /> : <CopyOutlined />}
          </Button>
        </Tooltip>
      </div>
      <div style={{ 
        padding: 16, 
        borderRadius: message.role === 'assistant' ? '0 12px 12px 12px' : '12px 0 12px 12px',
        background: message.role === 'assistant' ? 'linear-gradient(135deg, #f0f5ff, #f9f0ff)' : '#f5f5f5',
        lineHeight: 1.8,
        fontSize: 14,
        color: '#333',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        {renderContent}
      </div>
    </div>
  );
});

export default function AiPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '你好！我是你的学习助手 AI 🤖\n\n我可以帮你：\n\n📝 总结笔记内容\n📋 推荐学习计划\n🎯 分析任务优先级\n💡 发现知识点关联\n\n请问有什么可以帮你的？',
      time: dayjs().format(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentTyping, setCurrentTyping] = useState('');
  const [typingSpeed, setTypingSpeed] = useState(30);
  const [showImages, setShowImages] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try {
        setChatHistory(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
      if (e.key === 'Escape' && loading) {
        cancelTyping();
      }
      if (e.key === 'c' && e.ctrlKey && !loading) {
        e.preventDefault();
        handleClearChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSend, cancelTyping, handleClearChat, loading]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  const simulateTyping = useCallback((text, callback) => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }
    
    let index = 0;
    setCurrentTyping('');
    
    typingTimerRef.current = setInterval(() => {
      if (index < text.length) {
        const charsPerStep = Math.min(Math.ceil(typingSpeed / 15), 3);
        const endIndex = Math.min(index + charsPerStep, text.length);
        setCurrentTyping(text.slice(0, endIndex));
        index = endIndex;
      } else {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        callback(text);
      }
    }, typingSpeed);

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [typingSpeed]);

  const cancelTyping = useCallback(() => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setCurrentTyping('');
    setLoading(false);
  }, []);

  const handleFileUpload = useCallback((e) => {
    const files = e.target.files || e.dataTransfer?.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          setShowImages(prev => [...prev, { id: Date.now(), src: base64, name: file.name }]);
        };
        reader.readAsDataURL(file);
      } else {
        message.warning('暂时只支持图片上传');
      }
    });
  }, []);

  const handleRemoveImage = useCallback((id) => {
    setShowImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() && showImages.length === 0) return;

    let content = inputValue.trim();
    showImages.forEach(img => {
      content += `\n![${img.name}](${img.src})`;
    });

    const newMessage = { 
      role: 'user', 
      content: content,
      time: dayjs().format(),
      images: showImages.length > 0 ? showImages.map(img => img.src) : [],
    };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setShowImages([]);
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const responses = [
        '这是一个很棒的学习问题！根据学习科学原理，我建议：\n\n1. 制定明确的学习目标\n2. 分解任务，逐步完成\n3. 定期回顾和总结\n\n需要我帮你生成详细的学习计划吗？',
        '好的，我来帮你分析一下。有效的学习方法包括：\n\n- 主动学习：通过实践加深理解\n- 间隔重复：定期复习巩固记忆\n- 思维导图：可视化知识结构\n\n你想尝试其中的哪种方法？',
        '收到！让我为你生成学习建议...\n\n根据你的学习数据，我发现：\n\n📊 你本周学习了 12 小时\n🎯 完成了 8 个任务\n📝 创建了 5 篇笔记\n\n建议：保持这个节奏，继续加油！',
        '学习是一个持续的过程，关键在于：\n\n1. **保持好奇心**：对新事物保持开放的心态\n2. **坚持不懈**：每天进步一点点\n3. **善于总结**：从错误中学习\n\n你目前在学习什么？',
        '我来帮你分析这张图片！\n\n从图片中我可以看到：\n\n- 这是一张学习相关的图片\n- 包含了关键信息\n\n如果你有具体的问题，请告诉我，我来帮你解答！',
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      
      const cleanup = simulateTyping(response, (fullText) => {
        setMessages(prev => [...prev, { role: 'assistant', content: fullText, time: dayjs().format() }]);
        setLoading(false);
        setCurrentTyping('');
      });

      return cleanup;
    } catch {
      message.error('AI 服务暂时不可用');
      setLoading(false);
    }
  }, [inputValue, simulateTyping, showImages]);

  const handleQuickAction = useCallback(async (action) => {
    setLoading(true);
    let prompt = '';
    let response = '';

    switch (action) {
      case 'summarize':
        prompt = '帮我总结学习笔记';
        response = '📝 **智能笔记摘要**\n\n我分析了你的学习笔记，发现以下重点：\n\n1. **核心知识点**：你最近学习了数据结构和算法\n2. **高频词汇**：递归、动态规划、时间复杂度\n3. **学习建议**：建议复习二叉树相关内容，这是面试高频考点\n\n需要我生成更详细的总结吗？';
        break;
      case 'plan':
        prompt = '推荐学习计划';
        response = '📋 **学习计划推荐**\n\n根据你的任务安排，我建议今日学习计划：\n\n上午（9:00-12:00）\n- 完成「数据结构复习」任务\n- 阅读相关笔记，加深理解\n\n下午（14:00-17:00）\n- 练习算法题目\n- 总结学习心得，记录笔记\n\n晚上（19:00-20:00）\n- 回顾今日学习内容\n- 规划明日学习计划\n\n这个计划合理吗？';
        break;
      case 'prioritize':
        prompt = '分析任务优先级';
        response = '🎯 **任务优先级分析**\n\n根据你的任务列表，我进行了优先级排序：\n\n🔴 高优先级\n- 「完成项目报告」- 截止日期临近\n- 「复习期末重点」- 考试临近\n\n🟡 中优先级\n- 「阅读技术文档」- 持续学习\n- 「整理笔记」- 知识巩固\n\n🟢 低优先级\n- 「学习新工具」- 可延后\n\n建议先处理高优先级任务，需要调整吗？';
        break;
      case 'connect':
        prompt = '发现知识点关联';
        response = '💡 **知识点关联分析**\n\n我发现你的笔记中有以下知识关联：\n\n1. **「数据结构」与「算法」**\n   - 掌握数据结构是理解算法的基础\n   - 建议先复习数据结构再学习算法\n\n2. **「JavaScript」与「React」**\n   - React 是基于 JavaScript 的框架\n   - 建议先巩固 JavaScript 基础\n\n3. **「数据库」与「后端开发」**\n   - 数据库是后端开发的核心\n   - 建议学习 SQL 和数据库设计\n\n这些关联对你有帮助吗？';
        break;
    }

    setMessages(prev => [...prev, { role: 'user', content: prompt, time: dayjs().format() }]);
    
    const cleanup = simulateTyping(response, (fullText) => {
      setMessages(prev => [...prev, { role: 'assistant', content: fullText, time: dayjs().format() }]);
      setLoading(false);
    });

    return cleanup;
  }, [simulateTyping]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = useCallback(() => {
    setMessages([{
      role: 'assistant',
      content: '你好！我是你的学习助手 AI 🤖\n\n请问有什么可以帮你的？',
      time: dayjs().format(),
    }]);
    message.success('聊天记录已清空');
  }, []);

  const handleSaveChat = useCallback(() => {
    const historyItem = {
      id: Date.now(),
      title: messages[1]?.content.slice(0, 20) + '...' || '新对话',
      time: dayjs().format(),
      messages: [...messages],
    };
    setChatHistory(prev => [historyItem, ...prev].slice(0, 10));
    message.success('对话已保存');
  }, [messages]);

  const handleLoadHistory = useCallback((item) => {
    setMessages(item.messages);
    setActiveTab('chat');
  }, []);

  const handleDeleteHistory = useCallback((id) => {
    setChatHistory(prev => prev.filter(item => item.id !== id));
    message.success('历史记录已删除');
  }, []);

  const handlePresetQuestion = useCallback((question) => {
    setInputValue(question);
  }, []);

  return (
    <RequireAuth>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'flex-end' }}>
          <Title level={3} style={{ margin: 0 }}>
            <RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            AI 学习助手
          </Title>
          <Space>
            <Button icon={<SaveOutlined />} onClick={handleSaveChat}>保存对话</Button>
            <Popconfirm title="确定要清空聊天记录吗？" onConfirm={handleClearChat}>
              <Button icon={<ClearOutlined />} danger>清空记录</Button>
            </Popconfirm>
          </Space>
        </div>

        <div className="chat-container" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div className="chat-sidebar" style={{ width: 280, flexShrink: 0, maxWidth: '100%' }}>
            <Card title="快捷操作">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {quickActions.map(item => (
                  <Button 
                    key={item.action} 
                    block 
                    icon={item.icon} 
                    onClick={() => handleQuickAction(item.action)}
                    style={{ textAlign: 'left', padding: '12px 16px' }}
                    hoverStyle={{ background: '#f0f5ff' }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{item.description}</div>
                  </Button>
                ))}
              </Space>
            </Card>

            <Card title="快速提问" style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {presetQuestions.map((q, idx) => (
                  <Tag 
                    key={idx} 
                    onClick={() => handlePresetQuestion(q)}
                    style={{ cursor: 'pointer', background: '#f0f5ff', border: '1px solid #d9d9d9' }}
                    hoverStyle={{ background: '#e6f7ff', borderColor: '#1890ff' }}
                  >
                    {q}
                  </Tag>
                ))}
              </div>
            </Card>

            <Card title="学习小贴士" style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.8 }}>
                <div style={{ marginBottom: 10, padding: 10, background: '#fffbe6', borderRadius: 6, borderLeft: '3px solid #faad14' }}>
                  💡 <strong>主动学习</strong>：通过实践加深理解
                </div>
                <div style={{ marginBottom: 10, padding: 10, background: '#f6ffed', borderRadius: 6, borderLeft: '3px solid #52c41a' }}>
                  💡 <strong>间隔重复</strong>：定期复习巩固记忆
                </div>
                <div style={{ marginBottom: 10, padding: 10, background: '#fff0f6', borderRadius: 6, borderLeft: '3px solid #eb2f96' }}>
                  💡 <strong>费曼技巧</strong>：用简单语言解释知识
                </div>
                <div style={{ padding: 10, background: '#e6f7ff', borderRadius: 6, borderLeft: '3px solid #1890ff' }}>
                  💡 <strong>番茄工作法</strong>：25分钟专注+5分钟休息
                </div>
              </div>
            </Card>

            <Card title="学习数据" style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed #f0f0f0' }}>
                <span style={{ color: '#666' }}>本周学习时长</span>
                <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: 16 }}>12 小时</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed #f0f0f0' }}>
                <span style={{ color: '#666' }}>完成任务</span>
                <span style={{ fontWeight: 'bold', color: '#52c41a', fontSize: 16 }}>8 个</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ color: '#666' }}>创建笔记</span>
                <span style={{ fontWeight: 'bold', color: '#722ed1', fontSize: 16 }}>5 篇</span>
              </div>
            </Card>
          </div>

          <div className="chat-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', minWidth: 0 }}>
            <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 12 }}>
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={[
                  { key: 'chat', label: '聊天', icon: <MessageOutlined /> },
                  { key: 'history', label: '历史记录', icon: <HistoryOutlined /> },
                ]}
                style={{ marginBottom: 0, borderBottom: '1px solid #f0f0f0' }}
              />
              
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {activeTab === 'chat' ? (
                  <>
                    {messages.map((msg, index) => (
                      <ChatMessage key={index} message={msg} />
                    ))}
                    {loading && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ 
                            width: 36, 
                            height: 36, 
                            borderRadius: 50, 
                            background: 'linear-gradient(135deg, #1890ff, #722ed1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 10,
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                          }}>
                            <RobotOutlined style={{ color: '#fff', fontSize: 18 }} />
                          </div>
                          <span style={{ fontWeight: 'bold', color: '#333', fontSize: 14 }}>AI 学习助手</span>
                          <Button 
                            type="text" 
                            size="small" 
                            onClick={cancelTyping}
                            style={{ marginLeft: 'auto', color: '#999', padding: 0 }}
                          >
                            取消
                          </Button>
                        </div>
                        <div style={{ 
                          padding: 16, 
                          borderRadius: '0 12px 12px 12px',
                          background: 'linear-gradient(135deg, #f0f5ff, #f9f0ff)',
                          lineHeight: 1.8,
                          fontSize: 14,
                          color: '#333',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}>
                          {currentTyping}
                          <span style={{ animation: 'blink 1s infinite', opacity: currentTyping.length > 0 ? 1 : 0 }}>|</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div style={{ padding: 16 }}>
                    {chatHistory.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
                        <HistoryOutlined style={{ fontSize: 48, marginBottom: 12 }} />
                        <div>暂无历史记录</div>
                        <div style={{ fontSize: 12, marginTop: 8 }}>点击&quot;保存对话&quot;可保存当前聊天</div>
                      </div>
                    ) : (
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {chatHistory.map(item => (
                          <div 
                            key={item.id}
                            style={{ 
                              padding: 12, 
                              background: '#fafafa', 
                              borderRadius: 8,
                              cursor: 'pointer',
                              border: '1px solid #f0f0f0'
                            }}
                            onClick={() => handleLoadHistory(item)}
                            hoverStyle={{ background: '#f0f5ff', borderColor: '#1890ff' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 'bold', fontSize: 14 }}>{item.title}</div>
                                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                                  {dayjs(item.time).format('YYYY-MM-DD HH:mm')}
                                </div>
                              </div>
                              <Button 
                                type="text" 
                                danger 
                                onClick={(e) => { e.stopPropagation(); handleDeleteHistory(item.id); }}
                              >
                                删除
                              </Button>
                            </div>
                          </div>
                        ))}
                      </Space>
                    )}
                  </div>
                )}
              </div>
              
              {activeTab === 'chat' && (
                <div style={{ padding: 16, borderTop: '1px solid #f0f0f0', background: '#fff' }}>
                  {showImages.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                      {showImages.map(img => (
                        <div key={img.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', width: 80, height: 80 }}>
                          <img src={img.src} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <Button 
                            type="text" 
                            danger 
                            size="small" 
                            onClick={() => handleRemoveImage(img.id)}
                            style={{ position: 'absolute', top: 4, right: 4, padding: 0, width: 24, height: 24, background: 'rgba(0,0,0,0.5)' }}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div 
                    style={{ 
                      display: 'flex', 
                      gap: 8, 
                      alignItems: 'flex-end',
                      border: '2px dashed transparent',
                      borderRadius: 8,
                      padding: showImages.length > 0 ? 0 : 8
                    }}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#1890ff'; }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'transparent'; }}
                    onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'transparent'; handleFileUpload(e); }}
                  >
                    <Space size="small">
                      <Button 
                        type="text" 
                        icon={<PictureOutlined />}
                        onClick={() => document.getElementById('image-upload')?.click()}
                        style={{ padding: '8px 12px' }}
                      />
                      <input 
                        id="image-upload" 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </Space>
                    <TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入你的问题，AI 来帮你... (支持拖拽上传图片)"
                      style={{ flex: 1, borderRadius: 8, minHeight: 80 }}
                      size="large"
                      autoSize={{ minRows: 2, maxRows: 6 }}
                    />
                    <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} size="large">
                      发送
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        <style>{`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          @media (max-width: 768px) {
            .chat-container {
              flex-direction: column !important;
            }
            .chat-sidebar {
              width: 100% !important;
              max-width: 100% !important;
            }
            .chat-main {
              width: 100% !important;
            }
          }
        `}</style>
      </div>
    </RequireAuth>
  );
}