import { X, Search, Grid, List, Cog, Pen, Contrast } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBuilder } from './context';
import { sprintf } from 'sprintf-js';
import ReduxGenerator from './redux';

const FormGenerator = () => {
  return (
    <ReduxGenerator
      value={{tabID: sidebar.selectedTab, data: sidebar.element.data[sidebar.selectedTab]}}
      onChange={console.log}
      // onChange={({tabID, tabContent}) => {
      //   setElemConfig(prev => ({
      //     ...prev,
      //     data: {
      //       ...prev.data,
      //       [sidebar.selectedTab]: tabContent
      //     }
      //   }));
      //   setTemplate(prev => {
      //     return {
      //       ...prev,
      //       elements: [...prev.elements].map(element => {
      //         if (element.id == elemConfig.id) {
      //           return {
      //             ...element,
      //             data: Object.entries(element.data).reduce((acc, [tab_key, tab_content]) => {
      //               acc[tab_key] = tab_key == tabID ? 
      //                 Object.entries(tabContent).reduce((facc, [block_key, block_content]) => {
      //                   facc[block_key] = block_content.fields.map(i => ({id: i.id, value: i.value}));
      //                   return facc;
      //                 }, {})
      //               : tab_content;
      //               return acc;
      //             }, {})
      //           }
      //         } else {
      //           return element;
      //         }
      //       })
      //     }
      //   });
      // }}
    />
    // <div dangerouslySetInnerHTML={{__html: [sidebar.selectedTab, ...Object.keys(sidebar.element)].join('<br />')}}></div>
  )
}

export const Sidebar = () => {
  const {
    template,
    setTemplate,
    addons, setAddons,
    sidebar, setSidebar,
    get_uniqueid
  } = useBuilder();

  const [tabs, setTabs] = useState([
    {
      id: 'content',
      title: 'Content',
      icon: Pen,
      order: 0,
      blocks: []
    },
    {
      id: 'style',
      title: 'Style',
      icon: Contrast,
      order: 1,
      blocks: []
    },
    {
      id: 'advanced',
      title: 'Advanced',
      icon: Cog,
      order: 2,
      blocks: []
    },
  ]);

  const [elemConfig, setElemConfig] = useState({
    data: {
      content: {}, style: {}, advanced: {}
    }
  });

  if (!sidebar) return null;

  const AddonCard = ({ addon }) => {
    const AddonIcon = addon.get_icon();
    return (
      <div
        draggable
        onClick={() => 
          Promise.resolve()
          // .then(() => setTemplate(prev => ({...prev, elements: [...prev.elements, addon]})))
          // .then(() => setAddons(prev => prev.map(a => ({...a, selected: a.type == addon.type}))))
        }
        className={`xpo_p-4 xpo_rounded-lg xpo_border xpo_cursor-pointer xpo_transition-all xpo_select-none xpo_group ${addon.selected ? 'xpo_border-blue-500 xpo_bg-blue-50' : 'xpo_border-gray-200 xpo_hover:xpo_border-gray-300 xpo_hover:xpo_bg-gray-50'}`}
        onDragStart={(e) => {
          const data = { id: get_uniqueid(addon), type: addon.get_id(), data: {} };
          e.dataTransfer.setData("application/json", JSON.stringify(data));
        }}
      >
        <div className="xpo_flex xpo_flex-col xpo_items-start xpo_gap-3 xpo_items-center">
          {AddonIcon && <div className={`xpo_w-10 xpo_h-10 xpo_rounded-lg xpo_flex xpo_items-center xpo_justify-center ${addon.selected ? 'xpo_bg-blue-100' : 'xpo_bg-gray-100 group-hover:xpo_bg-gray-200'}`}>
            <AddonIcon size={18} className={addon.selected ? 'xpo_text-blue-600' : 'xpo_text-gray-600'} />
          </div>}
          <div className="xpo_flex-1 xpo_min-w-0 xpo_text-center">
            <h3 className="xpo_font-medium xpo_text-gray-900 xpo_text-sm xpo_mb-1">{addon.get_name()}</h3>
            <p className="xpo_text-xs xpo_text-gray-500 xpo_line-clamp-2">{addon.get_description()}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`xpo_w-80 xpo_bg-white xpo_border-r xpo_border-gray-200 xpo_flex-col xpo_h-screen xpo_overflow-x-hidden xpo_overflow-y-auto ${sidebar.visible ? 'xpo_flex' : 'xpo_hidden'}`}>
      {!sidebar.element ? (
        <div className="">
          <div className="xpo_p-6 xpo_border-b xpo_border-gray-200">
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
              <h2 className="xpo_font-semibold xpo_text-lg xpo_text-gray-900">Elements</h2>
              <button type="button" onClick={() => setSidebar(prev => ({...prev, visible: !prev.visible}))} className="xpo_p-1 xpo_hover:xpo_bg-gray-100 xpo_rounded-md xpo_transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="xpo_relative xpo_mb-4">
              <Search size={16} className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" />
              <input
                type="text"
                value={sidebar?.search??''}
                placeholder="Search elements..."
                onChange={(e) => setSidebar(prev => ({...prev, search: e.target.value}))}
                className="xpo_w-full !xpo_pl-10 xpo_pr-4 xpo_py-2 xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_text-sm xpo_focus:outline-none xpo_focus:ring-2 xpo_focus:ring-blue-500 xpo_focus:border-transparent"
              />
            </div>

          </div>

          <div className="xpo_flex-1 xpo_p-6">
            {addons.length === 0 ? (
              <div className="xpo_text-center xpo_py-8">
                <Search size={24} className="xpo_mx-auto xpo_text-gray-400 xpo_mb-2" />
                <p className="xpo_text-gray-500 xpo_text-sm">No elements found</p>
              </div>
            ) : (
              <div className="xpo_grid xpo_grid-cols-2 xpo_gap-3">
                {addons.filter(addon => addon.get_id().includes(sidebar.search)).map((addon, index) => <AddonCard key={index} addon={addon} />)}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="xpo_border-t xpo_border-gray-200">
          <div className="xpo_flex xpo_relative xpo_p-3 xpo_border-b-2 xpo_border-gray-300">
            <h3 className="xpo_font-semibold xpo_text-gray-900 xpo_text-center xpo_w-full">{sprintf('Edit %s', addons.find(a => a.get_id() == sidebar.element?.type)?.get_name()??'')}</h3>
          </div>

          <div className="xpo_mb-4 xpo_border-b xpo_border-gray-200 dark:xpo_border-gray-700">
            <div className="xpo_grid xpo_grid-cols-3 xpo_text-sm xpo_font-medium xpo_text-center" role="tablist">
              {tabs.sort((a, b) => a.order - b.order).map((tab, index) => 
                <div key={index} className="xpo_w-full" role="presentation">
                  <button type="button" role="tab" onClick={() => setSidebar(prev => ({...prev, selectedTab: tab.id}))} className={`xpo_w-full xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_p-3 xpo_gap-2 xpo_border-b-2 xpo_rounded-t-lg ${sidebar.selectedTab == tab.id ? 'xpo_text-purple-600' : ''} hover:xpo_text-purple-600 dark:xpo_text-purple-500 dark:hover:xpo_text-purple-500 ${sidebar.selectedTab == tab.id ? 'xpo_border-purple-600' : ''} dark:xpo_border-purple-500`}><tab.icon />{tab.title}</button>
                </div>
              )}
            </div>
          </div>

          {sidebar?.element && (
            <div className="xpo_space-y-3 xpo_px-2 xpo_h-full">
              <ReduxGenerator />
            </div>
          )}

        </div>
      )}
    </div>
  );
};
