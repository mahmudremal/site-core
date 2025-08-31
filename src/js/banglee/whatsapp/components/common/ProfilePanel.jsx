// Profile Panel Component
const ProfilePanel = () => {
  const { showProfile, setShowProfile, activeChat } = useChat();

  if (!showProfile || !activeChat) return null;

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 bg-green-600 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Contact info</h3>
          <button onClick={() => setShowProfile(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col items-center p-6 border-b">
        <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mb-4">
          <User className="w-12 h-12 text-gray-500" />
        </div>
        <h2 className="text-xl font-medium">{activeChat.name}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {activeChat.isGroup ? `${activeChat.participants?.length || 0} participants` : '+880 1877-193095'}
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center p-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-600">Audio</span>
          </button>
          <button className="flex flex-col items-center p-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Video className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-600">Video</span>
          </button>
          <button className="flex flex-col items-center p-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Search className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-600">Search</span>
          </button>
        </div>

        <div className="space-y-1">
          <div className="p-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-sm">Media, links and docs</span>
              <span className="text-xs text-gray-500">123 ></span>
            </div>
          </div>
          <div className="p-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-sm">Starred messages</span>
              <span className="text-xs text-gray-500">></span>
            </div>
          </div>
          <div className="p-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-sm">Chat search</span>
              <span className="text-xs text-gray-500">></span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-1">
          <div className="p-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center">
              <Bell className="w-4 h-4 mr-3 text-gray-600" />
              <span className="text-sm">Mute notifications</span>
            </div>
          </div>
          <div className="p-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center">
              <Volume2 className="w-4 h-4 mr-3 text-gray-600" />
              <span className="text-sm">Custom notifications</span>
            </div>
          </div>
          <div className="p-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center">
              <Lock className="w-4 h-4 mr-3 text-gray-600" />
              <span className="text-sm">Encryption</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t space-y-1">
          <div className="p-3 hover:bg-red-50 cursor-pointer text-red-600">
            <div className="flex items-center">
              <Trash2 className="w-4 h-4 mr-3" />
              <span className="text-sm">Delete chat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;