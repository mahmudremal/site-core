import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from './button';
import { Avatar } from './avatar';
import { AvatarImage, AvatarFallback } from './avatar';
import { Textarea } from './textarea';
import { cn } from '../../lib/utils';

export function Comments({ comments, currentUserAvatar }) {
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState(comments);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [likedComments, setLikedComments] = useState({});

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      const newComment = {
        id: `new-${Date.now()}`,
        username: 'You',
        avatar: currentUserAvatar,
        content: commentText,
        likes: 0,
        timestamp: 'Just now',
      };

      setLocalComments([newComment, ...localComments]);
      setCommentText('');
      setShowCommentBox(false);
    }
  };

  const handleLikeComment = (commentId, action) => {
    setLocalComments(
      localComments.map(comment => {
        if (comment.id === commentId) {
          const currentAction = likedComments[commentId];
          let likesChange = 0;

          if (currentAction === action) {
            // Undo the current action
            likesChange = action === 'like' ? -1 : 1;
            setLikedComments({ ...likedComments, [commentId]: null });
          } else if (currentAction === null) {
            // New action on a comment with no current action
            likesChange = action === 'like' ? 1 : -1;
            setLikedComments({ ...likedComments, [commentId]: action });
          } else {
            // Switching from like to dislike or vice versa
            likesChange = action === 'like' ? 2 : -2;
            setLikedComments({ ...likedComments, [commentId]: action });
          }

          return { ...comment, likes: comment.likes + likesChange };
        }
        return comment;
      })
    );
  };

  const Comment = ({ comment, isReply = false }) => (
    <div className={cn("flex gap-3", isReply && "ml-12 mt-3")}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.avatar} alt={comment.username} />
        <AvatarFallback>{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{comment.username}</span>
          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
        </div>
        
        <p className="mt-1 text-sm">{comment.content}</p>
        
        <div className="mt-2 flex items-center gap-2">
          <button 
            onClick={() => handleLikeComment(comment.id, 'like')}
            className={cn(
              "flex items-center gap-1 rounded-full p-1 hover:bg-muted",
              likedComments[comment.id] === 'like' && "text-blue-500"
            )}
            aria-label="Like"
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs">{comment.likes}</span>
          </button>
          
          <button 
            onClick={() => handleLikeComment(comment.id, 'dislike')}
            className={cn(
              "flex items-center gap-1 rounded-full p-1 hover:bg-muted",
              likedComments[comment.id] === 'dislike' && "text-blue-500"
            )}
            aria-label="Dislike"
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
          
          <button className="text-xs font-medium hover:bg-muted px-2 py-1 rounded">
            Reply
          </button>
        </div>
        
        {comment.replies?.map(reply => (
          <Comment key={reply.id} comment={reply} isReply />
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">{localComments.length} Comments</h3>
        
        <div className="mt-4 flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={currentUserAvatar} alt="Your avatar" />
            <AvatarFallback>YA</AvatarFallback>
          </Avatar>
          
          {showCommentBox ? (
            <form onSubmit={handleCommentSubmit} className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-20 w-full"
                autoFocus
              />
              
              <div className="mt-2 flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCommentBox(false);
                    setCommentText('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-black text-white"
                  disabled={!commentText.trim()}
                >
                  Comment
                </Button>
              </div>
            </form>
          ) : (
            <button
              className="flex-1 rounded-full bg-transparent px-4 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
              onClick={() => setShowCommentBox(true)}
            >
              Add a comment...
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        {localComments.map(comment => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}