import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiSend,
  FiImage,
  FiMenu,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiMessageSquare,
  FiInbox,
} from 'react-icons/fi';
import webSocketService from '../../services/WebSocketService';
import './Messages.css';
import { API_URL } from '../../api/configApi';
import { showErrorToast } from '../notification/notification';
import cloudinaryConfig from '../../config/cloudinary';

const LOCAL_ID_PREFIX = 'local-';

/* ============================================================
   Helpers (hoisted — dùng chung cho cả render và WebSocket handler)
   ============================================================ */

const isImageUrl = (url) =>
  typeof url === 'string' &&
  /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);

const isLocalId = (id) => typeof id === 'string' && id.startsWith(LOCAL_ID_PREFIX);

/**
 * So khớp trùng tin nhắn giữa bản optimistic (local) và bản echo từ server.
 * - Cả hai đều có message_id thật  -> so theo id.
 * - Có một bản là optimistic       -> so theo (sender, content, thời gian gần nhau).
 */
const isDuplicateMessage = (a, b) => {
  if (!a || !b) return false;

  if (a.message_id && b.message_id && !isLocalId(a.message_id) && !isLocalId(b.message_id)) {
    return a.message_id === b.message_id;
  }

  const sameTime =
    Math.abs(new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()) < 5000;

  return a.sender_id === b.sender_id && a.content === b.content && sameTime;
};

const normalizeMessage = (msg) =>
  msg && !msg.type && isImageUrl(msg.content) ? { ...msg, type: 'image' } : msg;

const previewOf = (content) => (isImageUrl(content) ? 'Đã gửi một ảnh' : content);

