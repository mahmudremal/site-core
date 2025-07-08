import { useState } from 'react';
import { useParams } from 'react-router';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Play } from 'lucide-react';
import { VideoPlayer } from '../components/ui/video-player';
import { VideoCard } from '../components/ui/video-card';
import { Comments } from '../components/ui/comments';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { formatViewCount } from '../lib/format';
import { videos, recommendedVideos, comments as allComments, currentUser } from '../data/videos';
import { cn } from '../lib/utils';

export default function VideoPage() {
  const { id } = useParams();
  const video = videos.find(v => v.id === id);
  const recommended = recommendedVideos(id || '');
  const videoComments = allComments[id || ''] || [];

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likeStatus, setLikeStatus] = useState(null);

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Video not found</h1>
        <p className="mb-8">The video you're looking for doesn't exist or has been removed.</p>
        <Button className="bg-black text-white" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const handleLike = () => {
    if (likeStatus === 'like') {
      setLikeStatus(null);
    } else {
      setLikeStatus('like');
    }
  };

  const handleDislike = () => {
    if (likeStatus === 'dislike') {
      setLikeStatus(null);
    } else {
      setLikeStatus('dislike');
    }
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl overflow-hidden bg-muted">
            <VideoPlayer src={video.videoUrl} title={video.title} />
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-bold">{video.title}</h1>
            
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={video.channelAvatar} alt={video.channelName} />
                  <AvatarFallback>{video.channelName[0]}</AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-medium">{video.channelName}</h3>
                  <p className="text-sm text-muted-foreground">628K subscribers</p>
                </div>
                
                <Button
                  variant={isSubscribed ? "outline" : "default"}
                  className={cn(
                    "ml-2",
                    isSubscribed 
                      ? "border-2 border-muted hover:bg-muted" 
                      : "bg-black text-white hover:bg-gray-800"
                  )}
                  onClick={handleSubscribe}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <div className="flex rounded-full overflow-hidden border">
                  <Button
                    variant="ghost"
                    className={cn(
                      "rounded-none rounded-l-full px-4 gap-2",
                      likeStatus === 'like' && "bg-muted"
                    )}
                    onClick={handleLike}
                  >
                    <ThumbsUp className={cn(
                      "h-5 w-5",
                      likeStatus === 'like' && "fill-current"
                    )} />
                    <span>{formatViewCount(video.likes || 0)}</span>
                  </Button>
                  
                  <div className="w-px bg-border"></div>
                  
                  <Button
                    variant="ghost"
                    className={cn(
                      "rounded-none rounded-r-full px-4",
                      likeStatus === 'dislike' && "bg-muted"
                    )}
                    onClick={handleDislike}
                  >
                    <ThumbsDown className={cn(
                      "h-5 w-5",
                      likeStatus === 'dislike' && "fill-current"
                    )} />
                  </Button>
                </div>
                
                <Button variant="ghost" className="rounded-full px-4 gap-2">
                  <Share2 className="h-5 w-5" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                
                <Button variant="ghost" className="rounded-full px-4 gap-2">
                  <Download className="h-5 w-5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                
                <Button variant="ghost" className="rounded-full px-2" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{formatViewCount(video.views)} views</span>
                <span>{video.uploadedAt}</span>
                {video.category && (
                  <span className="hidden sm:inline text-muted-foreground">#{video.category}</span>
                )}
              </div>
              
              <div className="mt-2">
                <p className={cn(
                  "text-sm whitespace-pre-line",
                  !isDescriptionExpanded && "line-clamp-2"
                )}>
                  {video.description}
                </p>
                
                {video.description && video.description.length > 100 && (
                  <button
                    className="text-sm font-medium mt-1"
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  >
                    {isDescriptionExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            </div>

            <Comments 
              comments={videoComments} 
              currentUserAvatar={currentUser.avatar} 
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4">Recommended videos</h3>
          <div className="space-y-4">
            {recommended.map(video => (
              <VideoCard key={video.id} video={video} layout="row" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}