import { useState, useEffect } from 'react';
import { Search, ArrowDownFromLine, ArrowUpFromLine, CogIcon, ExternalLink, ImageUp, LoaderCircle, Mic, Ellipsis, X } from 'lucide-react';
import request from '@common/request';
import { __ } from '@js/utils';
import axios from 'axios';

import { Dropdown } from '@banglee/core';

const blankFilters = { type: 'photos', order: 'desc', colors: '', term: '', category: '', orientation: '', source: 'wordpress', page: 1, content_filter: 'low', version: '7.0.2' };

const tabs = [
  {
    name: __('Unsplash'),
    key: 'unsplash',
    filters: [
      {
        id: 'order',
        label: __('Order'),
        type: 'select',
        default: 'leatest',
        options: {
          popular: __('Popular'),
          latest: __('Latest'),
        }
      },
    ]
  },
  {
    name: __('Openverse'),
    key: 'openverse',
    filters: [
      {
        id: 'source',
        label: __('Source'),
        type: 'select',
        default: 'wordpress',
        options: {
          wordpress: __('WordPress'),
          flickr: __('Flickr'),
          nasa: __('NASA'),
          spacex: __('SpaceX'),
          wikimedia: __('Wikimedia')
        }
      },
      {
        id: 'orientation',
        label: __('Orientation'),
        type: 'select',
        default: 'all',
        options: {
          all: __('All'),
          square: __('Square'),
          tall: __('Tall'),
          wide: __('Wide'),
        }
      },
    ]
  },
  {
    name: __('Pixabay'),
    key: 'pixabay',
    filters: [
      {
        id: 'order',
        label: __('Order'),
        type: 'select',
        default: 'popular',
        options: {
          popular: __('Popular'),
          latest: __('Latest')
        }
      },
      {
        id: 'type',
        label: __('Type'),
        type: 'select',
        default: 'all',
        options: {
          all: __('All'),
          photo: __('Photo'),
          illustration: __('Illustration'),
          vector: __('Vector')
        }
      },
      {
        id: 'category',
        label: __('Category'),
        type: 'select',
        default: 'all',
        options: {
          all: __('All'),
          backgrounds: __('Backgrounds'),
          fashion: __('Fashion'),
          nature: __('Nature'),
          science: __('Science'),
          education: __('Education'),
          feelings: __('Feelings'),
          health: __('Health'),
          people: __('People'),
          religion: __('Religion'),
          places: __('Places'),
          animals: __('Animals'),
          industry: __('Industry'),
          computer: __('Computer'),
          food: __('Food'),
          sports: __('Sports'),
          transportation: __('Transportation'),
          travel: __('Travel'),
          buildings: __('Buildings'),
          business: __('Business'),
          music: __('Music'),
        }
      },
      {
        id: 'color',
        label: __('Colors'),
        type: 'select',
        default: 'all',
        options: {
          all: __('All'),
          lightgray: __('Grayscale'),
          red: __('Red'),
          orange: __('Orange'),
          yellow: __('Yellow'),
          green: __('Green'),
          turquoise: __('Turquoise'),
          blue: __('Blue'),
          darkviolet: __('Lilac'),
          pink: __('Pink'),
          white: __('White'),
          gray: __('Gray'),
          black: __('Black'),
          brown: __('Brown'),
          transparent: __('Transparent')
        }
      },
      {
        id: 'orientation',
        label: __('Orientation'),
        type: 'select',
        default: 'all',
        options: {
          all: __('All'),
          horizontal: __('Horizontal'),
          vertical: __('Vertical'),
        }
      },
    ]
  },
  {
    name: __('Pexels'),
    key: 'pexels',
    filters: [
      {
        id: 'order',
        label: __('Order'),
        type: 'select',
        default: 'curated',
        options: {
          curated: __('Curated'),
        }
      },
    ]
  },
  {
    name: __('Giphy'),
    key: 'giphy',
    filters: [
      {
        id: 'order',
        label: __('Order'),
        type: 'select',
        default: 'trending',
        options: {
          trending: __('Trending'),
        }
      },
    ]
  },
];

