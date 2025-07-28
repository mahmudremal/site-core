import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Volume1, Maximize, Minimize, 
  Settings, SkipBack, SkipForward, RotateCcw, Maximize2,
  ChevronRight, X, Moon, Sun, Subtitles, Gauge, Clock,
  Captions,
  CaptionsOff,
  Repeat,
  Link,
  Code,
  Bug,
  HelpCircle,
  Star
} from 'lucide-react';
import { home_route, Dropdown } from '@banglee/core';
import { sprintf } from 'sprintf-js';
import { __ } from '@js/utils';
// import axios from 'axios';

const VideoPlayer = ({ video, title = '', ads = [], onAnalytics = () => {} }) => {
  const { video_url: src, thumbnail_url: poster } = video;
  const videoRef = useRef(null);
  const adVideoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState({
    quality: 'Auto (480p)',
    playbackSpeed: 1,
    subtitlesEnabled: false,
    sleepTimer: 'off',
    ambientMode: false,
    stableVolume: false,
    showSettings: false,
    adProgress: 0,
    adSkippable: false,
    watchTime: 0,
    volume: 0,
    muted: false,
    duration: 0,
    fullscreen: false,
  });
  
  // Ad states
  const [currentAd, setCurrentAd] = useState(null);
  const [adTimeLeft, setAdTimeLeft] = useState(0);
  
  // Analytics state
  const [watchTime, setWatchTime] = useState(0);
  const [analyticsData, setAnalyticsData] = useState({
    plays: 0,
    pauses: 0,
    seeks: 0,
    volumeChanges: 0,
    qualityChanges: 0,
    fullscreenToggles: 0
  });

  let controlsTimeout = useRef(null);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const trackAnalytics = (event, data = {}) => {
    const eventData = {
      event,
      timestamp: Date.now(),
      currentTime: states.currentTime,
      duration: states.duration,
      ...data
    };
    onAnalytics(eventData);
    
    if (event === 'play') setAnalyticsData(prev => ({ ...prev, plays: prev.plays + 1 }));
    if (event === 'pause') setAnalyticsData(prev => ({ ...prev, pauses: prev.pauses + 1 }));
    if (event === 'seek') setAnalyticsData(prev => ({ ...prev, seeks: prev.seeks + 1 }));
    if (event === 'quality_change') setAnalyticsData(prev => ({ ...prev, qualityChanges: prev.qualityChanges + 1 }));
    if (event === 'fullscreen_toggle') setAnalyticsData(prev => ({ ...prev, fullscreenToggles: prev.fullscreenToggles + 1 }));
    if (event === 'volume_change') setAnalyticsData(prev => ({ ...prev, volumeChanges: prev.volumeChanges + 1 }));
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (playing && !states.showSettings && !currentAd) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    const videoEl = currentAd ? adVideoRef.current : videoRef.current;
    if (currentAd) {
      if (playing) {
        videoEl.pause();
        trackAnalytics('ad_pause');
      } else {
        videoEl.play();
        trackAnalytics('ad_play');
      }
    } else {
      if (playing) {
        videoEl.pause();
        trackAnalytics('pause');
      } else {
        videoEl.play();
        trackAnalytics('play');
      }
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    const videoEl = currentAd ? adVideoRef.current : videoRef.current;
    const newMuted = !videoEl.muted; // !states.muted;
    videoEl.muted = newMuted;
    setStates(prev => ({ ...prev, muted: newMuted }));
    trackAnalytics('volume_change', { muted: newMuted });
  };

  const handleVolumeChange = (newVolume) => {
    const videoEl = currentAd ? adVideoRef.current : videoRef.current;
    videoEl.volume = newVolume;
    setStates(prev => ({ ...prev, volume: newVolume }));
    if (newVolume === 0) {
      setStates(prev => ({ ...prev, muted: true }));
      videoEl.muted = true;
    } else if (states.muted) {
      videoEl.muted = false;
      setStates(prev => ({ ...prev, muted: false }));
    }
    trackAnalytics('volume_change', { volume: newVolume });
  };

  const handleSeek = (percent) => {
    if (currentAd) return;
    const videoEl = videoRef.current;
    const newTime = (percent / 100) * videoEl.duration;
    videoEl.currentTime = newTime;
    setStates(prev => ({ ...prev, progress: percent, currentTime: newTime }));
    trackAnalytics('seek', { seekTo: newTime });
  };

  const skipTime = (seconds) => {
    if (currentAd) return;
    const videoEl = videoRef.current;
    videoEl.currentTime = Math.max(0, Math.min(videoEl.duration, videoEl.currentTime + seconds));
  };

  const toggleFullscreen = () => {
    if (!states.fullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setStates(prev => ({ ...prev, fullscreen: !prev.fullscreen }));
    trackAnalytics('fullscreen_toggle', { fullscreen: !states.fullscreen });
  };

  const changePlaybackSpeed = (speed) => {
    const videoEl = videoRef.current;
    videoEl.playbackRate = speed;
    setStates(prev => ({ ...prev, playbackSpeed: speed }));
    trackAnalytics('playback_speed_change', { speed });
  };

  const changeQuality = (newQuality) => {
    setStates(prev => ({ ...prev, quality: newQuality }));
    trackAnalytics('quality_change', { quality: newQuality });
  };

  const playAd = (ad) => {
    setStates(prev => ({ ...prev, currentAd: ad, adProgress: 0, adSkippable: false }));
    const adVideo = adVideoRef.current;
    adVideo.src = ad.src;
    adVideo.play();
    setPlaying(true);
    trackAnalytics('ad_start', { adId: ad.id });
  };

  const skipAd = () => {
    if (!states.adSkippable) return;
    setStates(prev => ({ ...prev, currentAd: null, adProgress: 0 }));
    const mainVideo = videoRef.current;
    mainVideo.play();
    trackAnalytics('ad_skip');
  };


  // Event listeners
  useEffect(() => {
    const videoEl = videoRef.current;
    const adVideoEl = adVideoRef.current;
    
    const updateProgress = () => {
      if (currentAd) {
        const adEl = adVideoEl;
        const percent = (adEl.currentTime / adEl.duration) * 100;
        setStates(prev => ({ ...prev, adProgress: percent }));
        setAdTimeLeft(Math.ceil(adEl.duration - adEl.currentTime));
        
        if (currentAd.skipAfter && adEl.currentTime >= currentAd.skipAfter) {
          setStates(prev => ({ ...prev, adSkippable: true }));
        }
      } else {
        const percent = (videoEl.currentTime / videoEl.duration) * 100;
        setStates(prev => ({ ...prev, currentTime: videoEl.currentTime, progress: percent }));
        setWatchTime(prev => prev + 0.25); // Increment every 250ms
      }
    };
    
    const updateBuffered = () => {
      if (videoEl.buffered.length > 0) {
        const bufferedPercent = (videoEl.buffered.end(0) / videoEl.duration) * 100;
        setBuffered(bufferedPercent);
      }
    };
    
    const handleLoadStart = () => setLoading(true);
    const handleCanPlay = () => setLoading(false);
    const handleLoadedMetadata = () => setStates(prev => ({ ...prev, duration: videoEl.duration }));
    
    const handleAdEnded = () => {
      setCurrentAd(null);
      setStates(prev => ({ ...prev, adProgress: 0 }));
      videoEl.play();
      trackAnalytics('ad_complete');
    };

    const interval = setInterval(updateProgress, 250);
    
    videoEl.addEventListener('loadstart', handleLoadStart);
    videoEl.addEventListener('canplay', handleCanPlay);
    videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoEl.addEventListener('progress', updateBuffered);
    adVideoEl.addEventListener('ended', handleAdEnded);
    
    return () => {
      clearInterval(interval);
      videoEl.removeEventListener('loadstart', handleLoadStart);
      videoEl.removeEventListener('canplay', handleCanPlay);
      videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoEl.removeEventListener('progress', updateBuffered);
      adVideoEl.removeEventListener('ended', handleAdEnded);
    };
  }, [currentAd]);

  // Simulate ads
  useEffect(() => {
    if (ads.length > 0 && states.currentTime > 30 && !currentAd) {
      const randomAd = ads[Math.floor(Math.random() * ads.length)];
      setTimeout(() => playAd(randomAd), 1000);
    }
  }, [Math.floor(states.currentTime / 30), ads]);


  return (
    <ContextMenu video={video} states={states} setStates={setStates} trackAnalytics={trackAnalytics}>
      <div 
        className={`xpo_relative xpo_w-full xpo_bg-black xpo_rounded-xl xpo_overflow-hidden ${states.ambientMode ? 'xpo_shadow-2xl xpo_shadow-blue-500/20' : ''}`}
        onMouseLeave={() => !states.showSettings && setShowControls(false)}
        onMouseMove={showControlsTemporarily}
      >
        {/* Main Video */}
        <video
          src={src}
          ref={videoRef}
          poster={poster}
          muted={states.muted}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className={`xpo_w-full xpo_aspect-video ${currentAd ? 'xpo_hidden' : 'xpo_block'}`}
        />
        
        {/* Ad Video */}
        <video
          ref={adVideoRef}
          muted={states.muted}
          className={`xpo_w-full xpo_aspect-video ${currentAd ? 'xpo_block' : 'xpo_hidden'}`}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="xpo_absolute xpo_inset-0 xpo_flex xpo_items-center xpo_justify-center">
            <div className="xpo_w-12 xpo_h-12 xpo_border-4 xpo_border-red-600 xpo_border-t-transparent xpo_rounded-full xpo_animate-spin"></div>
          </div>
        )}

        {/* Ad Overlay */}
        {currentAd && (
          <div className="xpo_absolute xpo_top-4 xpo_left-4 xpo_right-4 xpo_flex xpo_justify-between xpo_items-start xpo_text-white">
            <div className="xpo_bg-yellow-600 xpo_px-2 xpo_py-1 xpo_rounded xpo_text-sm xpo_font-medium">
              {sprintf(__('Ad %s %ss', 'site-core'), '•', adTimeLeft)}
            </div>
            {states.adSkippable && (
              <button
                onClick={skipAd}
                className="xpo_bg-gray-800 hover:xpo_bg-gray-700 xpo_px-3 xpo_py-1 xpo_rounded xpo_text-sm"
              >
                {__('Skip Ad', 'site-core')}
              </button>
            )}
          </div>
        )}

        {/* Analytics Overlay (top right) */}
        <div className="xpo_absolute xpo_top-4 xpo_right-4 xpo_bg-black/70 xpo_text-white xpo_p-2 xpo_rounded xpo_text-xs xpo_opacity-70">
          <div>{sprintf(__('Watch Time: %ss', 'site-core'), Math.floor(watchTime))}</div>
          <div>{sprintf(__('Plays: %s', 'site-core'), analyticsData.plays)}</div>
        </div>

        {/* Controls */}
        <div className={`xpo_absolute xpo_bottom-0 xpo_left-0 xpo_right-0 xpo_bg-gradient-to-t xpo_from-black/90 xpo_via-black/50 xpo_to-transparent xpo_p-4 xpo_transition-opacity xpo_duration-300 ${
          showControls ? 'xpo_opacity-100' : 'xpo_opacity-0'
        }`}>
          {/* Progress Bar */}
          <div className="xpo_mb-4">
            <div className="xpo_relative xpo_h-1 xpo_bg-gray-600 xpo_rounded xpo_cursor-pointer" onClick={(e) => {
              if (currentAd) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = ((e.clientX - rect.left) / rect.width) * 100;
              handleSeek(percent);
            }}>
              {/* Buffered */}
              <div 
                className="xpo_absolute xpo_h-full xpo_bg-gray-400 xpo_rounded"
                style={{ width: `${buffered}%` }}
              />
              {/* Progress */}
              <div 
                className="xpo_absolute xpo_h-full xpo_bg-red-600 xpo_rounded"
                style={{ width: `${currentAd ? states.adProgress : states.progress}%` }}
              />
              {/* Scrubber */}
              <div 
                className="xpo_absolute xpo_w-3 xpo_h-3 xpo_bg-red-600 xpo_rounded-full xpo_-top-1 xpo_transform xpo_-translate-x-1/2"
                style={{ left: `${currentAd ? states.adProgress : states.progress}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_text-white">
            <div className="xpo_flex xpo_items-center xpo_gap-4">
              <button onClick={togglePlay} className="hover:xpo_text-red-500 xpo_transition-colors">
                {playing ? <Pause className="xpo_w-6 xpo_h-6" /> : <Play className="xpo_w-6 xpo_h-6" />}
              </button>
              
              {!currentAd && (
                <>
                  <button onClick={() => skipTime(-10)} className="hover:xpo_text-red-500 xpo_transition-colors">
                    <SkipBack className="xpo_w-5 xpo_h-5" />
                  </button>
                  <button onClick={() => skipTime(10)} className="hover:xpo_text-red-500 xpo_transition-colors">
                    <SkipForward className="xpo_w-5 xpo_h-5" />
                  </button>
                </>
              )}

              <div className="xpo_flex xpo_items-center xpo_gap-2">
                <button onClick={toggleMute} className="hover:xpo_text-red-500 xpo_transition-colors">
                  {(states.muted || states.volume === 0) ? <VolumeX className="xpo_w-5 xpo_h-5" /> : (
                    (states.volume < 0.5) ? <Volume1 className="xpo_w-5 xpo_h-5" /> : <Volume2 className="xpo_w-5 xpo_h-5" />
                  )}
                </button>
                <input
                  min="0"
                  max="1"
                  step="0.1"
                  type="range"
                  value={states.volume}
                  className="xpo_w-20"
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                />
              </div>

              <div className="xpo_text-sm">
                {formatTime(states.currentTime)} / {formatTime(states.duration)}
              </div>
            </div>

            <div className="xpo_flex xpo_items-center xpo_gap-4">
              <button onClick={() => setStates(prev => ({ ...prev, subtitlesEnabled: !prev.subtitlesEnabled }))} className="hover:xpo_text-red-500 xpo_transition-colors">
                {states.subtitlesEnabled ? <Captions className="xpo_w-5 xpo_h-5" /> : <CaptionsOff className="xpo_w-5 xpo_h-5" />}
              </button>
              {!currentAd && (
                <Dropdown button={(<button className="hover:xpo_text-red-500 xpo_transition-colors"><Settings className="xpo_w-5 xpo_h-5" /></button>)} className="xpo_z-50 xpo_min-w-[120px]" pclassName="xpo_relative xpo_flex xpo_items-center">
                  <div className="xpo_absolute xpo_bottom-10 xpo_right-0 xpo_bg-gray-800 xpo_rounded-lg xpo_shadow-xl xpo_w-80 xpo_max-h-96 xpo_overflow-y-auto">
                    <div className="xpo_flex xpo_items-center xpo_justify-between xpo_p-3 xpo_border-b xpo_border-gray-700">
                      <span className="xpo_font-medium">{__('Settings', 'site-core')}</span>
                      <button>{/* onClick={() => setShowSettings(false)} */}
                        <X className="xpo_w-4 xpo_h-4" />
                      </button>
                    </div>
                    <SettingsPanel states={states} setStates={setStates} changeQuality={changeQuality} changePlaybackSpeed={changePlaybackSpeed} />
                  </div>
                </Dropdown>
              )}

              <button onClick={toggleFullscreen} className="hover:xpo_text-red-500 xpo_transition-colors">
                {states.fullscreen ? <Minimize className="xpo_w-5 xpo_h-5" /> : <Maximize className="xpo_w-5 xpo_h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Title Overlay */}
        {showControls && (
          <div className="xpo_absolute xpo_top-4 xpo_left-4 xpo_text-white">
            <h3 className="xpo_text-lg xpo_font-medium">{title}</h3>
          </div>
        )}
      </div>
    </ContextMenu>
  );
};
export default VideoPlayer;



const SettingsPanel = ({ states, setStates, changeQuality, changePlaybackSpeed }) => {
  const [panel, setPanel] = useState(null);

  if (panel === 'quality') {
    const qualities = ['Auto (480p)', '144p', '240p', '360p', '480p', '720p', '1080p'];
    return (
      <div className="xpo_space-y-1">
        <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_p-3 xpo_border-b xpo_border-gray-700">
          <button onClick={() => setPanel(null)}>
            <ChevronRight className="xpo_w-4 xpo_h-4 xpo_rotate-180" />
          </button>
          <span>{__('Quality', 'site-core')}</span>
        </div>
        {qualities.map((q) => (
          <div
            key={q}
            className={`xpo_p-3 hover:xpo_bg-gray-700 xpo_cursor-pointer ${states.quality === q ? 'xpo_text-red-500' : ''}`}
            onClick={() => {
              changeQuality(q);
              setPanel(null);
            }}
          >
            {q}
          </div>
        ))}
      </div>
    );
  }

  if (panel === 'speed') {
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    return (
      <div className="xpo_space-y-1">
        <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_p-3 xpo_border-b xpo_border-gray-700">
          <button onClick={() => setPanel(null)}>
            <ChevronRight className="xpo_w-4 xpo_h-4 xpo_rotate-180" />
          </button>
          <span>{__('Playback speed', 'site-core')}</span>
        </div>
        {speeds.map((speed) => (
          <div
            key={speed}
            className={`xpo_p-3 hover:xpo_bg-gray-700 xpo_cursor-pointer ${states.playbackSpeed === speed ? 'xpo_text-red-500' : ''}`}
            onClick={() => {
              changePlaybackSpeed(speed);
              setPanel(null);
            }}
          >
            {speed === 1 ? __('Normal', 'site-core') : `${speed}x`}
          </div>
        ))}
      </div>
    );
  }

  if (panel === 'subtitles') {
    return (
      <div className="xpo_space-y-1">
        <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_p-3 xpo_border-b xpo_border-gray-700">
          <button onClick={() => setPanel(null)}>
            <ChevronRight className="xpo_w-4 xpo_h-4 xpo_rotate-180" />
          </button>
          <span>{__('Subtitles/CC', 'site-core')}</span>
        </div>
        <div
          className={`xpo_p-3 hover:xpo_bg-gray-700 xpo_cursor-pointer ${!states.subtitlesEnabled ? 'xpo_text-red-500' : ''}`}
          onClick={() => {
            setStates(prev => ({ ...prev, subtitlesEnabled: false }));
            setPanel(null);
          }}
        >
          {__('Off', 'site-core')}
        </div>
        <div
          className={`xpo_p-3 hover:xpo_bg-gray-700 xpo_cursor-pointer ${states.subtitlesEnabled ? 'xpo_text-red-500' : ''}`}
          onClick={() => {
            setStates(prev => ({ ...prev, subtitlesEnabled: true }));
            setPanel(null);
          }}
        >
          English (auto-generated)
        </div>
      </div>
    );
  }

  if (panel === 'sleep') {
    const sleepOptions = ['off', '10 minutes', '15 minutes', '20 minutes', '30 minutes', '45 minutes', '1 hour'];
    return (
      <div className="xpo_space-y-1">
        <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_p-3 xpo_border-b xpo_border-gray-700">
          <button onClick={() => setPanel(null)}>
            <ChevronRight className="xpo_w-4 xpo_h-4 xpo_rotate-180" />
          </button>
          <span>{__('Sleep timer', 'site-core')}</span>
        </div>
        {sleepOptions.map((option) => (
          <div
            key={option}
            className={`xpo_p-3 hover:xpo_bg-gray-700 xpo_cursor-pointer ${states.sleepTimer === option ? 'xpo_text-red-500' : ''}`}
            onClick={() => {
              setStates(prev => ({ ...prev, sleepTimer: option }));
              setPanel(null);
            }}
          >
            {option === 'off' ? 'Off' : option}
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="xpo_space-y-1">
      <div 
        className="xpo_flex xpo_items-center xpo_justify-between xpo_p-3 hover:xpo_bg-gray-700 xpo_cursor-pointer"
        onClick={() => setPanel('quality')}
      >
        <div className="xpo_flex xpo_items-center xpo_gap-3">
          <Gauge className="xpo_w-4 xpo_h-4" />
          <span>{__('Quality', 'site-core')}</span>
        </div>
        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-gray-400">
          <span className="xpo_text-sm">{states.quality}</span>
          <ChevronRight className="xpo_w-4 xpo_h-4" />
        </div>
      </div>
      
      <div 
        className="xpo_flex xpo_items-center xpo_justify-between xpo_p-3 hover:xpo_bg-gray-700 xpo_cursor-pointer"
        onClick={() => setPanel('speed')}
      >
        <div className="xpo_flex xpo_items-center xpo_gap-3">
          <RotateCcw className="xpo_w-4 xpo_h-4" />
          <span>{__('Playback speed', 'site-core')}</span>
        </div>
        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-gray-400">
          <span className="xpo_text-sm">{states.playbackSpeed === 1 ? __('Normal', 'site-core') : `${states.playbackSpeed}x`}</span>
          <ChevronRight className="xpo_w-4 xpo_h-4" />
        </div>
      </div>

      <div 
        className="xpo_flex xpo_items-center xpo_justify-between xpo_p-3 hover:xpo_bg-gray-700 xpo_cursor-pointer"
        onClick={() => setPanel('subtitles')}
      >
        <div className="xpo_flex xpo_items-center xpo_gap-3">
          <Subtitles className="xpo_w-4 xpo_h-4" />
          <span>{__('Subtitles/CC (1)', 'site-core')}</span>
        </div>
        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-gray-400">
          <span className="xpo_text-sm">{states.subtitlesEnabled ? __('On', 'site-core') : __('Off', 'site-core')}</span>
          <ChevronRight className="xpo_w-4 xpo_h-4" />
        </div>
      </div>

      <div 
        className="xpo_flex xpo_items-center xpo_justify-between xpo_p-3 hover:xpo_bg-gray-700 xpo_cursor-pointer"
        onClick={() => setPanel('sleep')}
      >
        <div className="xpo_flex xpo_items-center xpo_gap-3">
          <Clock className="xpo_w-4 xpo_h-4" />
          <span>{__('Sleep timer', 'site-core')}</span>
        </div>
        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-gray-400">
          <span className="xpo_text-sm xpo_capitalize">{states.sleepTimer}</span>
          <ChevronRight className="xpo_w-4 xpo_h-4" />
        </div>
      </div>

      <div className="xpo_flex xpo_items-center xpo_justify-between xpo_p-3">
        <div className="xpo_flex xpo_items-center xpo_gap-3">
          <Volume2 className="xpo_w-4 xpo_h-4" />
          <span>{__('Stable Volume', 'site-core')}</span>
        </div>
        <button
          onClick={() => setStates(prev => ({ ...prev, stableVolume: !prev.stableVolume }))}
          className={`xpo_w-12 xpo_h-6 xpo_rounded-full xpo_relative xpo_transition-colors ${
            states.stableVolume ? 'xpo_bg-red-600' : 'xpo_bg-gray-600'
          }`}
        >
          <div className={`xpo_w-5 xpo_h-5 xpo_bg-white xpo_rounded-full xpo_absolute xpo_top-0.5 xpo_transition-transform ${
            states.stableVolume ? 'xpo_translate-x-6' : 'xpo_translate-x-0.5'
          }`} />
        </button>
      </div>

      <div className="xpo_flex xpo_items-center xpo_justify-between xpo_p-3">
        <div className="xpo_flex xpo_items-center xpo_gap-3">
          {states.ambientMode ? <Sun className="xpo_w-4 xpo_h-4" /> : <Moon className="xpo_w-4 xpo_h-4" />}
          <span>{__('Ambient mode', 'site-core')}</span>
        </div>
        <button
          onClick={() => setStates(prev => ({ ...prev, ambientMode: !prev.ambientMode }))}
          className={`xpo_w-12 xpo_h-6 xpo_rounded-full xpo_relative xpo_transition-colors ${
            states.ambientMode ? 'xpo_bg-red-600' : 'xpo_bg-gray-600'
          }`}
        >
          <div className={`xpo_w-5 xpo_h-5 xpo_bg-white xpo_rounded-full xpo_absolute xpo_top-0.5 xpo_transition-transform ${
            states.ambientMode ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
      </div>
    </div>
  );

};



import { useFloating, offset, shift, autoUpdate } from '@floating-ui/react-dom';
const ContextMenu = ({ video={video}, states = {}, setStates = () => {}, trackAnalytics = () => {}, children }) => {
  const [visible, setVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const referenceRef = useRef(null);
  const floatingRef = useRef(null);

  const { x, y, strategy, refs, update } = useFloating({
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [offset(4), shift()],
  });

  useEffect(() => {
    if (!visible || !refs.reference.current || !refs.floating.current) return;

    return autoUpdate(
      refs.reference.current,
      refs.floating.current,
      update
    );
  }, [visible, refs.reference, refs.floating, update]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        floatingRef.current &&
        !floatingRef.current.contains(event.target)
      ) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMousePosition({ x: e.clientX, y: e.clientY });
    setVisible(true);
  };

  const menuItems = [
    { text: __('Loop', 'site-core'), icon: Repeat, onClick: (e) => {setStates(prev => ({ ...prev, loop: !prev.loop }));trackAnalytics('loop_toggle', { loop: !states.loop });} },
    { text: __('Copy video URL', 'site-core'), icon: Link, onClick: (e) => {window.navigator.clipboard.writeText(home_route('bstream', `/watch/${video.id}`)).then(() => trackAnalytics('copy_link', Date.now()));} },
    { text: __('Copy video URL at current time', 'site-core'), icon: Clock, onClick: (e) => {window.navigator.clipboard.writeText(home_route('bstream', `/watch/${video.id}?t=${states.currentTime}`)).then(() => trackAnalytics('copy_link_time', Date.now()));} },
    { text: __('Copy embed code', 'site-core'), icon: Code, onClick: (e) => {window.navigator.clipboard.writeText(`<iframe src="${home_route('bstream', `/embed/${video.id}`)}" width="600" height="400"></iframe>`).then(() => trackAnalytics('copy_link_time', Date.now()));} },
    { text: __('Copy debug info', 'site-core'), icon: Bug, onClick: (e) => {window.navigator.clipboard.writeText(JSON.stringify(video)).then(() => trackAnalytics('copy_link_time', Date.now()));} },
    { text: __('Troubleshoot playback issue', 'site-core'), icon: HelpCircle, onClick: (e) => {trackAnalytics('troubleshoot', { time: Date.now() });} },
    { text: __('Stats for nerds', 'site-core'), icon: Star, onClick: (e) => {trackAnalytics('stats_for_nerds', { time: Date.now() });} },
  ];

  return (
    <div ref={referenceRef} className="xpo_relative xpo_inline-block" onContextMenu={handleContextMenu}>
      {visible && (
        <div
          ref={floatingRef}
          className="xpo_fixed xpo_bg-gray-900 xpo_text-white xpo_py-2 xpo_rounded-md xpo_shadow-lg xpo_z-50"
          style={{ top: `${mousePosition.y}px`, left: `${mousePosition.x}px` }}
        >
          {menuItems.map(({ text, icon: Icon, onClick }, index) => (
            <div
              key={index}
              onClick={(e) => {
                e.preventDefault();
                onClick(e);
                setVisible(false);
              }}
              className="xpo_flex xpo_items-center xpo_gap-3 xpo_py-2 xpo_px-4 hover:xpo_bg-gray-700 xpo_cursor-pointer"
            >
              <Icon />
              {text}
            </div>
          ))}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
