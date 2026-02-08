import React, { useState, useEffect } from 'react';
import { Bell, Search, Trophy, Flame, Menu, CheckSquare, LogOut } from 'lucide-react';
import { authService } from '../utils/auth';
import './Header.css';

const Header = ({ onMenuToggle, onTodoToggle }) => {
  const [user, setUser] = useState({
    name: "User",
    streak: 0,
    totalPoints: 0,
    numberOfBatchesCompleted: 0,
    avatar: null
  });
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await authService.logout();
    }
  };

  return (
    <header className="header-root">
      <div className="header-container">
        <div className="header-main">
          <div className="header-logo-menu">
            <button onClick={onMenuToggle} className="header-menu-btn" aria-label="Toggle Menu">
              <Menu size={20} />
            </button>
            <div className="header-logo">
              <span className="header-logo-text">AIcademy</span>
            </div>
          </div>
          <div className="header-search-wrap">
            <div className="header-search">
              <Search className="header-search-icon" size={20} />
              <input
                type="text"
                placeholder="Search courses, topics, or materials..."
                className="header-search-input"
              />
            </div>
          </div>
          <div className="header-actions">
            <div className="header-streak">
              <Flame size={16} />
              <span>{user.streak} Day Streak!</span>
            </div>
            <div className="header-points">
              <Trophy size={16} />
              <span>{user.totalPoints} Points</span>
            </div>
            <button className="header-bell-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="header-bell-badge">3</span>
            </button>
            <button 
              onClick={onTodoToggle} 
              className="header-todo-btn" 
              aria-label="Todo List"
              title="Open Todo List"
            >
              <CheckSquare size={20} />
            </button>
            <div className="header-user" style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="header-user-avatar" />
                ) : (
                  <div className="header-user-avatar-placeholder">{user.name.charAt(0)}</div>
                )}
                <span className="header-user-name">{user.name}</span>
              </div>
              
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: '180px',
                  zIndex: 1000
                }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#dc2626',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