export default function InstantImage({ config = {} }) {
  const [activeTab, setActiveTab] = useState('unsplash');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [filters, setFilters] = useState({ ...blankFilters, term: config?.term || '' });

  const fetchImages = async () => {
    setLoading(true);
    const request_url = `https://proxy.getinstantimages.com/api/${activeTab}?${Object.keys(filters).filter(k => filters[k]).map(k => `${k}=${encodeURIComponent(filters[k])}`).join('&')}`;
    // console.log('Function called', request_url);
    request(request_url)
      .then(res => res)
      .then(data => setImages(data.photos || data.results || []))
      .catch(err => console.error('Failed to fetch images', err))
      .finally(() => setLoading(false));
  };

  const upload_image = async (e, img) => {
    e.preventDefault();
    // console.log('Uploading image:', img);
    if (!img || !img.id) return;
    img.urls = img.urls || {};
    const image_url = img.urls.full || img.urls.download_url || img.urls.img;
    if (!image_url) { return; }
    setUploading({ ...img, up: null, down: null });
    // 
    const args = { id: img.id, url: image_url, title: img.title || '', alt: img.alt || '', caption: img.caption || '', filename: img.filename || '', extension: img.extension || 'jpg' };
    const formData = new FormData();
    Object.keys(args).forEach(key => formData.append(key, args[key]));
    axios.get(image_url, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // console.log(`Download Progress: ${percentCompleted}%`);
        setUploading(prev => ({ ...prev, down: percentCompleted }));
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
            setUploading(prev => ({ ...prev, up: percentCompleted }));
          },
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
          .then(({ data }) => {
            // wp.media.frame.close();
            // wp.media.frame.open();
            // const folder = document.querySelector('.media-menu-item#menu-item-browse');
            // if (!folder || folder.nodeType) {return;}
            // folder.click();
            // 
            const mediaFrame = wp.media.frame;
            if (!mediaFrame) return;
            const attachment = wp.media.model.Attachment.get(data.attachment_id);
            attachment.fetch().then(() => {
              const state = mediaFrame.state();
              state.set('selection', new wp.media.model.Selection([attachment]));
              mediaFrame.trigger('select');
            });
            // 
          })
          .catch(error => console.error('Error uploading image:', error))
      })
      .catch(error => console.error('Error uploading image:', error))
      .finally(() => setUploading(null));
  }

  useEffect(() => {
    const timerId = setTimeout(() => fetchImages(), 1000);
    return () => clearTimeout(timerId);
  }, [filters, activeTab]);


  const ImageInfoEdit = ({ img }) => {
    const [image, setImage] = useState({ ...img, filename: img?.filename || img?.title?.toLowerCase().replaceAll(' ', '-') });

    return (
      <div className="absolute top-0 left-0 bg-white w-full h-full overflow-y-auto">
        <div className="p-2">

          <div className="flex justify-between items-center mb-4 relative">
            <h2 className="text-xl font-semibold">{__('Edit Image Details')}</h2>
            <div className="w-16 h-16 rounded-md bg-cover bg-center absolute top-0 right-0 cursor-pointer" style={{ backgroundImage: `url(${image.url || image.src?.medium || image.src?.original || image.src || image.urls?.thumb || image.images?.image || image.full})` }}></div>
          </div>

          <div className="space-y-4">

            <label className="block">
              <span className="block text-sm font-medium mb-1">{__('Filename:')}</span>
              <div className="flex items-center">
                <input
                  type="text"
                  value={image.filename || ''}
                  placeholder={image.filename}
                  className="flex-1 border rounded-md text-sm"
                  onChange={e => setImage(prev => ({ ...prev, filename: e.target.value }))}
                />
                <em className="ml-2">.{image.extension}</em>
              </div>
            </label>

            <label className="block">
              <span className="block text-sm font-medium mb-1">{__('Title:')}</span>
              <input
                type="text"
                value={image.title || ''}
                placeholder={image.title}
                className="w-full border rounded-md text-sm"
                onChange={e => setImage(prev => ({ ...prev, title: e.target.value }))}
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium mb-1">{__('Alt Text:')}</span>
              <input
                type="text"
                value={image.alt || ''}
                className="w-full border rounded-md text-sm"
                onChange={e => setImage(prev => ({ ...prev, alt: e.target.value }))}
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium mb-1">{__('Caption:')}</span>
              <textarea
                rows="4"
                value={image.caption || ''}
                className="w-full border rounded-md text-sm"
                onChange={e => setImage(prev => ({ ...prev, caption: e.target.value }))}
              ></textarea>
            </label>

            <div className="text-right">
              <button
                type="button"
                onChange={e => setImage(prev => ({ ...prev, caption: prev.attribution || '' }))}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md mr-2"
              >
                {__('Add Photo Attribution')}
              </button>
            </div>

            <div className="flex justify-end space-x-2">
              <button type="button" onClick={e => setImages(prev => prev.map(i => ({ ...i, edit: i.id == image.id ? false : i?.edit })))}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md">
                {__('Cancel')}
              </button>
              <button type="button" onClick={e => upload_image(e, image)} data-onClick={e => setImages(prev => prev.map(i => ({ ...i, pickvar: i.id == image.id ? true : i?.pickvar })))} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md">
                {__('Upload')}
              </button>
            </div>

          </div>
        </div>
      </div>
    )
  }
  const PickVariation = ({ img }) => {
    const [image, setImage] = useState({ ...img, imgsize: 'full' });

    return (
      <div className="absolute top-0 left-0 bg-white w-full h-full overflow-y-auto">
        <div className="p-2">

          <div className="flex flex-col mb-4 relative">
            <h2 className="text-xl font-semibold">{__('Select a Size Variant')}</h2>
            <p className="font-sm text-gray-500">{__('Select a maximum variation file to download.')}</p>
          </div>

          <div className="space-y-4">

            <div className="block">
              <label className="block">
                <span className="block text-sm font-medium mb-1">{__('Filename:')}</span>
                <div className="flex items-center">
                  <select
                    value={image.imgsize || ''}
                    placeholder={image.imgsize}
                    className="flex-1 border rounded-md text-sm"
                    onChange={e => setImage(prev => ({ ...prev, imgsize: e.target.value }))}
                  >
                    <option value="full">{__('Full Size')}</option>
                  </select>
                  <em className="ml-2">.{__('px')}</em>
                </div>
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <button type="button" onClick={e => setImages(prev => prev.map(i => ({ ...i, edit: i.id == image.id ? false : i?.edit })))}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md">
                {__('Cancel')}
              </button>
              <button type="button" onClick={e => setImages(prev => prev.map(i => ({ ...i, pickvar: i.id == image.id ? true : i?.pickvar })))} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md">
                {__('Upload')}
              </button>
            </div>

          </div>
        </div>
      </div>
    )
  }

  const FieldPrint = ({ row }) => {
    const [area, setArea] = useState({ ...row });

    useEffect(() => {
      if (!area?.value) return;
      setFilters(prev => ({ ...prev, [area.id]: area.value }));
    }, [area]);


    switch (area?.type) {
      case 'select':
        return (
          <label className="flex gap-2 items-center cursor-pointer relative">
            <span className="block text-sm font-sm font-thin">{area.label}</span>
            <Dropdown button={(<span className="text-gray-500 font-sm font-medium">{area.options?.[area?.value] || __('Choose')}</span>)}>
              <div className="flex flex-col p-3">
                <ul className="space-y-4 text-left text-gray-500 dark:text-gray-400">
                  {Object.keys(area.options).map(opt => (
                    <li
                      key={opt}
                      onClick={e => setArea(prev => ({ ...prev, value: opt }))}
                      className="flex items-center cursor-pointer space-x-3 rtl:space-x-reverse"
                    >
                      <svg className={`shrink-0 w-3.5 h-3.5 ${area?.value == opt ? 'text-green-500 dark:text-green-400' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5" />
                      </svg>
                      <span>{area.options[opt] || __('N/A')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Dropdown>
          </label>
        )
        break;

      default:
        return (
          <div>
            Lorem
          </div>
        )
        break;
    }
  }

  return (
    <div className="p-0">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex border-b py-2 px-4 justify-start w-full bg-[#f7f7f7] border-b-2 border-[#efefef]">
          {tabs.map((tab, tI) => (
            <button key={tI} onClick={() => { setActiveTab(tab.key); setFilters(blankFilters); }} className={`flex gap-3 items-center px-2 py-2 font-md justify-center text-gray-700 ${activeTab === tab.key ? 'bg-white border-2 border-gray-400' : 'bg-transparent'}`}>
              <svg width="20" height="20"><use xlinkHref={`#${tab.name.toLowerCase().replaceAll(' ', '-')}-icon`}></use></svg>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 mt-3">

        <div className="flex items-center justify-start gap-3 py-5 px-2">
          {tabs.find(t => t.key === activeTab).filters.map((row, i) => (
            <div key={i} className="relative flex gap-2 items-center">
              <FieldPrint row={row} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center max-w-lg mx-auto">
            <label htmlFor="freeimg-voice-search" className="sr-only">{__('Search')}</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                {filters.term ? <X role="button" onClick={e => setFilters(prev => ({ ...prev, type: 'search', term: '', page: 1 }))} className="w-4 h-4 text-gray-500 dark:text-gray-400 cursor-pointer z-10" /> : <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
              </div>
              <input
                required
                type="text"
                value={filters.term}
                id="freeimg-voice-search"
                placeholder={__('Search Mockups, Logos, Design Templates...')}
                onChange={e => setFilters(prev => ({ ...prev, type: 'search', term: e.target.value, page: 1 }))}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg min-w-full md:min-w-[400px] focus:ring-blue-500 focus:border-blue-500 block w-full !px-10 py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              <button type="button" className="absolute inset-y-0 end-0 flex items-center pe-3">
                {speaking ? (
                  <Ellipsis className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
                ) : (
                  <Mic
                    onClick={e => {
                      e.preventDefault();

                      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

                      if (!SpeechRecognition) {
                        console.warn("Speech Recognition API is not supported in this browser.");
                        return;
                      }

                      const recognition = new SpeechRecognition();
                      recognition.lang = 'en-US';
                      recognition.continuous = false;
                      recognition.interimResults = false;

                      recognition.onresult = (event) => {
                        let finalTranscript = '';
                        for (let i = event.resultIndex; i < event.results.length; ++i) {
                          if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                            setFilters(prev => ({ ...prev, type: 'search', term: finalTranscript, page: 1 }))
                          }
                        }
                        setFilters(prev => ({ ...prev, type: 'search', term: finalTranscript, page: 1 }))
                      };

                      recognition.onerror = (event) => {
                        console.error("Speech Recognition Error:", event.error);
                        setSpeaking(null);
                      };

                      recognition.onend = () => {
                        setSpeaking(null);
                      };

                      recognition.start();
                      setSpeaking(true);
                    }}
                    className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  />
                )}
              </button>
            </div>
            <button type="button" className="inline-flex items-center py-2 px-3 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
              <span>{__('Search')}</span>
            </button>
          </div>
        </div>

      </div>

      {loading ? (
        <div className="text-center py-10">{__('Loading...')}</div>
      ) : (
        <div className="columns-[2] md:columns-4 gap-2 cursor-pointer select-none px-3">
          {images.map((img, index) => (
            <div key={index} className="shadow mb-2 relative overflow-hidden group">

              <img
                alt={img.alt || img.caption || img.title || ''}
                className="w-full object-cover rounded"
                src={img.url || img.src?.medium || img.src?.original || img.src || img.urls?.thumb || img.images?.img || img.full}
                style={{ aspectRatio: img.dimensions ? img.dimensions.replace('x', '/') : 'unset' }}
              />

              <div className={`absolute h-full w-full bg-gray-500/45 opacity-0 hover:opacity-100 group-hover:opacity-100 top-0 left-0 transition-opacity duration-300 ${uploading?.id == img.id ? 'opacity-100' : ''}`}>
                {img?.user ? (
                  <a target="_blank" href={img.user?.url} className="absolute bottom-0 left-0 p-2 text-white flex gap-2">
                    <img src={img.user?.photo} alt={img.user?.name} className="aspect-square h-4 rounded-lg" />
                    <span className="text-sm text-white">{img.user.name || img.user.username}</span>
                  </a>
                ) : null}

                {uploading?.id == img.id ? (
                  <div className="absolute flex flex-col gap-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <LoaderCircle
                      size={32}
                      role="button"
                      color={'white'}
                      className="animate-spin self-center"
                    />
                    {(uploading?.up || uploading?.down) ? (
                      <div className="flex flex-nowrap gap-2 items-center text-white">
                        {uploading?.up ? <div className="flex gap-1 items-center"><ArrowUpFromLine size={14} className={`${uploading?.up <= 99 ? 'animate-bounce' : ''}`} />{uploading?.up}%</div> : null}
                        {uploading?.down ? <div className="flex gap-1 items-center"><ArrowDownFromLine size={14} className={`${uploading?.down <= 99 ? 'animate-bounce' : ''}`} />{uploading?.down}%</div> : null}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <ImageUp
                    size={32}
                    role="button"
                    color={'white'}
                    onClick={(e) => upload_image(e, img)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-lg aspect-square"
                  />
                )}

                <CogIcon role="button" color={'white'} className="absolute bottom-0 right-0 p-2 rounded-lg h-4" onClick={e => setImages(prev => prev.map(i => ({ ...i, edit: i.id == img.id ? true : i?.edit })))} />
                <a target="_blank" href={img.permalink || img.url || img.link || '#'} className="absolute top-0 right-0 p-2 rounded-lg h-4 aspect-square bg-transparent border-0 outline-0">
                  <span className="sr-only">{__('Open Image')}</span>
                  <ExternalLink color={'white'} size={16} />
                </a>
              </div>

              {img?.edit ? <ImageInfoEdit img={img} /> : null}
              {img?.pickvar ? <PickVariation img={img} /> : null}

            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-4">
        {filters.page > 1 && (
          <button onClick={() => setFilters(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))} className="button px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">{__('Previous')}</button>
        )}
        <button onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))} className="button px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600">{__('Next')}</button>
      </div>
      <InlineIcons />
    </div>
  );
}


const InlineIcons = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'none' }}>
      <symbol width="20" height="20" fill="currentColor" id="unsplash-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M10 9V0H22V9H10ZM22 14H32V32H0V14H10V23H22V14Z" fill="black"></path></symbol>
      <symbol width="20" height="20" fill="currentColor" id="openverse-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M25.8578 14.32C29.6708 14.32 32.7618 11.1144 32.7618 7.16C32.7618 3.20564 29.6708 0 25.8578 0C22.0448 0 18.9539 3.20564 18.9539 7.16C18.9539 11.1144 22.0448 14.32 25.8578 14.32Z" fill="#000000"></path><path d="M0.761841 7.16C0.761841 11.1 3.84742 14.32 7.66584 14.32V0C3.84742 0 0.761841 3.2 0.761841 7.16Z" fill="#000000"></path><path d="M9.85791 7.16C9.85791 11.1 12.9435 14.32 16.7619 14.32V0C12.9628 0 9.85791 3.2 9.85791 7.16Z" fill="#000000"></path><path d="M25.8578 31.9399C29.6708 31.9399 32.7618 28.7343 32.7618 24.78C32.7618 20.8256 29.6708 17.62 25.8578 17.62C22.0448 17.62 18.9539 20.8256 18.9539 24.78C18.9539 28.7343 22.0448 31.9399 25.8578 31.9399Z" fill="#000000"></path><path d="M9.85791 24.7801C9.85791 28.72 12.9435 31.9401 16.7619 31.9401V17.64C12.9628 17.64 9.85791 20.84 9.85791 24.7801Z" fill="#000000"></path><path d="M0.761841 24.84C0.761841 28.8 3.84742 32 7.66584 32V17.7C3.84742 17.7 0.761841 20.9 0.761841 24.84Z" fill="#000000"></path></symbol>
      <symbol width="20" height="20" fill="currentColor" id="pixabay-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_307_143)"><path d="M0 0V32H32V0H0Z" fill="#48A947"></path><path d="M6.83734 22.3147V28C5.93067 28.0427 5.02401 28.032 4.11734 27.9787C4.09601 27.7014 4.06401 27.4667 4.06401 27.2427C4.06401 23.2427 4.05334 19.2534 4.06401 15.2534C4.07467 12.032 5.97334 9.32269 8.85334 8.37335C13.1307 6.95469 17.4507 10.048 17.8453 14.3894C18.144 17.6534 16.4267 20.5547 13.568 21.7814C12.6507 22.176 11.6907 22.304 10.7093 22.304C9.45067 22.3147 8.21334 22.3147 6.83734 22.3147ZM6.84801 19.4454C8.24534 19.4454 9.54667 19.424 10.848 19.4454C13.1627 19.488 14.816 17.76 15.104 15.712C15.424 13.3654 13.7813 11.2107 11.4453 10.88H11.4347C9.25867 10.592 7.06134 12.2774 6.88001 14.528C6.74134 16.128 6.84801 17.728 6.84801 19.4454Z" fill="#F9FBF9"></path><path d="M25.4827 14.9334L30.656 22.2081H27.3067L23.4667 16.9494C22.0694 18.6881 20.9067 20.4907 19.584 22.2081H16.2454L21.408 14.9334L16.8107 8.04272H20.16L23.4454 12.9494L26.7307 8.04272H30.0694L25.4827 14.9334Z" fill="#FAFCFA"></path><path d="M6.848 19.4453C6.848 17.7279 6.74134 16.1173 6.86934 14.5386C7.05067 12.2879 9.248 10.6026 11.424 10.8906C13.7707 11.2106 15.4133 13.3653 15.0933 15.7119C14.816 17.7599 13.152 19.4879 10.8373 19.4453C9.54667 19.4239 8.24534 19.4453 6.848 19.4453Z" fill="#4AA949"></path></g><defs><clipPath id="clip0_307_143"><rect width="20" height="20" fill="white"></rect></clipPath></defs></symbol>
      <symbol width="20" height="20" fill="currentColor" id="pexels-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M2 0h28a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" fill="#05A081"></path><path d="M13 21h3.863v-3.752h1.167a3.124 3.124 0 1 0 0-6.248H13v10zm5.863 2H11V9h7.03a5.124 5.124 0 0 1 .833 10.18V23z" fill="#fff"></path></symbol>
      <symbol width="20" height="20" fill="currentColor" id="giphy-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="M4 4h20v27H4z" fill="#000"></path><g><path d="M0 3h4v29H0z" fill="#04ff8e"></path><path d="M24 11h4v21h-4z" fill="#8e2eff"></path><path d="M0 31h28v4H0z" fill="#00c5ff"></path><path d="M0 0h16v4H0z" fill="#fff152"></path><path d="M24 8V4h-4V0h-4v12h12V8" fill="#ff5b5b"></path><path d="M24 16v-4h4" fill="#551c99"></path></g><path d="M16 0v4h-4" fill="#999131"></path></g></symbol>
    </svg>
  )
}

