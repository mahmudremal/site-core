import axios from 'axios';
import { List } from 'lucide-react';
import { useEffect, useState } from 'react';
import BaseAddon from './base-addon';

class BasicPosts extends BaseAddon {
    constructor() {
        super();
    }

    get_id() {
        return 'basic-posts';
    }

    get_name() {
        return 'Posts';
    }

    get_icon() {
        return List;
    }

    get_category() {
        return 'basic';
    }

    get_description() {
        return 'Display posts from WordPress or any CPT';
    }

    get_settings() {
        return {
            content: {
                query: {
                    title: 'Query Settings',
                    description: 'Configure post query and source',
                    fields: [
                        {
                            id: 'postType',
                            type: 'select',
                            label: 'Post Type',
                            description: 'Choose CPT to fetch from',
                            value: 'post',
                            options: [
                                { value: 'post', label: 'Posts' },
                                { value: 'page', label: 'Pages' }
                            ]
                        },
                        {
                            id: 'postsPerPage',
                            type: 'number',
                            label: 'Number of Posts to Display',
                            value: 3
                        },
                        {
                            id: 'order',
                            type: 'select',
                            label: 'Order',
                            value: 'DESC',
                            options: [
                                { value: 'DESC', label: 'Descending' },
                                { value: 'ASC', label: 'Ascending' }
                            ]
                        },
                        {
                            id: 'orderby',
                            type: 'select',
                            label: 'Order By',
                            value: 'date',
                            options: [
                                { value: 'date', label: 'Date' },
                                { value: 'title', label: 'Title' },
                                { value: 'rand', label: 'Random' }
                            ]
                        }
                    ]
                }
            },
            style: {
                layout: {
                    title: 'Layout',
                    description: 'Configure display',
                    fields: [
                        {
                            id: 'layout',
                            type: 'select',
                            label: 'Layout Type',
                            value: 'grid',
                            options: [
                                { value: 'grid', label: 'Grid' },
                                { value: 'list', label: 'List' }
                            ]
                        },
                        {
                            id: 'columns',
                            type: 'select',
                            label: 'Grid Columns',
                            value: 3,
                            options: [1, 2, 3, 4, 5, 6].map(v => ({ value: v, label: `${v} Columns` }))
                        },
                        {
                            id: 'gap',
                            type: 'text',
                            label: 'Grid Gap',
                            value: '20px'
                        }
                    ]
                },
                titleTypography: {
                    title: 'Title Typography',
                    description: 'Style for post titles',
                    fields: [
                        { id: 'fontSize', type: 'text', label: 'Font Size', value: '20px' },
                        { id: 'color', type: 'text', label: 'Color', value: '#333' },
                        { id: 'fontWeight', type: 'select', label: 'Font Weight', value: 'bold', options: [
                            { value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Bold' }, { value: '300', label: '300' }, { value: '400', label: '400' }, { value: '500', label: '500' }, { value: '600', label: '600' }, { value: '700', label: '700' }
                        ]},
                        { id: 'lineHeight', type: 'text', label: 'Line Height', value: '1.2' },
                        { id: 'marginBottom', type: 'text', label: 'Margin Bottom', value: '10px' }
                    ]
                },
                excerptTypography: {
                    title: 'Excerpt Typography',
                    description: 'Style for post excerpts',
                    fields: [
                        { id: 'fontSize', type: 'text', label: 'Font Size', value: '14px' },
                        { id: 'color', type: 'text', label: 'Color', value: '#666' },
                        { id: 'lineHeight', type: 'text', label: 'Line Height', value: '1.5' }
                    ]
                },
                metaTypography: {
                    title: 'Meta Typography',
                    description: 'Style for post meta (date, author)',
                    fields: [
                        { id: 'fontSize', type: 'text', label: 'Font Size', value: '12px' },
                        { id: 'color', type: 'text', label: 'Color', value: '#888' },
                        { id: 'marginBottom', type: 'text', label: 'Margin Bottom', value: '5px' }
                    ]
                },
                itemStyle: {
                    title: 'Post Item Style',
                    description: 'Styling for individual post cards',
                    fields: [
                        { id: 'backgroundColor', type: 'text', label: 'Background Color', value: '#ffffff' },
                        { id: 'padding', type: 'text', label: 'Padding', value: '16px' },
                        { id: 'border', type: 'text', label: 'Border', value: '1px solid #eee' },
                        { id: 'borderRadius', type: 'text', label: 'Border Radius', value: '4px' }
                    ]
                }
            },
            advanced: {
                display: {
                    title: 'Display Options',
                    description: 'Toggle visibility of post parts',
                    fields: [
                        {
                            id: 'showImage',
                            type: 'checkbox',
                            label: 'Show Featured Image',
                            value: true
                        },
                        {
                            id: 'showTitle',
                            type: 'checkbox',
                            label: 'Show Title',
                            value: true
                        },
                        {
                            id: 'showExcerpt',
                            type: 'checkbox',
                            label: 'Show Excerpt',
                            value: true
                        },
                        {
                            id: 'showMeta',
                            type: 'checkbox',
                            label: 'Show Meta (Date/Author)',
                            value: false
                        }
                    ]
                }
            }
        };
    }

    render({ element }) {
        const [posts, setPosts] = useState([]);

        const getValue = (group, id, def = '') => {
            const f = group.fields.find(f => f.id === id);
            return f?.value ?? def;
        };

        const query = element.data.content?.query || [];
        const layout = element.data.style?.layout || [];
        const display = element.data.advanced?.display || [];

        const postType = getValue(query, 'postType', 'post');
        const postsPerPage = getValue(query, 'postsPerPage', 3);
        const order = getValue(query, 'order', 'DESC');
        const orderby = getValue(query, 'orderby', 'date');

        const layoutType = getValue(layout, 'layout', 'grid');
        const columns = getValue(layout, 'columns', 3);
        const gap = getValue(layout, 'gap', '20px');

        const showImage = getValue(display, 'showImage', true);
        const showTitle = getValue(display, 'showTitle', true);
        const showExcerpt = getValue(display, 'showExcerpt', true);
        const showMeta = getValue(display, 'showMeta', false);

        const titleTypography = element.data.style?.titleTypography || [];
        const excerptTypography = element.data.style?.excerptTypography || [];
        const metaTypography = element.data.style?.metaTypography || [];
        const itemStyle = element.data.style?.itemStyle || [];
        
        // useEffect(() => {
        //   axios.post('/wp-json/sitecore/v1/emails/queries', {action_id: 'posts', payload: {
        //     postType, postsPerPage, order, orderby,
        //     search: getValue(query, 'search', '')
        //   }})
        //   .then(res => res.data)
        //   .then(res => setPosts(res))
        //   .catch(err => console.error(err))
        // }, []);

        const getTypographyStyle = (group) => ({
            fontSize: getValue(group, 'fontSize'),
            color: getValue(group, 'color'),
            fontWeight: getValue(group, 'fontWeight'),
            lineHeight: getValue(group, 'lineHeight'),
            marginBottom: getValue(group, 'marginBottom'),
        });

        const getPostItemStyle = (group) => ({
            backgroundColor: getValue(group, 'backgroundColor'),
            padding: getValue(group, 'padding'),
            border: getValue(group, 'border'),
            borderRadius: getValue(group, 'borderRadius'),
        });

        const staticPosts = Array.from({ length: postsPerPage }).map((_, i) => ({
            id: `static-post-${i}`,
            title: `Sample Post Title ${i + 1}`,
            excerpt: `This is a sample excerpt for post ${i + 1}. Email templates do not support dynamic content fetching.`, 
            featured_image: `https://placehold.co/300x200?text=Post+Image+${i + 1}`,
            date: `August ${16 - i}, 2025`,
            author: `Admin`
        }));

        const gridStyle = layoutType === 'grid'
            ? {
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap
              }
            : {
                  display: 'flex',
                  flexDirection: 'column',
                  gap
              };

        return (
            <div style={gridStyle}>
                {staticPosts.map(post => (
                    <div key={post.id} className="post-card" style={{
                        ...getPostItemStyle(itemStyle),
                        overflow: 'hidden'
                    }}>
                        {showImage && post.featured_image && (
                            <img src={post.featured_image} alt={post.title} style={{ width: '100%', height: 'auto' }} />
                        )}
                        <div style={{ padding: getValue(itemStyle, 'padding', '16px') }}>
                            {showTitle && <h3 style={getTypographyStyle(titleTypography)}>{post.title}</h3>}
                            {showMeta && <div style={getTypographyStyle(metaTypography)}>{post.date} by {post.author}</div>}
                            {showExcerpt && <p style={getTypographyStyle(excerptTypography)}>{post.excerpt}</p>}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}
export default BasicPosts;