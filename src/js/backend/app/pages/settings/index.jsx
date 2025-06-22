
import React, { useState } from "react";
import { Link } from '@common/link';
import request from "@common/request";
import { home_url, rest_url } from "@functions";
import { usePopup } from '@context/PopupProvider';
import { useTranslation } from '@context/LanguageProvider';
import { useSettings } from "@context/SettingsProvider";
import { CheckCheck, Loader, Save } from 'lucide-react';





const TabButton = ({ label, isActive, onClick }) => (
  <button
      type="button"
      className={`btn btn-outline-neutral-900 px-20 py-11 ${isActive ? '' : ''}`}
      onClick={onClick}
  >
      {label}
  </button>
);

const TabPanel = ({ children, isActive }) => (
  <div className={isActive ? '' : 'xpo_hidden'}>
      {children}
  </div>
);

export default function Settings() {
  const { __ } = useTranslation();
  const { setPopup } = usePopup();
  // Assuming useSettings provides some settings data, adjust as needed
  // const { settings } = useSettings();

  const [activeTab, setActiveTab] = useState('general');
  const [updating, setUpdating] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  const handleUpdate = (tab) => {
    setUpdating(1);
    setTimeout(() => {
      setUpdating(2);
      setTimeout(() => setUpdating(null), 1000);
    }, 3000);
  };

  return (
      <div className="card xpo_h-100 xpo_p-0 radius-12">
          <div className="card-header xpo_border-bottom bg-base py-16 px-24 xpo_flex xpo_items-center xpo_flex-wrap xpo_gap-3 xpo_justify-between">
              <div className="xpo_flex xpo_items-center xpo_flex-wrap xpo_gap-3">

                  <div className="btn-group radius-8" role="group" aria-label={__('Tab Navigation')}>
                      <TabButton
                          label={__('General')}
                          isActive={activeTab === 'general'}
                          onClick={() => handleTabChange('general')}
                      />
                      <TabButton
                          label={__('Appearance')}
                          isActive={activeTab === 'appearance'}
                          onClick={() => handleTabChange('appearance')}
                      />
                      <TabButton
                          label={__('Notifications')}
                          isActive={activeTab === 'notifications'}
                          onClick={() => handleTabChange('notifications')}
                      />
                      {/* Add more tabs as needed */}
                  </div>

              </div>

              <button className="btn btn-primary xpo_text-sm btn-sm px-12 py-12 radius-8 xpo_flex xpo_items-center xpo_gap-2" onClick={handleUpdate} >
                  { updating == 1 ? <Loader className="xpo_icon xpo_text-xl xpo_line-height-1 xpo_animate-spin" /> : (
                    updating == 2 ? <CheckCheck className="xpo_icon xpo_text-xl xpo_line-height-1" /> : <Save className="xpo_icon xpo_text-xl xpo_line-height-1" />
                  ) }
                  {__('Update')}
              </button>
          </div>

          <div className="card-body xpo_px-2 xpo_py-8">
              <TabPanel isActive={activeTab === 'general'}>
                  <div>{__('General Settings Content Goes Here.')}</div>
              </TabPanel>
              <TabPanel isActive={activeTab === 'appearance'}>
                  <div>{__('Appearance Settings Content Here.')}</div>
              </TabPanel>
              <TabPanel isActive={activeTab === 'notifications'}>
                  <div>{__('Notification Settings Will Be Displayed Here.')}</div>
              </TabPanel>
              {/* Add more TabPanel components corresponding to your tabs */}
          </div>
      </div>
  );
};