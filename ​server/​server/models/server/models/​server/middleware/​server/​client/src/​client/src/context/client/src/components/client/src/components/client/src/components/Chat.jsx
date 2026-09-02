import React, { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const Chat = () => {
  const { user, setUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMap, setUnreadMap] = useState({});
  const [typingUser, setTypingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', { withCredentials: true });
    setSocket(newSocket);

    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));

    newSocket.emit('chat:unread');

    newSocket.on('online:count', (count) => setOnlineCount(count));
    newSocket.on('online:users', (uIds) => setOnlineUsers(uIds));

    newSocket.on('chat:unread', (unreadList) => {
      const map = {};
      unreadList.forEach(item => { map[item.userId] = item.count; });
      setUnreadMap(map);
    });

    newSocket.on('chat:unread:update', ({ userId, count }) => {
      setUnreadMap(prev => ({ ...prev, [userId]: count }));
    });

    newSocket.on('chat:typing', ({ from }) => {
      setTypingUser(from);
      setTimeout(() => setTypingUser(null), 3000);
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      if (selectedUser && (msg.sender === selectedUser._id || msg.receiver === selectedUser._id)) {
        setMessages(prev => [...prev, msg]);
        if (msg.sender === selectedUser._id) {
          socket.emit('chat:read', selectedUser._id);
        }
      }
    };

    const handleHistory = (history) => setMessages(history);

    socket.on('chat:message', handleMessage);
    socket.on('chat:history', handleHistory);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.off('chat:history', handleHistory);
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectUser = (u) => {
    setSelectedUser(u);
    if (socket) {
      socket.emit('chat:history', u._id);
      socket.emit('chat:read', u._id);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !selectedUser || !socket) return;
    socket.emit('chat:send', { to: selectedUser._id, text: inputMsg });
    setInputMsg('');
  };

  const handleInputChange = (e) => {
    setInputMsg(e.target.value);
    if (socket && selectedUser) {
      socket.emit('chat:typing', { to: selectedUser._id });
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="app-container">
    
      <div className={`sidebar ${selectedUser ? 'mobile-hidden' : ''}`}>
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="avatar">{user.name[0].toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#667781' }}>Logged in</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="online-pill">• Online: {onlineCount}</span>
            <button onClick={handleLogout} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#667781' }}>Logout</button>
          </div>
        </div>

        <div className="search-box">
          <input type="text" placeholder="Search user..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        <div className="user-list">
          {filteredUsers.map(u => {
            const isOnline = onlineUsers.includes(u._id);
            const isTyping = typingUser === u._id;
            const unreadCount = unreadMap[u._id] || 0;

            return (
              <div key={u._id} className={`user-item ${selectedUser?._id === u._id ? 'active' : ''}`} onClick={() => selectUser(u)}>
                <div className="avatar" style={{ background: isOnline ? '#00a884' : '#667781' }}>
                  {u.name[0].toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{u.name}</div>
                  <div className="user-subtext">{isTyping ? 'Typing...' : (isOnline ? 'Online' : 'Offline')}</div>
                </div>
                {unreadCount > 0 && <div className="badge">{unreadCount}</div>}
              </div>
            );
          })}
        </div>
      </div>

      
      <div className={`chat-window ${!selectedUser ? 'mobile-hidden' : ''}`}>
        {selectedUser ? (
          <>
            <div className="chat-header">
              <button className="mobile-only" onClick={() => setSelectedUser(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>←</button>
              <div className="avatar">{selectedUser.name[0].toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: '600' }}>{selectedUser.name}</div>
                <div style={{ fontSize: '12px', color: '#667781' }}>
                  {typingUser === selectedUser._id ? 'Typing...' : (onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline')}
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map(m => {
                const isMe = m.sender === user.id || m.sender === user._id;
                const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                return (
                  <div key={m._id} className={`msg-bubble ${isMe ? 'sent' : 'received'}`}>
                    <span>{m.text}</span>
                    <span className="msg-meta">
                      {time}
                      {isMe && <span className="ticks">✓✓</span>}
                    </span>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={sendMessage} className="chat-input-bar">
              <input type="text" placeholder="Type a message" value={inputMsg} onChange={handleInputChange} />
              <button type="submit" className="send-btn">➤</button>
            </form>
          </>
        ) : (
          <div className="empty-chat">
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>💬</div>
            <h2>WhatsApp Style Chat</h2>
            <p style={{ marginTop: '5px' }}>Select a user from the left to start chatting.</p>
            <span className="online-pill" style={{ marginTop: '15px' }}>Online users: {onlineCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