const formatTime = (ts) => {
  const d = new Date(ts);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDay = (ts) => {
  const d = new Date(ts);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatConversationTime = (ts) => {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  return d.toDateString() === now.toDateString()
    ? formatTime(d)
    : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

/** Gộp tin nhắn thành danh sách item kèm vạch phân cách ngày. */
const buildChatItems = (list) => {
  const items = [];
  let lastDay = null;

  list.forEach((msg, index) => {
    const sentAt = new Date(msg.sent_at);
    const valid = !Number.isNaN(sentAt.getTime());

    if (valid && lastDay !== sentAt.toDateString()) {
      items.push({ kind: 'date', key: `date-${sentAt.toDateString()}`, label: formatDay(sentAt) });
      lastDay = sentAt.toDateString();
    }

    items.push({
      kind: 'message',
      key: msg.message_id || `${msg.sender_id}-${msg.sent_at}-${index}`,
      message: msg,
    });
  });

  return items;
};

/**
 * Server là nguồn dữ liệu chính cho unread, nhưng giữ lại số unread cục bộ
 * vừa tăng bởi WebSocket mà server chưa kịp phản ánh. Hội thoại đang mở luôn = 0.
 */
const mergeConversations = (prev, incoming, activePeerId) => {
  const prevMap = new Map(prev.map((conv) => [conv.id, conv]));

  return incoming.map((conv) => {
    const old = prevMap.get(conv.id);
    const isActive = activePeerId && activePeerId === conv.id;

    return {
      ...conv,
      unread: isActive ? 0 : Math.max(conv.unread || 0, old?.unread || 0),
    };
  });
};

/* ============================================================
   Presentational components
   ============================================================ */

const Avatar = ({ src, name, className }) => {
  const [failed, setFailed] = useState(false);
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';

  if (!src || failed) {
    return (
      <div className={`${className} avatar-fallback`} aria-hidden="true">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || 'avatar'}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

const MessageBubble = ({ msg, isMine }) => (
  <div className={`message ${isMine ? 'sent' : 'received'}`}>
    <div className="message-bubble">
      {msg.type === 'image' ? (
        <a
          className="message-image-link"
          href={msg.content}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="message-image"
            src={msg.content}
            alt="Ảnh trong hội thoại"
            loading="lazy"
          />
        </a>
      ) : (
        <p className="message-text">{msg.content}</p>
      )}
    </div>

    <span className="message-time">
      {formatTime(msg.sent_at)}
      {isMine && <FiCheck className="message-ticks" aria-label="Đã gửi" />}
    </span>
  </div>
);

const ConversationSkeleton = () => (
  <div aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="conversation-skeleton">
        <div className="skeleton-circle" />
        <div className="skeleton-lines">
          <div className="skeleton-line skeleton-line--w60" />
          <div className="skeleton-line skeleton-line--w85" />
        </div>
      </div>
    ))}
  </div>
);

const ChatSkeleton = () => (
  <div className="chat-skeleton" aria-hidden="true">
    <div className="skeleton-bubble skeleton-bubble--received" />
    <div className="skeleton-bubble skeleton-bubble--sent" />
    <div className="skeleton-bubble skeleton-bubble--received skeleton-bubble--short" />
    <div className="skeleton-bubble skeleton-bubble--sent" />
  </div>
);

/* ============================================================
   Messages
   ============================================================ */

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }, []);

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(location.state?.selectedUser || null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(location.state?.initialMessage || '');
  const [showSidebar, setShowSidebar] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [wsReady, setWsReady] = useState(webSocketService.isWebSocketConnected());

  const chatMessagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const hasAutoSentMessage = useRef(false);

  // Refs giữ giá trị mới nhất cho WebSocket handler (tránh re-subscribe liên tục)
  const selectedUserRef = useRef(selectedUser);
  const selectedConversationIdRef = useRef(selectedConversationId);
  const conversationsRef = useRef(conversations);
  const sendMessageRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  /* ---------------- Derived ---------------- */

  const chatItems = useMemo(() => buildChatItems(messages), [messages]);

  const findConversationByUserId = useCallback(
    (userId) => conversationsRef.current.find((conv) => conv.id === userId) || null,
    []
  );

  const resolveConversationId = useCallback((user) => {
    if (!user) return null;
    if (user.conversationId) return user.conversationId;
    return conversationsRef.current.find((conv) => conv.id === user.id)?.conversationId || null;
  }, []);

  const scrollToBottom = useCallback(() => {
    const box = chatMessagesRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingMessages, scrollToBottom]);

  /* ---------------- Data fetching ---------------- */

  const loadConversations = useCallback(async () => {
    const me = currentUser?.userId;
    if (!me) return [];

    try {
      const { data } = await axios.get(`${API_URL}/messages/conversations/${me}`);
      const list = Array.isArray(data) ? data : [];
      setConversations((prev) => mergeConversations(prev, list, selectedUserRef.current?.id));
      return list;
    } catch (err) {
      console.error('Error fetching conversations:', err);
      return [];
    } finally {
      setLoadingConversations(false);
    }
  }, [currentUser?.userId]);

  const loadMessages = useCallback(
    async (otherUserId) => {
      const me = currentUser?.userId;
      if (!me || !otherUserId) return;

      setLoadingMessages(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/messages/conversation/${me}/${otherUserId}`
        );
        setMessages(Array.isArray(data) ? data.map(normalizeMessage) : []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        showErrorToast('Không tải được tin nhắn. Vui lòng thử lại.');
      } finally {
        setLoadingMessages(false);
      }
    },
    [currentUser?.userId]
  );

  const markConversationRead = useCallback(
    async (conversationId) => {
      const me = currentUser?.userId;
      if (!me || !conversationId) return;

      try {
        await axios.put(`${API_URL}/messages/read/${me}/${conversationId}`);
      } catch (err) {
        console.error('Error marking conversation as read:', err);
      }
    },
    [currentUser?.userId]
  );

  /* ---------------- WebSocket (STOMP giữ nguyên) ---------------- */

  const handleNewMessage = useCallback(
    (incoming) => {
      const me = currentUser?.userId;
      if (!incoming || !me) return;

      const newMessage = normalizeMessage(incoming);
      const activeUser = selectedUserRef.current;
      const activeConvId = selectedConversationIdRef.current;

      const isForActiveUser =
        !!activeUser &&
        ((newMessage.sender_id === activeUser.id && newMessage.receiver_id === me) ||
          (newMessage.sender_id === me && newMessage.receiver_id === activeUser.id));

      const isForActiveConversation =
        !!activeConvId && newMessage.conversation_id === activeConvId;

      const isIncoming = newMessage.receiver_id === me && newMessage.sender_id !== me;

      // Chưa mở hội thoại nào -> tự động mở hội thoại của người vừa nhắn
      let autoOpened = false;
      if (!activeUser && isIncoming) {
        const peerId = newMessage.sender_id;
        const existing = findConversationByUserId(peerId);

        if (existing) {
          const convId = newMessage.conversation_id || existing.conversationId || null;
          selectedUserRef.current = existing;
          selectedConversationIdRef.current = convId;
          setSelectedUser(existing);
          setSelectedConversationId(convId);
          autoOpened = true;
        } else {
          loadConversations().then((list) => {
            const conv = list.find((c) => c.id === peerId);
            if (!conv) return;
            const convId = newMessage.conversation_id || conv.conversationId || null;
            selectedUserRef.current = conv;
            selectedConversationIdRef.current = convId;
            setSelectedUser(conv);
            setSelectedConversationId(convId);
          });
        }
      }

      const shouldShow = isForActiveUser || isForActiveConversation || autoOpened;

      // Cập nhật danh sách hội thoại (ưu tiên khớp theo conversation_id, fallback theo peer id)
      setConversations((prev) =>
        prev.map((conv) => {
          const isPeer =
            (conv.id === newMessage.sender_id && newMessage.sender_id !== me) ||
            (conv.id === newMessage.receiver_id && newMessage.receiver_id !== me);
          const sameConversation =
            !!conv.conversationId && conv.conversationId === newMessage.conversation_id;

          if (!isPeer && !sameConversation) return conv;

          return {
            ...conv,
            conversationId: conv.conversationId || newMessage.conversation_id,
            lastMessage: previewOf(newMessage.content),
            time: newMessage.sent_at,
            unread: shouldShow ? 0 : (conv.unread || 0) + 1,
          };
        })
      );

      if (!shouldShow) return;

      setMessages((prev) =>
        prev.some((msg) => isDuplicateMessage(msg, newMessage)) ? prev : [...prev, newMessage]
      );

      // Đang mở đúng hội thoại -> đánh dấu đã đọc ở server
      if (isIncoming) {
        markConversationRead(newMessage.conversation_id || activeConvId);
      }
    },
    [
      currentUser?.userId,
      findConversationByUserId,
      loadConversations,
      markConversationRead,
    ]
  );

  useEffect(() => {
    const me = currentUser?.userId;
    if (!me) {
      navigate('/auth');
      return undefined;
    }

    const setupWebSocket = () => {
      webSocketService.subscribe('messages', handleNewMessage);
      setWsReady(true);
    };

    if (!webSocketService.isWebSocketConnected()) {
      webSocketService.connect(me, setupWebSocket);
    } else {
      setupWebSocket();
    }

    loadConversations();

    return () => {
      webSocketService.unsubscribe('messages', handleNewMessage);
    };
  }, [currentUser?.userId, navigate, handleNewMessage, loadConversations]);

  /* ---------------- Selection & auto-send ---------------- */

  useEffect(() => {
    if (!selectedUser) {
      hasAutoSentMessage.current = false;
      setSelectedConversationId(null);
      setMessages([]);
      return undefined;
    }

    loadMessages(selectedUser.id);
    setShowSidebar(false);

    const initial = location.state?.initialMessage;
    if (initial && !hasAutoSentMessage.current && !message) {
      hasAutoSentMessage.current = true;
      setMessage(initial);

      const timer = setTimeout(() => {
        sendMessageRef.current?.(initial, { autoSend: true });
      }, 500);

      return () => clearTimeout(timer);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.id]);

  // Bổ sung conversationId khi danh sách hội thoại về muộn
  useEffect(() => {
    if (!selectedUser) return;
    const conv = conversations.find((item) => item.id === selectedUser.id);
    if (conv?.conversationId && conv.conversationId !== selectedConversationId) {
      setSelectedConversationId(conv.conversationId);
    }
  }, [conversations, selectedUser, selectedConversationId]);

  // Tab quay lại foreground -> đồng bộ lại dữ liệu
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) return;
      loadConversations();
      if (selectedUserRef.current) loadMessages(selectedUserRef.current.id);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadConversations, loadMessages]);

  /* ---------------- Actions ---------------- */

  const handleUserSelect = useCallback(
    (user) => {
      const convId = resolveConversationId(user);

      setSelectedUser(user);
      setSelectedConversationId(convId);
      setShowSidebar(false);
      setConversations((prev) =>
        prev.map((conv) => (conv.id === user.id ? { ...conv, unread: 0 } : conv))
      );
      markConversationRead(convId);
    },
    [resolveConversationId, markConversationRead]
  );

  const sendChatMessage = useCallback(
    async (rawContent, { autoSend = false, clearInput = true } = {}) => {
      const content = (rawContent ?? '').trim();
      const me = currentUser?.userId;

      if (!content || !selectedUser || !me) return;

      if (clearInput) setMessage('');

      const isImage = isImageUrl(content);
      const payload = {
        sender_id: me,
        receiver_id: selectedUser.id,
        content,
        sent_at: new Date().toISOString(),
      };
      if (isImage) payload.type = 'image';

      const optimistic = {
        ...payload,
        message_id: `${LOCAL_ID_PREFIX}${payload.sent_at}-${Math.random().toString(36).slice(2, 8)}`,
      };

      setMessages((prev) => [...prev, optimistic]);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedUser.id
            ? {
                ...conv,
                conversationId: conv.conversationId || selectedConversationId || undefined,
                lastMessage: previewOf(content),
                time: payload.sent_at,
                unread: 0,
              }
            : conv
        )
      );

      try {
        if (!webSocketService.isWebSocketConnected()) {
          await new Promise((resolve) => {
            webSocketService.connect(me, resolve);
          });
        }

        if (!webSocketService.sendMessage(payload)) {
          throw new Error('WebSocket publish failed');
        }

        if (autoSend && location.state?.initialMessage) {
          window.history.replaceState({}, document.title);
        }
      } catch (err) {
        console.error('Error sending message:', err);
        showErrorToast('Không gửi được tin nhắn. Vui lòng thử lại.');
        setMessages((prev) => prev.filter((msg) => msg !== optimistic));
        setMessage(content);
      }
    },
    [currentUser?.userId, selectedUser, selectedConversationId, location.state?.initialMessage]
  );

  useEffect(() => {
    sendMessageRef.current = sendChatMessage;
  }, [sendChatMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const content = message;
    if (!content.trim()) return;
    setMessage('');
    sendChatMessage(content, { clearInput: false });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showErrorToast('Vui lòng chọn tệp ảnh.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Ảnh không được vượt quá 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('api_key', cloudinaryConfig.apiKey);

      const { data } = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`,
        formData
      );

      await sendChatMessage(data.secure_url, { clearInput: false });
    } catch (err) {
      console.error('Error uploading image:', err);
      showErrorToast('Không tải được ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleCloseChat = () => {
    setSelectedUser(null);
    setShowSidebar(true);
  };

  /* ---------------- Render ---------------- */

  if (!currentUser) return null;

  const myId = currentUser.userId;
  const showConversationList = !selectedUser || showSidebar;

  return (
    <div className="messages-container">
      {showConversationList && (
        <aside className="messages-sidebar">
          <div className="messages-header">
            <h2>Tin nhắn</h2>
          </div>

          <div className="conversations-list">
            {loadingConversations && conversations.length === 0 ? (
              <ConversationSkeleton />
            ) : conversations.length === 0 ? (
              <div className="conversations-empty">
                <FiInbox aria-hidden="true" />
                <p>Chưa có hội thoại nào</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  className={`conversation-item ${selectedUser?.id === conv.id ? 'active' : ''}`}
                  onClick={() => handleUserSelect(conv)}
                >
                  <Avatar src={conv.avatar} name={conv.name} className="conversation-avatar" />

                  <div className="conversation-info">
                    <div className="conversation-top">
                      <h3 className="conversation-name">{conv.name}</h3>
                      <span className="conversation-time">
                        {formatConversationTime(conv.time)}
                      </span>
                    </div>

                    <div className="conversation-bottom">
                      <p className="conversation-last-message">
                        {conv.lastMessage ? previewOf(conv.lastMessage) : 'Bắt đầu trò chuyện'}
                      </p>
                      {conv.unread > 0 && (
                        <span className="unread-badge">{conv.unread > 9 ? '9+' : conv.unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
      )}

      <main className="messages-main">
        {selectedUser ? (
          <>
            <header className="chat-header">
              <button
                type="button"
                className="chat-back-btn"
                onClick={() => setShowSidebar(true)}
                title="Danh sách hội thoại"
                aria-label="Danh sách hội thoại"
              >
                <FiMenu />
              </button>

              <Avatar src={selectedUser.avatar} name={selectedUser.name} className="chat-avatar" />

              <div className="chat-peer">
                <h3 className="chat-peer-name">{selectedUser.name}</h3>
                <span className={`chat-status ${wsReady ? 'chat-status--on' : 'chat-status--off'}`}>
                  {wsReady ? (
                    <FiCheckCircle aria-hidden="true" />
                  ) : (
                    <span className="chat-status__pulse" aria-hidden="true" />
                  )}
                  {wsReady ? 'Đã kết nối' : 'Đang kết nối'}
                </span>
              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={handleCloseChat}
                title="Đóng hội thoại"
                aria-label="Đóng hội thoại"
              >
                <FiX />
              </button>
            </header>

            <div className="chat-messages" ref={chatMessagesRef}>
              {loadingMessages && messages.length === 0 ? (
                <ChatSkeleton />
              ) : chatItems.length === 0 ? (
                <div className="chat-empty">
                  <FiMessageSquare aria-hidden="true" />
                  <p>Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên.</p>
                </div>
              ) : (
                chatItems.map((item) =>
                  item.kind === 'date' ? (
                    <div key={item.key} className="message-date-separator">
                      <span>{item.label}</span>
                    </div>
                  ) : (
                    <MessageBubble
                      key={item.key}
                      msg={item.message}
                      isMine={item.message.sender_id === myId}
                    />
                  )
                )
              )}
            </div>

            <form className="message-input" onSubmit={handleSubmit}>
              <input
                type="text"
                className="message-input__field"
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                autoComplete="off"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="file-input-hidden"
                onChange={handleImageChange}
              />

              <button
                type="button"
                className="icon-btn icon-btn--image"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Gửi ảnh"
                aria-label="Gửi ảnh"
              >
                {uploading ? <span className="btn-spinner" aria-hidden="true" /> : <FiImage />}
              </button>

              <button
                type="submit"
                className="icon-btn icon-btn--send"
                disabled={!message.trim()}
                title="Gửi tin nhắn"
                aria-label="Gửi tin nhắn"
              >
                <FiSend />
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <FiMessageSquare className="no-chat-selected__icon" aria-hidden="true" />
            <p className="no-chat-selected__title">Chọn một hội thoại để bắt đầu</p>
            <span className="no-chat-selected__text">
              Tin nhắn trao đổi với người bán hoặc người thuê sẽ hiển thị tại đây.
            </span>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;