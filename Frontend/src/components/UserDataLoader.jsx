// src/components/UserDataLoader.jsx
import React, { useEffect, useState } from "react";
import { useUserData } from "../context/UserContext";
import axios from "axios";

const UserDataLoader = ({ children, onNavigate }) => {
  const { userData, setUserData } = useUserData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      const currentPage = window.location.pathname.split('/').pop() || '';
      
      // If we're on landing, login, or signup page, don't try to fetch user data
      if (currentPage === 'landing' || currentPage === 'login' || currentPage === 'signup' || !token) {
        setUserData(null);
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:1000"}/students/user`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );

        if (response.data.success) {
          setUserData(response.data.user);
          
          // Only navigate to dashboard if we're not already on a valid page
          const validPages = ['dashboard', 'my-batch', 'library', 'tests', 'opportunities', 'settings', 'leetcode', 'save-resource', 'timer'];
          if (!validPages.includes(currentPage)) {
            onNavigate("dashboard");
          }
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        
        // Clear invalid token
        localStorage.removeItem('token');
        setUserData(null);
        
        // Only redirect to login if not already on public pages
        const publicPages = ['landing', 'login', 'signup'];
        if (!publicPages.includes(currentPage)) {
          onNavigate("login");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [setUserData, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 to-purple-400">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default UserDataLoader;