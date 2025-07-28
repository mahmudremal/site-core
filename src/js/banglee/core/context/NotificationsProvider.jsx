import React, { useState, useEffect, createContext, useContext } from 'react';
import { useSession } from './SessionProvider';
import { rest_url } from '@functions';
import request from '@common/request';

const NotificationsContext = createContext();

export default function NotificationsProvider({ children, config = {} }) {
  const { session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchNotifications = async (page = 1) => {
    if (!session?.user_id) return;
    try {
      const data = await request(rest_url(`/sitecore/v1/notifications/${session.user_id}/${page}`));
      setNotifications(data.list || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    // fetchNotifications(page);
  }, [session?.user_id, page]);

  return (
    <NotificationsContext.Provider value={{ notifications, pagination, setPage, fetchNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);