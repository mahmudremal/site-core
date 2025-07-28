import React, { useState, createContext, useContext } from 'react';
import Sidebar from '../sidebar';

const BodyContext = createContext();

export default function BodyProvider({ children, config = {} }) {
  const [body, setBody] = useState(config);

  return (
    <BodyContext.Provider value={{ body, setBody }}>
      <div className="xpo_min-h-screen xpo_bg-gray-50">
        <main>
          <Sidebar>
            <div className="xpo_p-4 xpo_mx-auto xpo_flex xpo_flex-col xpo_items-center">
              {children}
            </div>
          </Sidebar>
        </main>
      </div>
    </BodyContext.Provider>
  );
}

export const useBody = () => useContext(BodyContext);