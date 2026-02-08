import React from "react";
import {
  Home,
  BookOpen,
  FileText,
  Gift,
  Settings,
  BarChart3,
  CheckSquare,
  Code,
  Clock,
  MessageSquare,
} from "lucide-react";
import "./Sidebar.css";
import SyllabusList, { defaultSyllabus } from "./SyllabusList";

const Sidebar = ({ isOpen, activeTab, onTabChange }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "my-batch", label: "My Batch", icon: BookOpen },
    {
      id: "tests",
      label: "Tests",
      icon: BarChart3,
      description: "Practice with quizzes and tests",
    },
    {
      id: "pdf-chat",
      label: "PDF Chat",
      icon: MessageSquare,
      description: "Chat with your PDF documents",
    },
    {
      id: "save-resource",
      label: "Save Resource",
      icon: Code,
      description: "Save your resources",
    },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className={`sidebar-root${isOpen ? " open" : ""}`}>
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`sidebar-menu-btn${
                activeTab === item.id ? " active" : ""
              }`}
            >
              <Icon
                className={`sidebar-menu-icon${
                  activeTab === item.id ? " active" : ""
                }`}
              />
              {item.label}
            </button>
          );
        })}
      </nav>
      {/* Embedded syllabus / All Classes (compact view) */}
      <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#374151' }}>All Classes</h4>
        <SyllabusList chapters={defaultSyllabus} compact={true} />
      </div>
    </aside>
  );
};

export default Sidebar;
