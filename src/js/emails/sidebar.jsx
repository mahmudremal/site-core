import { X, Search, Grid, List, Cog, Pen, Contrast } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBuilder } from './context';
import { sprintf } from 'sprintf-js';
import ReduxGenerator from './redux';

const FormGenerator = () => {
  return (
    <ReduxGenerator
      value={{ tabID: sidebar.selectedTab, data: sidebar.element.data[sidebar.selectedTab] }}
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
        className={`p-4 rounded-lg border cursor-pointer transition-all select-none group ${addon.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
        onDragStart={(e) => {
          const data = { id: get_uniqueid(addon), type: addon.get_id(), data: {} };
          e.dataTransfer.setData("application/json", JSON.stringify(data));
        }}
      >
        <div className="flex flex-col items-start gap-3 items-center">
          {AddonIcon && <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${addon.selected ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
            <AddonIcon size={18} className={addon.selected ? 'text-blue-600' : 'text-gray-600'} />
          </div>}
          <div className="flex-1 min-w-0 text-center">
            <h3 className="font-medium text-gray-900 text-sm mb-1">{addon.get_name()}</h3>
            <p className="text-xs text-gray-500 line-clamp-2">{addon.get_description()}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-80 bg-white border-r border-gray-200 flex-col h-screen overflow-x-hidden overflow-y-auto ${sidebar.visible ? 'flex' : 'hidden'}`}>
      {!sidebar.element ? (
        <div className="">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-gray-900">Elements</h2>
              <button type="button" onClick={() => setSidebar(prev => ({ ...prev, visible: !prev.visible }))} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={sidebar?.search ?? ''}
                placeholder="Search elements..."
                onChange={(e) => setSidebar(prev => ({ ...prev, search: e.target.value }))}
                className="w-full !pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

          </div>

          <div className="flex-1 p-6">
            {addons.length === 0 ? (
              <div className="text-center py-8">
                <Search size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No elements found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {addons.filter(addon => addon.get_id().includes(sidebar.search)).map((addon, index) => <AddonCard key={index} addon={addon} />)}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="border-t border-gray-200">
          <div className="flex relative p-3 border-b-2 border-gray-300">
            <h3 className="font-semibold text-gray-900 text-center w-full">{sprintf('Edit %s', addons.find(a => a.get_id() == sidebar.element?.type)?.get_name() ?? '')}</h3>
          </div>

          <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 text-sm font-medium text-center" role="tablist">
              {tabs.sort((a, b) => a.order - b.order).map((tab, index) =>
                <div key={index} className="w-full" role="presentation">
                  <button type="button" role="tab" onClick={() => setSidebar(prev => ({ ...prev, selectedTab: tab.id }))} className={`w-full flex flex-col items-center justify-center p-3 gap-2 border-b-2 rounded-t-lg ${sidebar.selectedTab == tab.id ? 'text-purple-600' : ''} hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-500 ${sidebar.selectedTab == tab.id ? 'border-purple-600' : ''} dark:border-purple-500`}><tab.icon />{tab.title}</button>
                </div>
              )}
            </div>
          </div>

          {sidebar?.element && (
            <div className="space-y-3 px-2 h-full">
              <ReduxGenerator />
            </div>
          )}

        </div>
      )}
    </div>
  );
};
