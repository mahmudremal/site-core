import { 
    Check, CheckCheck, Clock
} from 'lucide-react';
import { useState } from 'react';


// Enhanced Message Component
const Message = ({ message }) => {
  const isSent = message.fromMe;
  const [showTime, setShowTime] = useState(false);

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} group`}>
      <div
        className={`max-w-md px-4 py-2 rounded-2xl relative ${
          isSent 
            ? 'bg-green-500 text-white rounded-br-sm' 
            : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
        } hover:shadow-md transition-shadow cursor-pointer`}
        onClick={() => setShowTime(!showTime)}
      >
        <p className="break-words">{message.body}</p>
        
        <div className={`flex justify-end items-center mt-1 space-x-1 ${isSent ? 'text-green-100' : 'text-gray-500'}`}>
          <span className="text-xs">
            {new Date(message.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isSent && (
            <>
              {message.ack === 3 && <CheckCheck size={14} className="text-blue-200" />}
              {message.ack === 2 && <CheckCheck size={14} />}
              {message.ack === 1 && <Check size={14} />}
              {message.ack === 0 && <Clock size={14} />}
            </>
          )}
        </div>
        
        {showTime && (
          <div className={`absolute ${isSent ? 'right-0' : 'left-0'} top-full mt-1 px-2 py-1 bg-black text-white text-xs rounded z-10`}>
            {new Date(message.timestamp * 1000).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
