import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Play, Pause, Volume2, VolumeX, Settings, Eye, EyeOff, Globe, Lock, Users, Film, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { home_route } from '@banglee/core';
import { sprintf } from 'sprintf-js';
import { __ } from '@js/utils';
import axios from 'axios';

const VideoUpload = ({ onUpload, onCancel }) => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [uploadStep, setUploadStep] = useState('select');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoDuration, setVideoDuration] = useState(0);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    privacy: 'public',
    allowComments: true,
    allowLikes: true,
    ageRestriction: false
  });

  const userId = 1;

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const categories = [
    __('Gaming', 'site-core'), __('Education', 'site-core'), __('Entertainment', 'site-core'), __('Music', 'site-core'), __('Sports', 'site-core'), 
    __('Technology', 'site-core'), __('Travel', 'site-core'), __('Cooking', 'site-core'), __('Fashion', 'site-core'), __('News', 'site-core'), __('Comedy', 'site-core'), __('Other', 'site-core'),
  ];

  const privacyOptions = [
    { value: 'public', label: __('Public', 'site-core'), icon: Globe, desc: __('Anyone can view', 'site-core') },
    { value: 'unlisted', label: __('Unlisted', 'site-core'), icon: EyeOff, desc: __('Only with link', 'site-core') },
    { value: 'private', label: __('Private', 'site-core'), icon: Lock, desc: __('Only you can view', 'site-core') }
  ];

  // File handling
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file.type.startsWith('video/')) {
      setErrors({ file: 'Please select a valid video file' });
      return;
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      setErrors({ file: 'File size must be less than 500MB' });
      return;
    }

    setErrors({});
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
    setUploadStep('preview');
  };

  const handleThumbnailSelect = (file) => {
    if (!file.type.startsWith('image/')) {
      setErrors({ thumbnail: 'Please select a valid image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors({ thumbnail: 'Image size must be less than 5MB' });
      return;
    }

    setThumbnailFile(file);
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
    setErrors(prev => ({ ...prev, thumbnail: undefined }));
  };

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload simulation
  const handleUpload = async () => {
    if (!validateForm()) return;

    setUploadStep('uploading');
    
    // Simulate upload progress
    const data = new FormData();
    // Append files
    data.append('video', videoFile);
    if (thumbnailFile) data.append('thumbnail', thumbnailFile);
    // Append metadata
    data.append('user_id', userId);
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    axios.post('/bstream/api/videos/upload', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      },
      onDownloadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Download progress:', percent);
      }
    })
    .then(res => res.data)
    .then(() => setUploadStep('complete'))
    .catch(err => console.error('Upload failed:', err.response?.data || err.message))
    .finally(() => {
      setTimeout(() => {
        if (onUpload) {
          onUpload({
            videoFile,
            thumbnailFile,
            formData,
            duration: videoDuration
          });
        }
      }, 1500);
    });
    // for (let i = 0; i <= 100; i += 10) {
    //   await new Promise(resolve => setTimeout(resolve, 200));
    //   setUploadProgress(i);
    // }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [videoPreview, thumbnailPreview]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (uploadStep === 'complete') {
    return (
      <div className="xpo_fixed xpo_inset-0 xpo_bg-black xpo_bg-opacity-50 xpo_flex xpo_items-center xpo_justify-center xpo_z-50">
        <div className="xpo_bg-white dark:xpo_bg-gray-800 xpo_rounded-2xl xpo_p-8 xpo_max-w-md xpo_w-full xpo_mx-4 xpo_text-center">
          <div className="xpo_w-16 xpo_h-16 xpo_bg-green-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_mx-auto xpo_mb-4">
            <CheckCircle className="xpo_w-8 xpo_h-8 xpo_text-green-600" />
          </div>
          <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 dark:xpo_text-white xpo_mb-2">
            {__('Upload Complete!', 'site-core')}
          </h2>
          <p className="xpo_text-gray-600 dark:xpo_text-gray-400 xpo_mb-6">
            {__('Your video has been uploaded successfully and is being processed.', 'site-core')}
          </p>
          <button
            onClick={navigate(home_route('bstream', '/my-videos'))}
            className="xpo_bg-primary-600 xpo_text-white xpo_px-6 xpo_py-2 xpo_rounded-lg hover:xpo_bg-primary-700 xpo_transition-colors"
          >
            {__('Done', 'site-core')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="xpo_fixed xpo_inset-0 xpo_bg-black xpo_bg-opacity-50 xpo_flex xpo_items-center xpo_justify-center xpo_z-50 xpo_p-4">
      <div className="xpo_bg-white dark:xpo_bg-gray-800 xpo_rounded-2xl xpo_max-w-4xl xpo_w-full xpo_max-h-[90vh] xpo_overflow-y-auto">
        {/* Header */}
        <div className="xpo_flex xpo_justify-between xpo_items-center xpo_p-6 xpo_border-b dark:xpo_border-gray-700">
          <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 dark:xpo_text-white">
            {__('Upload Video', 'site-core')}
          </h1>
          <button
            onClick={onCancel}
            className="xpo_p-2 xpo_text-gray-500 hover:xpo_text-gray-700 dark:xpo_text-gray-400 dark:hover:xpo_text-gray-200"
          >
            <X className="xpo_w-6 xpo_h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="xpo_p-6">
          {uploadStep === 'select' && (
            <div
              className={`xpo_border-2 xpo_border-dashed xpo_rounded-xl xpo_p-8 xpo_text-center xpo_transition-colors ${
                dragActive 
                  ? 'xpo_border-primary-500 xpo_bg-primary-50 dark:xpo_bg-primary-900/20' 
                  : 'xpo_border-gray-300 dark:xpo_border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Film className="xpo_w-16 xpo_h-16 xpo_text-gray-400 xpo_mx-auto xpo_mb-4" />
              <h3 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900 dark:xpo_text-white xpo_mb-2">
                {__('Select video to upload', 'site-core')}
              </h3>
              <p className="xpo_text-gray-600 dark:xpo_text-gray-400 xpo_mb-6">
                {__('Drag and drop a video file, or click to browse', 'site-core')}
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                className="xpo_hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="xpo_bg-primary-600 xpo_text-white xpo_px-6 xpo_py-3 xpo_rounded-lg hover:xpo_bg-primary-700 xpo_transition-colors xpo_flex xpo_items-center xpo_gap-2 xpo_mx-auto"
              >
                <Upload className="xpo_w-5 xpo_h-5" />
                {__('Choose File', 'site-core')}
              </button>
              
              <p className="xpo_text-sm xpo_text-gray-500 xpo_mt-4">
                {__('Supported formats: MP4, AVI, MOV, WMV (Max 500MB)', 'site-core')}
              </p>
              
              {errors.file && (
                <p className="xpo_text-red-500 xpo_text-sm xpo_mt-2 xpo_flex xpo_items-center xpo_justify-center xpo_gap-1">
                  <AlertCircle className="xpo_w-4 xpo_h-4" />
                  {errors.file}
                </p>
              )}
            </div>
          )}

          {uploadStep === 'preview' && videoPreview && (
            <div className="xpo_space-y-6">
              {/* Video Preview */}
              <div className="xpo_relative xpo_bg-black xpo_rounded-xl xpo_overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="xpo_w-full xpo_max-h-80 xpo_object-contain"
                  onLoadedMetadata={handleVideoLoad}
                />
                
                {/* Video Controls */}
                <div className="xpo_absolute xpo_bottom-4 xpo_left-4 xpo_right-4 xpo_flex xpo_items-center xpo_gap-4">
                  <button
                    onClick={togglePlay}
                    className="xpo_w-10 xpo_h-10 xpo_bg-black xpo_bg-opacity-50 xpo_text-white xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center hover:xpo_bg-opacity-75"
                  >
                    {isPlaying ? <Pause className="xpo_w-5 xpo_h-5" /> : <Play className="xpo_w-5 xpo_h-5" />}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="xpo_w-10 xpo_h-10 xpo_bg-black xpo_bg-opacity-50 xpo_text-white xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center hover:xpo_bg-opacity-75"
                  >
                    {isMuted ? <VolumeX className="xpo_w-5 xpo_h-5" /> : <Volume2 className="xpo_w-5 xpo_h-5" />}
                  </button>
                  
                  <div className="xpo_flex-1" />
                  
                  <span className="xpo_text-white xpo_text-sm xpo_bg-black xpo_bg-opacity-50 xpo_px-2 xpo_py-1 xpo_rounded">
                    {formatDuration(videoDuration)}
                  </span>
                </div>
              </div>

              {/* File Info */}
              <div className="xpo_bg-gray-50 dark:xpo_bg-gray-700 xpo_rounded-lg xpo_p-4">
                <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4 xpo_text-sm">
                  <div>
                    <span className="xpo_text-gray-600 dark:xpo_text-gray-400">{__('File Name:', 'site-core')}</span>
                    <p className="xpo_font-medium xpo_text-gray-900 dark:xpo_text-white">{videoFile?.name}</p>
                  </div>
                  <div>
                    <span className="xpo_text-gray-600 dark:xpo_text-gray-400">{__('File Size:', 'site-core')}</span>
                    <p className="xpo_font-medium xpo_text-gray-900 dark:xpo_text-white">{formatFileSize(videoFile?.size || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="xpo_flex xpo_gap-3">
                <button
                  onClick={() => setUploadStep('select')}
                  className="xpo_px-6 xpo_py-2 xpo_border xpo_border-gray-300 dark:xpo_border-gray-600 xpo_text-gray-700 dark:xpo_text-gray-300 xpo_rounded-lg hover:xpo_bg-gray-50 dark:hover:xpo_bg-gray-700"
                >
                  {__('Change Video', 'site-core')}
                </button>
                <button
                  onClick={() => setUploadStep('details')}
                  className="xpo_flex-1 xpo_bg-primary-600 xpo_text-white xpo_px-6 xpo_py-2 xpo_rounded-lg hover:xpo_bg-primary-700 xpo_transition-colors"
                >
                  {__('Next: Add Details', 'site-core')}
                </button>
              </div>
            </div>
          )}

          {uploadStep === 'details' && (
            <div className="xpo_space-y-6">
              <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-2 xpo_gap-8">
                {/* Left Column - Video Details */}
                <div className="xpo_space-y-6">
                  {/* Title */}
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 dark:xpo_text-gray-300 xpo_mb-2">
                      {__('Title *', 'site-core')}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 dark:xpo_border-gray-600 xpo_rounded-lg xpo_bg-white dark:xpo_bg-gray-700 xpo_text-gray-900 dark:xpo_text-white focus:xpo_ring-2 focus:xpo_ring-primary-500 focus:xpo_border-transparent"
                      placeholder="Enter video title"
                      maxLength={100}
                    />
                    <div className="xpo_flex xpo_justify-between xpo_mt-1">
                      {errors.title && <span className="xpo_text-red-500 xpo_text-sm">{errors.title}</span>}
                      <span className="xpo_text-gray-500 xpo_text-sm">{formData.title.length}/100</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 dark:xpo_text-gray-300 xpo_mb-2">
                      {__('Description', 'site-core')}
                    </label>
                    <textarea
                      rows={4}
                      maxLength={5000}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 dark:xpo_border-gray-600 xpo_rounded-lg xpo_bg-white dark:xpo_bg-gray-700 xpo_text-gray-900 dark:xpo_text-white focus:xpo_ring-2 focus:xpo_ring-primary-500 focus:xpo_border-transparent"
                      placeholder="Tell viewers about your video"
                    />
                    <div className="xpo_flex xpo_justify-between xpo_mt-1">
                      {errors.description && <span className="xpo_text-red-500 xpo_text-sm">{errors.description}</span>}
                      <span className="xpo_text-gray-500 xpo_text-sm">{formData.description.length}/5000</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 dark:xpo_text-gray-300 xpo_mb-2">
                      {__('Category *', 'site-core')}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 dark:xpo_border-gray-600 xpo_rounded-lg xpo_bg-white dark:xpo_bg-gray-700 xpo_text-gray-900 dark:xpo_text-white focus:xpo_ring-2 focus:xpo_ring-primary-500 focus:xpo_border-transparent"
                    >
                      <option value="">{__('Select a category', 'site-core')}</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <span className="xpo_text-red-500 xpo_text-sm xpo_mt-1 xpo_block">{errors.category}</span>}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 dark:xpo_text-gray-300 xpo_mb-2">
                      {__('Tags', 'site-core')}
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 dark:xpo_border-gray-600 xpo_rounded-lg xpo_bg-white dark:xpo_bg-gray-700 xpo_text-gray-900 dark:xpo_text-white focus:xpo_ring-2 focus:xpo_ring-primary-500 focus:xpo_border-transparent"
                      placeholder="Separate tags with commas"
                    />
                    <p className="xpo_text-gray-500 xpo_text-sm xpo_mt-1">
                      {__('Use relevant tags to help people find your video', 'site-core')}
                    </p>
                  </div>
                </div>

                {/* Right Column - Thumbnail & Settings */}
                <div className="xpo_space-y-6">
                  {/* Thumbnail */}
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 dark:xpo_text-gray-300 xpo_mb-2">
                      {__('Thumbnail', 'site-core')}
                    </label>
                    <div className="xpo_border-2 xpo_border-dashed xpo_border-gray-300 dark:xpo_border-gray-600 xpo_rounded-lg xpo_p-4 xpo_text-center">
                      {thumbnailPreview ? (
                        <div className="xpo_relative">
                          <img 
                            src={thumbnailPreview}
                            alt={__('Thumbnail', 'site-core')}
                            className="xpo_w-full xpo_h-32 xpo_object-cover xpo_rounded-lg"
                          />
                          <button
                            onClick={() => {
                              setThumbnailFile(null);
                              setThumbnailPreview(null);
                            }}
                            className="xpo_absolute xpo_top-2 xpo_right-2 xpo_w-6 xpo_h-6 xpo_bg-red-500 xpo_text-white xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center"
                          >
                            <X className="xpo_w-4 xpo_h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="xpo_w-8 xpo_h-8 xpo_text-gray-400 xpo_mx-auto xpo_mb-2" />
                          <p className="xpo_text-sm xpo_text-gray-600 dark:xpo_text-gray-400 xpo_mb-2">
                            {__('Upload a custom thumbnail', 'site-core')}
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            className="xpo_hidden"
                            ref={thumbnailInputRef}
                            onChange={(e) => e.target.files[0] && handleThumbnailSelect(e.target.files[0])}
                          />
                          <button
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="xpo_text-primary-600 hover:xpo_text-primary-700 xpo_text-sm xpo_font-medium"
                          >
                            {__('Choose Image', 'site-core')}
                          </button>
                        </>
                      )}
                    </div>
                    {errors.thumbnail && (
                      <p className="xpo_text-red-500 xpo_text-sm xpo_mt-1">{errors.thumbnail}</p>
                    )}
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 dark:xpo_text-gray-300 xpo_mb-3">
                      Privacy
                    </label>
                    <div className="xpo_space-y-2">
                      {privacyOptions.map(option => {
                        const IconComponent = option.icon;
                        return (
                          <label key={option.value} className="xpo_flex xpo_items-center xpo_p-3 xpo_border xpo_border-gray-200 dark:xpo_border-gray-600 xpo_rounded-lg xpo_cursor-pointer hover:xpo_bg-gray-50 dark:hover:xpo_bg-gray-700">
                            <input
                              type="radio"
                              name="privacy"
                              value={option.value}
                              checked={formData.privacy === option.value}
                              onChange={(e) => setFormData(prev => ({ ...prev, privacy: e.target.value }))}
                              className="xpo_mr-3"
                            />
                            <IconComponent className="xpo_w-5 xpo_h-5 xpo_text-gray-500 xpo_mr-3" />
                            <div>
                              <p className="xpo_font-medium xpo_text-gray-900 dark:xpo_text-white">{option.label}</p>
                              <p className="xpo_text-sm xpo_text-gray-500">{option.desc}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Settings */}
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 dark:xpo_text-gray-300 xpo_mb-3">
                      {__('Additional Settings', 'site-core')}
                    </label>
                    <div className="xpo_space-y-3">
                      <label className="xpo_flex xpo_items-center">
                        <input
                          type="checkbox"
                          className="xpo_mr-3"
                          checked={formData.allowComments}
                          onChange={(e) => setFormData(prev => ({ ...prev, allowComments: e.target.checked }))}
                        />
                        <span className="xpo_text-gray-700 dark:xpo_text-gray-300">{__('Allow comments', 'site-core')}</span>
                      </label>
                      
                      <label className="xpo_flex xpo_items-center">
                        <input
                          type="checkbox"
                          checked={formData.allowLikes}
                          onChange={(e) => setFormData(prev => ({ ...prev, allowLikes: e.target.checked }))}
                          className="xpo_mr-3"
                        />
                        <span className="xpo_text-gray-700 dark:xpo_text-gray-300">{__('Allow likes and dislikes', 'site-core')}</span>
                      </label>
                      
                      <label className="xpo_flex xpo_items-center">
                        <input
                          type="checkbox"
                          checked={formData.ageRestriction}
                          onChange={(e) => setFormData(prev => ({ ...prev, ageRestriction: e.target.checked }))}
                          className="xpo_mr-3"
                        />
                        <span className="xpo_text-gray-700 dark:xpo_text-gray-300">{__('Age restriction (18+)', 'site-core')}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="xpo_flex xpo_gap-3 xpo_pt-6 xpo_border-t dark:xpo_border-gray-700">
                <button
                  onClick={() => setUploadStep('preview')}
                  className="xpo_px-6 xpo_py-2 xpo_border xpo_border-gray-300 dark:xpo_border-gray-600 xpo_text-gray-700 dark:xpo_text-gray-300 xpo_rounded-lg hover:xpo_bg-gray-50 dark:hover:xpo_bg-gray-700"
                >
                  {__('Back', 'site-core')}
                </button>
                <button
                  onClick={handleUpload}
                  className="xpo_flex-1 xpo_bg-primary-600 xpo_text-white xpo_px-6 xpo_py-2 xpo_rounded-lg hover:xpo_bg-primary-700 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_gap-2"
                >
                  <Upload className="xpo_w-5 xpo_h-5" />
                  {__('Upload Video', 'site-core')}
                </button>
              </div>
            </div>
          )}

          {uploadStep === 'uploading' && (
            <div className="xpo_text-center xpo_py-12">
              <div className="xpo_w-16 xpo_h-16 xpo_bg-primary-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_mx-auto xpo_mb-4">
                <Loader2 className="xpo_w-8 xpo_h-8 xpo_text-primary-600 xpo_animate-spin" />
              </div>
              <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 dark:xpo_text-white xpo_mb-2">
                {__('Uploading...', 'site-core')}
              </h2>
              <p className="xpo_text-gray-600 dark:xpo_text-gray-400 xpo_mb-6">
                {__('Please wait while your video is being uploaded.', 'site-core')}
              </p>
              <div className="xpo_w-full xpo_bg-gray-200 dark:xpo_bg-gray-700 xpo_rounded-full xpo_h-4 xpo_overflow-hidden">
                <div
                  className="xpo_bg-primary-600 xpo_h-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="xpo_text-sm xpo_text-gray-500 xpo_mt-2">
                {sprintf(__('Uploading %d%%', 'site-core'), uploadProgress)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;
