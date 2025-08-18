import { Image } from 'lucide-react';
import BaseAddon from './base-addon';

class BasicImage extends BaseAddon {
    constructor() {
        super();
    }
    
    get_id() {
        return 'basic-image';
    }
    
    get_name() {
        return 'Basic Image';
    }
    
    get_icon() {
        return Image;
    }
    
    get_category() {
        return 'media';
    }
    
    get_description() {
        return 'Add and customize images with various display options';
    }
    
    get_settings() {
        return {
            content: {
                imageContent: {
                    title: 'Image Content',
                    description: 'Configure your image content and properties',
                    fields: [
                        {
                            id: 'src',
                            type: 'url',
                            label: 'Image URL',
                            description: 'Enter the URL of your image',
                            value: '',
                            required: true
                        },
                        {
                            id: 'alt',
                            type: 'text',
                            label: 'Alt Text',
                            description: 'Alternative text for accessibility',
                            value: '',
                            required: true
                        },
                        {
                            id: 'title',
                            type: 'text',
                            label: 'Image Title',
                            description: 'Title text shown on hover',
                            value: ''
                        },
                        {
                            id: 'caption',
                            type: 'textarea',
                            label: 'Caption',
                            description: 'Optional caption text below the image',
                            value: ''
                        }
                    ]
                },
                imageSettings: {
                    title: 'Image Display Settings',
                    description: 'Control how your image is displayed',
                    fields: [
                        {
                            id: 'width',
                            type: 'select',
                            label: 'Image Width',
                            description: 'Set the width of the image',
                            value: 'auto',
                            options: [
                                { value: 'auto', label: 'Auto' },
                                { value: '25%', label: '25%' },
                                { value: '50%', label: '50%' },
                                { value: '75%', label: '75%' },
                                { value: '100%', label: '100%' },
                                { value: 'custom', label: 'Custom' }
                            ]
                        },
                        {
                            id: 'customWidth',
                            type: 'text',
                            label: 'Custom Width',
                            description: 'Enter custom width (e.g., 300px, 20rem)',
                            value: '',
                            showIf: { field: 'width', value: 'custom' }
                        },
                        {
                            id: 'height',
                            type: 'select',
                            label: 'Image Height',
                            description: 'Set the height of the image',
                            value: 'auto',
                            options: [
                                { value: 'auto', label: 'Auto' },
                                { value: '200px', label: '200px' },
                                { value: '300px', label: '300px' },
                                { value: '400px', label: '400px' },
                                { value: '500px', label: '500px' },
                                { value: 'custom', label: 'Custom' }
                            ]
                        },
                        {
                            id: 'customHeight',
                            type: 'text',
                            label: 'Custom Height',
                            description: 'Enter custom height (e.g., 300px, 20rem)',
                            value: '',
                            showIf: { field: 'height', value: 'custom' }
                        },
                        {
                            id: 'objectFit',
                            type: 'select',
                            label: 'Image Fit',
                            description: 'How the image should fit within its container',
                            value: 'cover',
                            options: [
                                { value: 'cover', label: 'Cover' },
                                { value: 'contain', label: 'Contain' },
                                { value: 'fill', label: 'Fill' },
                                { value: 'scale-down', label: 'Scale Down' },
                                { value: 'none', label: 'None' }
                            ]
                        },
                        {
                            id: 'alignment',
                            type: 'select',
                            label: 'Image Alignment',
                            description: 'Align the image within its container',
                            value: 'center',
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ]
                        }
                    ]
                },
                imageEffects: {
                    title: 'Image Effects',
                    description: 'Add visual effects to your image',
                    fields: [
                        {
                            id: 'enableBorderRadius',
                            type: 'checkbox',
                            label: 'Enable Border Radius',
                            description: 'Add rounded corners to the image',
                            value: false
                        },
                        {
                            id: 'borderRadius',
                            type: 'select',
                            label: 'Border Radius',
                            description: 'Choose the corner roundness',
                            value: 'medium',
                            options: [
                                { value: 'small', label: 'Small (4px)' },
                                { value: 'medium', label: 'Medium (8px)' },
                                { value: 'large', label: 'Large (16px)' },
                                { value: 'xl', label: 'Extra Large (24px)' },
                                { value: 'full', label: 'Full (50%)' },
                                { value: 'custom', label: 'Custom' }
                            ],
                            showIf: { field: 'enableBorderRadius', value: true }
                        },
                        {
                            id: 'customBorderRadius',
                            type: 'text',
                            label: 'Custom Border Radius',
                            description: 'Enter custom border radius (e.g., 12px)',
                            value: '',
                            showIf: { field: 'borderRadius', value: 'custom' }
                        },
                        {
                            id: 'enableHoverEffect',
                            type: 'checkbox',
                            label: 'Enable Hover Effect',
                            description: 'Add hover effects to the image',
                            value: false
                        },
                        {
                            id: 'hoverEffect',
                            type: 'select',
                            label: 'Hover Effect',
                            description: 'Choose the hover effect type',
                            value: 'zoom',
                            options: [
                                { value: 'zoom', label: 'Zoom In' },
                                { value: 'fade', label: 'Fade' },
                                { value: 'brightness', label: 'Brightness' },
                                { value: 'grayscale', label: 'Grayscale' }
                            ],
                            showIf: { field: 'enableHoverEffect', value: true }
                        },
                        {
                            id: 'enableLazyLoad',
                            type: 'checkbox',
                            label: 'Enable Lazy Loading',
                            description: 'Load image only when it comes into view',
                            value: true
                        }
                    ]
                },
                linkSettings: {
                    title: 'Link Settings',
                    description: 'Make your image clickable',
                    fields: [
                        {
                            id: 'enableLink',
                            type: 'checkbox',
                            label: 'Enable Link',
                            description: 'Make the image clickable',
                            value: false
                        },
                        {
                            id: 'linkUrl',
                            type: 'url',
                            label: 'Link URL',
                            description: 'URL to navigate when image is clicked',
                            value: '',
                            showIf: { field: 'enableLink', value: true }
                        },
                        {
                            id: 'linkTarget',
                            type: 'select',
                            label: 'Link Target',
                            description: 'How the link should open',
                            value: '_self',
                            options: [
                                { value: '_self', label: 'Same Window' },
                                { value: '_blank', label: 'New Window' },
                                { value: '_parent', label: 'Parent Frame' },
                                { value: '_top', label: 'Top Frame' }
                            ],
                            showIf: { field: 'enableLink', value: true }
                        }
                    ]
                }
            }
        };
    }
    
    render({ element }) {
        // console.log('element', element)
        if (!element?.data?.content) {
            return (
                <div style={{
                    backgroundColor: '#f9f9f9',
                    border: '2px dashed #ddd',
                    padding: '40px 20px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#999'
                }}>
                    <Image size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <p>Click to add an image</p>
                </div>
            );
        }

        // Helper function to get field value by section and id
        const getFieldValue = (tabKey, section, id, defaultValue = '') => {
            const sectionData = element.data?.[tabKey]?.[section];
            if (!sectionData?.fields || !Array.isArray(sectionData?.fields)) return defaultValue;
            const field = sectionData.fields.find(block => block.id === id);
            return field?.value ?? defaultValue;
        };

        // Get all field values
        const src = getFieldValue('content', 'imageContent', 'src');
        const alt = getFieldValue('content', 'imageContent', 'alt', 'Image');
        const title = getFieldValue('content', 'imageContent', 'title');
        const caption = getFieldValue('content', 'imageContent', 'caption');
        
        const width = getFieldValue('content', 'imageSettings', 'width', 'auto');
        const customWidth = getFieldValue('content', 'imageSettings', 'customWidth');
        const height = getFieldValue('content', 'imageSettings', 'height', 'auto');
        const customHeight = getFieldValue('content', 'imageSettings', 'customHeight');
        const objectFit = getFieldValue('content', 'imageSettings', 'objectFit', 'cover');
        const alignment = getFieldValue('content', 'imageSettings', 'alignment', 'center');
        
        const enableBorderRadius = getFieldValue('content', 'imageEffects', 'enableBorderRadius') === true;
        const borderRadius = getFieldValue('content', 'imageEffects', 'borderRadius', 'medium');
        const customBorderRadius = getFieldValue('content', 'imageEffects', 'customBorderRadius');
        const enableHoverEffect = getFieldValue('content', 'imageEffects', 'enableHoverEffect') === true;
        const hoverEffect = getFieldValue('content', 'imageEffects', 'hoverEffect', 'zoom');
        const enableLazyLoad = getFieldValue('content', 'imageEffects', 'enableLazyLoad', true) === true;
        
        const enableLink = getFieldValue('content', 'linkSettings', 'enableLink') === true;
        const linkUrl = getFieldValue('content', 'linkSettings', 'linkUrl');
        const linkTarget = getFieldValue('content', 'linkSettings', 'linkTarget', '_self');

        // Return placeholder if no image source
        if (!src || src.trim() === '') {
            return (
                <div style={{
                    padding: '40px 20px',
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: '#999',
                    backgroundColor: '#f9f9f9'
                }}>
                    <Image size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <p>Please add an image URL</p>
                </div>
            );
        }

        // Build image styles
        const imageStyles = {
            display: 'block',
            maxWidth: '100%',
            objectFit: objectFit,
            transition: enableHoverEffect ? 'all 0.3s ease' : 'none',
            width: width === 'custom' ? customWidth : (width === 'auto' ? 'auto' : width),
            height: height === 'custom' ? customHeight : (height === 'auto' ? 'auto' : height)
        };

        // Apply border radius
        if (enableBorderRadius) {
            const radiusMap = {
                small: '4px',
                medium: '8px',
                large: '16px',
                xl: '24px',
                full: '50%',
                custom: customBorderRadius || '8px'
            };
            imageStyles.borderRadius = radiusMap[borderRadius];
        }

        // Container styles for alignment
        const containerStyles = {
            textAlign: alignment,
            margin: alignment === 'center' ? '0 auto' : (alignment === 'right' ? '0 0 0 auto' : '0 auto 0 0')
        };

        // Hover effect styles
        const hoverStyles = enableHoverEffect ? {
            zoom: { transform: 'scale(1.05)' },
            fade: { opacity: '0.8' },
            brightness: { filter: 'brightness(1.2)' },
            grayscale: { filter: 'grayscale(100%)' }
        }[hoverEffect] : {};

        // Create image element
        const ImageElement = () => (
            <img
                src={src}
                alt={alt}
                title={title}
                loading={enableLazyLoad ? 'lazy' : 'eager'}
                style={imageStyles}
                onMouseEnter={(e) => {
                    if (enableHoverEffect && hoverStyles) {
                        Object.assign(e.target.style, hoverStyles);
                    }
                }}
                onMouseLeave={(e) => {
                    if (enableHoverEffect) {
                        e.target.style.transform = '';
                        e.target.style.opacity = '';
                        e.target.style.filter = '';
                    }
                }}
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                }}
            />
        );

        // Error fallback
        const ErrorFallback = () => (
            <div style={{
                display: 'none',
                padding: '20px',
                border: '2px dashed #ff6b6b',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#ff6b6b',
                backgroundColor: '#fff5f5'
            }}>
                <p>Failed to load image</p>
                <small>{src}</small>
            </div>
        );

        // Wrap with link if enabled
        const ImageWithLink = () => {
            if (enableLink && linkUrl && linkUrl.trim() !== '') {
                return (
                    <a 
                        href={linkUrl} 
                        target={linkTarget}
                        style={{ 
                            display: 'inline-block', 
                            textDecoration: 'none',
                            outline: 'none'
                        }}
                    >
                        <ImageElement />
                    </a>
                );
            }
            return <ImageElement />;
        };

        return (
            <div style={containerStyles} className="basic-image-container">
                <ImageWithLink />
                <ErrorFallback />
                {caption && caption.trim() !== '' && (
                    <div style={{
                        marginTop: '8px',
                        fontSize: '14px',
                        color: '#666',
                        fontStyle: 'italic',
                        textAlign: alignment
                    }}>
                        {caption}
                    </div>
                )}
            </div>
        );
    }
}

export default BasicImage;