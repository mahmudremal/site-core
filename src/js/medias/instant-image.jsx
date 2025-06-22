import { ArrowDownFromLine, ArrowUpFromLine, CogIcon, ExternalLink, ImageUp, LoaderCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { __ } from '../utils';
import axios from 'axios';
import request from '@common/request';

export default function InstantImage() {
  const tabs = [
    { name: __('Unsplash'), key: 'unsplash' },
    { name: __('Openverse'), key: 'openverse' },
    { name: __('Pixabay'), key: 'pixabay' },
    { name: __('Pexels'), key: 'pexels' },
    { name: __('Giphy'), key: 'giphy' },
  ];
  const blankFilters = {type: '', order: '', colors: '', search: '', category: '', orientation: '', source: 'wordpress', page: 1};

  const [editInfo, setEditInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('unsplash');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [filters, setFilters] = useState(blankFilters);

  const buildUrl = () => {
    const base = 'https://proxy.getinstantimages.com/api/';
    const version = '&version=7.0.2';

    if (activeTab === 'unsplash') {
      return `${base}unsplash?type=photos&content_filter=low&page=${filters.page}${version}`;
    }
    if (activeTab === 'openverse') {
      return `${base}openverse?type=photos&source=${filters.source}${version}`;
    }
    if (activeTab === 'pixabay') {
      return `${base}pixabay?type=photos&safesearch=true&page=${filters.page}` +
        `${filters.order ? `&order=${filters.order}` : ''}` +
        `${filters.type ? `&type=${filters.type}` : ''}` +
        `${filters.category ? `&category=${filters.category}` : ''}` +
        `${filters.colors ? `&colors=${filters.colors}` : ''}` +
        `${filters.orientation ? `&orientation=${filters.orientation}` : ''}${version}`;
    }
    if (activeTab === 'pexels') {
      if (filters.search) {
        return `${base}pexels?type=search&page=${filters.page}&term=${encodeURIComponent(filters.search)}` +
          `${filters.orientation ? `&orientation=${filters.orientation}` : ''}${version}`;
      }
      return `${base}pexels?type=photos&page=${filters.page}${version}`;
    }
    if (activeTab === 'giphy') {
      return `${base}giphy?type=photos&page=${filters.page}${version}`;
    }
    return '';
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const data = await request(buildUrl());
      setImages(data.photos || data.results || []);
    } catch (err) {
      console.error('Failed to fetch images', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [activeTab, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const upload_image = async (e, img) => {
    e.preventDefault();
    // console.log('Uploading image:', img);
    if (!img || !img.id) return;
    img.urls = img.urls || {};
    const image_url = img.urls.full || img.urls.download_url || img.urls.img;
    if (!image_url) {return;}
    setUploading({...img, up: null, down: null});
    // 
    const args = {id: img.id, url: image_url, title: img.title || '', alt: img.alt || '', caption: img.caption || '', filename: img.filename || '', extension: img.extension || 'jpg'};
    const formData = new FormData();
    Object.keys(args).forEach(key => formData.append(key, args[key]));
    axios.get(image_url, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // console.log(`Download Progress: ${percentCompleted}%`);
        setUploading(prev => ({...prev, down: percentCompleted}));
      }
    })
    .then(async res => {
      const blob_file = res.data;
      // console.log('Uploading Blob image:', blob_file);
      formData.append('media_file', blob_file, `${args.title.toLowerCase().replaceAll(' ', '-')}.${args.extension}`);
      await axios.post(`https://${location.host}/wp-json/sitecore/v1/instantimage/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
          setUploading(prev => ({...prev, up: percentCompleted}));
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(res => {
        const data = res.data;
        // wp.media.frame.close();
        // wp.media.frame.open();
        console.log(data);
        const folder = document.querySelector('.media-menu-item#menu-item-browse');
        if (!folder || folder.nodeType) {return;}
        folder.click();
      })
      .catch(error => console.error('Error uploading image:', error))
    })
    .catch(error => console.error('Error uploading image:', error))
    .finally(() => setUploading(null));
  }

  return (
    <div className="xpo_p-4">
      <div className="xpo_flex xpo_flex-wrap xpo_gap-3 xpo_items-center xpo_justify-between">
        <h2 className="xpo_text-xl xpo_font-bold xpo_mb-4">{__('Instant Image')}</h2>
        <div className="xpo_flex xpo_xpo_border-b xpo_mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setFilters(blankFilters);
              }}
              className={`xpo_tab xpo_px-4 xpo_xpo_py-2 xpo_font-medium ${activeTab === tab.key ? 'xpo_border-b-2 xpo_border-primary-500 xpo_text-primary-500' : 'xpo_text-gray-600'}`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="xpo_mb-4 xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={e => handleFilterChange('search', e.target.value)}
          className="xpo_input xpo_border xpo_p-2 xpo_w-full"
        />

        {activeTab === 'openverse' && (
          <select
            value={filters.source}
            onChange={e => handleFilterChange('source', e.target.value)}
            className="xpo_select xpo_border xpo_p-2 xpo_w-full"
          >
            {['wordpress','flickr','nasa','spacex','wikimedia'].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}

        {activeTab === 'pixabay' && (
          <>
            <select
              value={filters.order}
              onChange={e => handleFilterChange('order', e.target.value)}
              className="xpo_select xpo_border xpo_p-2 xpo_w-full"
            >
              <option value="">Order: Popular</option>
              <option value="latest">Latest</option>
            </select>
            <select
              value={filters.type}
              onChange={e => handleFilterChange('type', e.target.value)}
              className="xpo_select xpo_border xpo_p-2 xpo_w-full"
            >
              <option value="">Type: All</option>
              <option value="photo">Photo</option>
              <option value="illustration">Illustration</option>
            </select>
            <select
              value={filters.category}
              onChange={e => handleFilterChange('category', e.target.value)}
              className="xpo_select xpo_border xpo_p-2 xpo_w-full"
            >
              <option value="">Category: All</option>
              <option value="nature">Nature</option>
              <option value="people">People</option>
              <option value="technology">Technology</option>
            </select>
            <select
              value={filters.colors}
              onChange={e => handleFilterChange('colors', e.target.value)}
              className="xpo_select xpo_border xpo_p-2 xpo_w-full"
            >
              <option value="">Colors: All</option>
              <option value="grayscale">Grayscale</option>
              <option value="transparent">Transparent</option>
              <option value="red">Red</option>
              <option value="primary">Blue</option>
            </select>
          </>
        )}

        {(activeTab === 'pexels' || activeTab === 'unsplash' || activeTab === 'openverse') && (
          <select
            value={filters.orientation}
            onChange={e => handleFilterChange('orientation', e.target.value)}
            className="xpo_select xpo_border xpo_p-2 xpo_w-full"
          >
            <option value="">Orientation: All</option>
            <option value="square">Square</option>
            <option value="tall">Tall</option>
            <option value="wide">Wide</option>
            <option value="landscape">Landscape</option>
          </select>
        )}
      </div>

      {loading ? (
        <div className="xpo_text-center xpo_py-10">{__('Loading...')}</div>
      ) : (
        <div
          className="xpo_columns-2 md:xpo_columns-4 xpo_gap-4 xpo_cursor-pointer xpo_select-none"
        >
          {images.map((img, index) => (
            <div
              key={index}
              className="xpo_shadow xpo_mb-4 xpo_relative xpo_overflow-hidden group"
            >
              <img
                alt={img.alt || img.caption || img.title || ''}
                className="xpo_w-full xpo_object-cover xpo_rounded"
                src={img.url || img.src?.medium || img.src?.original || img.src || img.urls?.thumb || img.images?.img || img.full}
                style={{aspectRatio: img.dimensions.replace('x', '/')}}
              />
              <div className="xpo_absolute xpo_h-full xpo_w-full xpo_bg-gray-500/45 xpo_opacity-0 hover:xpo_opacity-100 group-hover:xpo_opacity-100 xpo_top-0 xpo_left-0 xpo_transition-opacity xpo_duration-300">
                {img?.user ? (
                  <a
                    target="_blank"
                    href={img.user?.url}
                    className="xpo_absolute xpo_bottom-0 xpo_left-0 xpo_p-2 xpo_text-white xpo_flex xpo_gap-2"
                  >
                    <img src={img.user?.photo} alt={img.user?.name} className="xpo_aspect-square xpo_h-4 xpo_rounded-lg" />
                    <span className="xpo_text-sm xpo_text-white">{img.user.name || img.user.username}</span>
                  </a>
                ) : null}
                
                {uploading?.id == img.id ? (
                  <div className="xpo_absolute xpo_flex xpo_flex-col xpo_gap-3 xpo_top-1/2 xpo_left-1/2 xpo_-translate-x-1/2 xpo_-translate-y-1/2">
                    <LoaderCircle
                      size={32}
                      role="button"
                      color={'white'}
                      className="xpo_animate-spin xpo_self-center"
                    />
                    {(uploading?.up || uploading?.down) ? (
                      <div className="xpo_flex xpo_flex-nowrap xpo_gap-2 xpo_items-center xpo_text-white">
                        {uploading?.up ? <div className="xpo_flex xpo_gap-1 xpo_items-center"><ArrowUpFromLine size={14} className={`${uploading?.up <= 99 ? 'xpo_animate-bounce' : ''}`} />{uploading?.up}%</div> : null}
                        {uploading?.down ? <div className="xpo_flex xpo_gap-1 xpo_items-center"><ArrowDownFromLine size={14} className={`${uploading?.down <= 99 ? 'xpo_animate-bounce' : ''}`} />{uploading?.down}%</div> : null}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <ImageUp
                    size={32}
                    role="button"
                    color={'white'}
                    onClick={(e) => upload_image(e, img)}
                    className="xpo_absolute xpo_top-1/2 xpo_left-1/2 xpo_-translate-x-1/2 xpo_-translate-y-1/2 xpo_p-2 xpo_rounded-lg xpo_aspect-square"
                  />
                )}
                
                <CogIcon
                  role="button"
                  color={'white'}
                  onClick={(e) => setEditInfo(img)}
                  className="xpo_absolute xpo_bottom-0 xpo_right-0 xpo_p-2 xpo_rounded-lg xpo_h-4"
                />
                <a
                  target="_blank"
                  href={img.permalink || img.url || img.link || '#'}
                  className="xpo_absolute xpo_top-0 xpo_right-0 xpo_p-2 xpo_rounded-lg xpo_h-4 xpo_aspect-square xpo_bg-transparent xpo_border-0 xpo_outline-0"
                >
                  <span className="xpo_sr-only">{__('Open Image')}</span>
                  <ExternalLink color={'white'} size={16} />
                </a>
              </div>

              {(editInfo && editInfo.id == img.id) ? (
                <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_bg-white xpo_w-full xpo_p-2">
                  <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mb-4">
                    <h2 className="xpo_text-xl xpo_font-semibold">{__('Edit Image Details')}</h2>
                    <div
                      className="xpo_w-16 xpo_h-16 xpo_rounded-md xpo_bg-cover xpo_bg-center"
                      style={{ backgroundImage: `url(${editInfo.url})` }}
                    ></div>
                  </div>

                  <div className="xpo_space-y-4">
                    <label className="xpo_block">
                      <span className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">{__('Filename:')}</span>
                      <div className="xpo_flex xpo_items-center">
                        <input
                          type="text"
                          value={editInfo.filename || ''}
                          placeholder={editInfo.filename}
                          className="xpo_flex-1 xpo_border xpo_rounded-md xpo_text-sm"
                          onChange={e => setEditInfo(prev => ({ ...prev, filename: e.target.value }))}
                        />
                        <em className="xpo_ml-2">.{editInfo.extension}</em>
                      </div>
                    </label>

                    <label className="xpo_block">
                      <span className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">{__('Title:')}</span>
                      <input
                        type="text"
                        value={editInfo.title || ''}
                        placeholder={editInfo.title}
                        className="xpo_w-full xpo_border xpo_rounded-md xpo_text-sm"
                        onChange={e => setEditInfo(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </label>

                    <label className="xpo_block">
                      <span className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">{__('Alt Text:')}</span>
                      <input
                        type="text"
                        value={editInfo.alt || ''}
                        className="xpo_w-full xpo_border xpo_rounded-md xpo_text-sm"
                        onChange={e => setEditInfo(prev => ({ ...prev, alt: e.target.value }))}
                      />
                    </label>

                    <label className="xpo_block">
                      <span className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">{__('Caption:')}</span>
                      <textarea
                        rows="4"
                        value={editInfo.caption || ''}
                        className="xpo_w-full xpo_border xpo_rounded-md xpo_text-sm"
                        onChange={e => setEditInfo(prev => ({ ...prev, caption: e.target.value }))}
                      ></textarea>
                    </label>

                    <div className="xpo_text-right">
                      <button
                        type="button"
                        onChange={e => setEditInfo(prev => ({ ...prev, caption: editInfo.attribution || '' }))}
                        className="xpo_inline-flex xpo_items-center xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-gray-200 xpo_rounded-md xpo_mr-2"
                      >
                        {__('Add Photo Attribution')}
                      </button>
                    </div>

                    <div className="xpo_flex xpo_justify-end xpo_space-x-2">
                      <button
                        type="button"
                        onClick={e => setEditInfo(null)}
                        className="xpo_inline-flex xpo_items-center xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-gray-200 xpo_rounded-md"
                      >
                        {__('Cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => upload_image(e, editInfo)}
                        className="xpo_inline-flex xpo_items-center xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_text-white xpo_bg-primary-600 hover:xpo_bg-primary-700 xpo_rounded-md"
                      >
                        {__('Upload')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

            </div>
          ))}
        </div>
      )}

      <div className="xpo_flex xpo_justify-between xpo_mt-4">
        {filters.page > 1 && (
          <button
            onClick={() => setFilters(prev => ({...prev, page: Math.max(prev.page - 1, 1)}))}
            className="xpo_button xpo_px-4 xpo_py-2 xpo_bg-gray-200 xpo_rounded hover:xpo_bg-gray-300"
          >
            {__('Previous')}
          </button>
        )}
        <button
          onClick={() => setFilters(prev => ({...prev, page: prev.page + 1}))}
          className="xpo_button xpo_px-4 xpo_py-2 xpo_bg-primary-500 xpo_text-white xpo_rounded hover:xpo_bg-primary-600"
        >
          {__('Next')}
        </button>
      </div>
    </div>
  );
}
