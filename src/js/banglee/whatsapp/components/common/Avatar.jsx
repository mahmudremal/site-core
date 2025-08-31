import { Users } from "lucide-react";

// Modern Avatar Component
const Avatar = ({ src, name, size = 'md', status, isGroup }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {src ? (
        <img className="rounded-full object-cover w-full h-full" src={src} alt={name} />
      ) : (
        <div className="rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center w-full h-full">
          {isGroup ? (
            <Users className="text-white w-1/2 h-1/2" />
          ) : (
            <span className="text-white font-medium text-sm">
              {name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>
      )}
      {status === 'online' && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

export default Avatar;