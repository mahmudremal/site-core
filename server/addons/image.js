const express = require('express');
const { CronJob } = require('cron');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ImageGenerationAddon {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.tables = {
            analytics: `${this.db.prefix}image_analytics`,
            templates: `${this.db.prefix}image_templates`,
        };
        this.cache = new Map();
        this.cacheMaxSize = 1000;
        this.supportedFormats = ['svg', 'png', 'jpeg', 'webp'];
        this.maxDimension = 4000;
        this.templates = this.getDefaultTemplates();
        
    }

    init() {
        return true;
    }

    get_tables_schemas() {
        return {
            analytics: `
                CREATE TABLE IF NOT EXISTS ${this.tables.analytics} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    endpoint TEXT,
                    parameters TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    user_agent TEXT,
                    ip_address TEXT
                )
            `,
            templates: `
                CREATE TABLE IF NOT EXISTS ${this.tables.templates} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) UNIQUE,
                    config TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `,
        };
    }

    register(router) {
        // Main generation endpoints
        router.get('/image/generate', this.generate.bind(this));
        router.get('/image/avatar', this.generateAvatar.bind(this));
        router.get('/image/gradient', this.generateGradient.bind(this));
        router.get('/image/pattern', this.generatePattern.bind(this));
        router.get('/image/qr', this.generateQR.bind(this));
        router.get('/image/chart', this.generateChart.bind(this));
        router.get('/image/badge', this.generateBadge.bind(this));
        router.get('/image/social', this.generateSocialImage.bind(this));
        router.get('/image/logo', this.generateLogo.bind(this));
        router.get('/image/banner', this.generateBanner.bind(this));
        
        // Template management
        router.get('/image/templates', this.getTemplates.bind(this));
        router.post('/image/templates', this.saveTemplate.bind(this));
        router.delete('/image/templates/:name', this.deleteTemplate.bind(this));
        
        // Utility endpoints
        router.get('/image/analytics', this.getAnalytics.bind(this));
        router.get('/image/health', this.healthCheck.bind(this));
        router.get('/image/fonts', this.getFonts.bind(this));
        router.get('/image/colors', this.getColorPalettes.bind(this));
    }

    generate(req, res) {
        try {
            this.logAnalytics('generate', req);
            
            const params = this.parseParameters(req.query);
            
            const validation = this.validateParameters(params);
            if (!validation.valid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const cacheKey = this.generateCacheKey(params);
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                res.setHeader('Content-Type', cached.contentType);
                return res.send(cached.data);
            }

            let result;
            if (params.format === 'svg') {
                result = this.generateSVG(params);
            } else {
                result = this.generateCanvas(params);
            }

            this.cache.set(cacheKey, result);
            if (this.cache.size > this.cacheMaxSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }

            res.setHeader('Content-Type', result.contentType);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.send(result.data);

        } catch (error) {
            console.error('Template save error:', error);
            res.status(500).json({ success: false, message: 'Template save failed' });
        }
    }

    deleteTemplate(req, res) {
        if (!this.db) {
            return res.status(400).json({ success: false, message: 'Template storage not available' });
        }
        
        const { name } = req.params;
        
        try {
            this.db.query(`DELETE FROM ${this.tables.templates} WHERE name = ?`, [name], (err, result) => {
                if (err) {
                    console.error(`Error deleting template ${name}: `, err);
                } else if (result.changes > 0) {
                    res.json({ success: true, message: 'Template deleted' });
                } else {
                    res.status(404).json({ success: false, message: 'Template not found' });
                }
            });
            
            
        } catch (error) {
            console.error('Template delete error:', error);
            res.status(500).json({ success: false, message: 'Template delete failed' });
        }
    }

    generatePattern(req, res) {
        try {
            this.logAnalytics('pattern', req);
            
            const {
                type = 'dots', // dots, stripes, grid, waves, hexagon
                width = 200,
                height = 200,
                primaryColor = '0284C7',
                secondaryColor = 'ffffff',
                size = 10,
                spacing = 20,
                format = 'svg'
            } = req.query;
            
            const params = {
                type,
                width: parseInt(width),
                height: parseInt(height),
                primaryColor,
                secondaryColor,
                size: parseInt(size),
                spacing: parseInt(spacing),
                format: format.toLowerCase()
            };
            
            const result = params.format === 'svg' ? 
                this.generatePatternSVG(params) : 
                this.generatePatternCanvas(params);
            
            res.setHeader('Content-Type', result.contentType);
            res.send(result.data);
            
        } catch (error) {
            console.error('Pattern generation error:', error);
            res.status(500).json({ success: false, message: 'Pattern generation failed' });
        }
    }

    generatePatternSVG(params) {
        const { type, width, height, primaryColor, secondaryColor, size, spacing } = params;
        
        let pattern = '';
        let patternDef = '';
        
        switch (type) {
            case 'dots':
                patternDef = `<pattern id="pattern" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
                    <rect width="${spacing}" height="${spacing}" fill="#${secondaryColor}"/>
                    <circle cx="${spacing/2}" cy="${spacing/2}" r="${size/2}" fill="#${primaryColor}"/>
                </pattern>`;
                break;
                
            case 'stripes':
                patternDef = `<pattern id="pattern" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
                    <rect width="${spacing}" height="${spacing}" fill="#${secondaryColor}"/>
                    <rect x="0" y="0" width="${size}" height="${spacing}" fill="#${primaryColor}"/>
                </pattern>`;
                break;
                
            case 'grid':
                patternDef = `<pattern id="pattern" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
                    <rect width="${spacing}" height="${spacing}" fill="#${secondaryColor}"/>
                    <rect x="0" y="0" width="${size}" height="${spacing}" fill="#${primaryColor}"/>
                    <rect x="0" y="0" width="${spacing}" height="${size}" fill="#${primaryColor}"/>
                </pattern>`;
                break;
                
            case 'waves':
                patternDef = `<pattern id="pattern" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
                    <rect width="${spacing}" height="${spacing}" fill="#${secondaryColor}"/>
                    <path d="M 0,${spacing/2} Q ${spacing/4},${spacing/2-size} ${spacing/2},${spacing/2} T ${spacing},${spacing/2}" 
                          stroke="#${primaryColor}" stroke-width="2" fill="none"/>
                </pattern>`;
                break;
                
            case 'hexagon':
                const hexSize = size;
                patternDef = `<pattern id="pattern" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
                    <rect width="${spacing}" height="${spacing}" fill="#${secondaryColor}"/>
                    <polygon points="${spacing/2},${spacing/2-hexSize} ${spacing/2+hexSize*0.866},${spacing/2-hexSize/2} ${spacing/2+hexSize*0.866},${spacing/2+hexSize/2} ${spacing/2},${spacing/2+hexSize} ${spacing/2-hexSize*0.866},${spacing/2+hexSize/2} ${spacing/2-hexSize*0.866},${spacing/2-hexSize/2}" 
                             fill="#${primaryColor}"/>
                </pattern>`;
                break;
                
            default:
                patternDef = `<pattern id="pattern" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
                    <rect width="${spacing}" height="${spacing}" fill="#${secondaryColor}"/>
                </pattern>`;
        }
        
        const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>${patternDef}</defs>
            <rect width="100%" height="100%" fill="url(#pattern)"/>
        </svg>`;
        
        return {
            data: svg,
            contentType: 'image/svg+xml'
        };
    }

    generatePatternCanvas(params) {
        const { type, width, height, primaryColor, secondaryColor, size, spacing } = params;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = `#${secondaryColor}`;
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = `#${primaryColor}`;
        
        switch (type) {
            case 'dots':
                for (let x = spacing/2; x < width; x += spacing) {
                    for (let y = spacing/2; y < height; y += spacing) {
                        ctx.beginPath();
                        ctx.arc(x, y, size/2, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }
                break;
                
            case 'stripes':
                for (let x = 0; x < width; x += spacing) {
                    ctx.fillRect(x, 0, size, height);
                }
                break;
                
            case 'grid':
                for (let x = 0; x < width; x += spacing) {
                    ctx.fillRect(x, 0, size, height);
                }
                for (let y = 0; y < height; y += spacing) {
                    ctx.fillRect(0, y, width, size);
                }
                break;
                
            case 'waves':
                ctx.strokeStyle = `#${primaryColor}`;
                ctx.lineWidth = 2;
                for (let y = spacing/2; y < height; y += spacing) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    for (let x = 0; x < width; x += spacing/2) {
                        const waveY = y + Math.sin(x / spacing * Math.PI) * size;
                        ctx.lineTo(x, waveY);
                    }
                    ctx.stroke();
                }
                break;
                
            case 'hexagon':
                const hexSize = size;
                for (let x = spacing; x < width; x += spacing * 1.5) {
                    for (let y = spacing; y < height; y += spacing) {
                        const offsetX = (y / spacing) % 2 === 0 ? 0 : spacing * 0.75;
                        this.drawHexagon(ctx, x + offsetX, y, hexSize);
                    }
                }
                break;
        }
        
        return {
            data: canvas.toBuffer('image/png'),
            contentType: 'image/png'
        };
    }

    drawHexagon(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hx = x + size * Math.cos(angle);
            const hy = y + size * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(hx, hy);
            } else {
                ctx.lineTo(hx, hy);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    generateChart(req, res) {
        try {
            this.logAnalytics('chart', req);
            
            const {
                type = 'bar', // bar, line, pie, doughnut
                data = '10,20,30,40',
                labels = 'A,B,C,D',
                width = 400,
                height = 300,
                colors = '3b82f6,ef4444,10b981,f59e0b',
                title = '',
                format = 'svg'
            } = req.query;
            
            const chartData = data.split(',').map(Number);
            const chartLabels = labels.split(',');
            const chartColors = colors.split(',');
            
            const params = {
                type,
                data: chartData,
                labels: chartLabels,
                colors: chartColors,
                width: parseInt(width),
                height: parseInt(height),
                title,
                format: format.toLowerCase()
            };
            
            const result = params.format === 'svg' ? 
                this.generateChartSVG(params) : 
                this.generateChartCanvas(params);
            
            res.setHeader('Content-Type', result.contentType);
            res.send(result.data);
            
        } catch (error) {
            console.error('Chart generation error:', error);
            res.status(500).json({ success: false, message: 'Chart generation failed' });
        }
    }

    generateChartSVG(params) {
        const { type, data, labels, colors, width, height, title } = params;
        const margin = { top: title ? 40 : 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Title
        if (title) {
            svg += `<text x="${width/2}" y="20" text-anchor="middle" font-size="16" font-weight="bold">${title}</text>`;
        }
        
        const maxValue = Math.max(...data);
        
        switch (type) {
            case 'bar':
                const barWidth = chartWidth / data.length * 0.8;
                const barSpacing = chartWidth / data.length * 0.2;
                
                data.forEach((value, index) => {
                    const barHeight = (value / maxValue) * chartHeight;
                    const x = margin.left + index * (barWidth + barSpacing) + barSpacing / 2;
                    const y = margin.top + chartHeight - barHeight;
                    const color = colors[index % colors.length];
                    
                    svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#${color}"/>`;
                    
                    // Label
                    if (labels[index]) {
                        svg += `<text x="${x + barWidth/2}" y="${height - 10}" text-anchor="middle" font-size="12">${labels[index]}</text>`;
                    }
                    
                    // Value
                    svg += `<text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" font-size="10">${value}</text>`;
                });
                break;
                
            case 'line':
                const points = data.map((value, index) => {
                    const x = margin.left + (index / (data.length - 1)) * chartWidth;
                    const y = margin.top + chartHeight - (value / maxValue) * chartHeight;
                    return `${x},${y}`;
                }).join(' ');
                
                svg += `<polyline points="${points}" fill="none" stroke="#${colors[0]}" stroke-width="2"/>`;
                
                // Data points
                data.forEach((value, index) => {
                    const x = margin.left + (index / (data.length - 1)) * chartWidth;
                    const y = margin.top + chartHeight - (value / maxValue) * chartHeight;
                    svg += `<circle cx="${x}" cy="${y}" r="4" fill="#${colors[0]}"/>`;
                });
                break;
                
            case 'pie':
                const total = data.reduce((sum, value) => sum + value, 0);
                const centerX = width / 2;
                const centerY = height / 2;
                const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
                
                let currentAngle = 0;
                data.forEach((value, index) => {
                    const sliceAngle = (value / total) * 2 * Math.PI;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + sliceAngle;
                    
                    const x1 = centerX + radius * Math.cos(startAngle);
                    const y1 = centerY + radius * Math.sin(startAngle);
                    const x2 = centerX + radius * Math.cos(endAngle);
                    const y2 = centerY + radius * Math.sin(endAngle);
                    
                    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
                    const color = colors[index % colors.length];
                    
                    svg += `<path d="M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z" fill="#${color}"/>`;
                    
                    currentAngle += sliceAngle;
                });
                break;
        }
        
        // Axes for bar and line charts
        if (type === 'bar' || type === 'line') {
            svg += `<line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartHeight}" stroke="#666" stroke-width="1"/>`;
            svg += `<line x1="${margin.left}" y1="${margin.top + chartHeight}" x2="${margin.left + chartWidth}" y2="${margin.top + chartHeight}" stroke="#666" stroke-width="1"/>`;
        }
        
        svg += '</svg>';
        
        return {
            data: svg,
            contentType: 'image/svg+xml'
        };
    }

    generateChartCanvas(params) {
        const { type, data, labels, colors, width, height, title } = params;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        const margin = { top: title ? 40 : 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Title
        if (title) {
            ctx.fillStyle = 'black';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(title, width/2, 20);
        }
        
        const maxValue = Math.max(...data);
        
        switch (type) {
            case 'bar':
                const barWidth = chartWidth / data.length * 0.8;
                const barSpacing = chartWidth / data.length * 0.2;
                
                data.forEach((value, index) => {
                    const barHeight = (value / maxValue) * chartHeight;
                    const x = margin.left + index * (barWidth + barSpacing) + barSpacing / 2;
                    const y = margin.top + chartHeight - barHeight;
                    const color = colors[index % colors.length];
                    
                    ctx.fillStyle = `#${color}`;
                    ctx.fillRect(x, y, barWidth, barHeight);
                    
                    // Label
                    if (labels[index]) {
                        ctx.fillStyle = 'black';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(labels[index], x + barWidth/2, height - 10);
                    }
                    
                    // Value
                    ctx.fillStyle = 'black';
                    ctx.font = '10px Arial';
                    ctx.fillText(value.toString(), x + barWidth/2, y - 5);
                });
                break;
                
            case 'pie':
                const total = data.reduce((sum, value) => sum + value, 0);
                const centerX = width / 2;
                const centerY = height / 2;
                const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
                
                let currentAngle = 0;
                data.forEach((value, index) => {
                    const sliceAngle = (value / total) * 2 * Math.PI;
                    const color = colors[index % colors.length];
                    
                    ctx.fillStyle = `#${color}`;
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                    ctx.closePath();
                    ctx.fill();
                    
                    currentAngle += sliceAngle;
                });
                break;
        }
        
        // Axes for bar charts
        if (type === 'bar') {
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(margin.left, margin.top);
            ctx.lineTo(margin.left, margin.top + chartHeight);
            ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
            ctx.stroke();
        }
        
        return {
            data: canvas.toBuffer('image/png'),
            contentType: 'image/png'
        };
    }

    generateLogo(req, res) {
        try {
            this.logAnalytics('logo', req);
            
            const {
                text = 'LOGO',
                style = 'modern', // modern, classic, minimal, bold
                width = 300,
                height = 100,
                primaryColor = '2563eb',
                secondaryColor = '1e40af',
                format = 'svg'
            } = req.query;
            
            const params = {
                text,
                style,
                width: parseInt(width),
                height: parseInt(height),
                primaryColor,
                secondaryColor,
                format: format.toLowerCase()
            };
            
            const result = params.format === 'svg' ? 
                this.generateLogoSVG(params) : 
                this.generateLogoCanvas(params);
            
            res.setHeader('Content-Type', result.contentType);
            res.send(result.data);
            
        } catch (error) {
            console.error('Logo generation error:', error);
            res.status(500).json({ success: false, message: 'Logo generation failed' });
        }
    }

    generateLogoSVG(params) {
        const { text, style, width, height, primaryColor, secondaryColor } = params;
        
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        
        switch (style) {
            case 'modern':
                svg += `<defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#${primaryColor}"/>
                        <stop offset="100%" stop-color="#${secondaryColor}"/>
                    </linearGradient>
                </defs>`;
                svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="url(#logoGradient)" rx="10"/>`;
                svg += `<text x="50%" y="50%" fill="white" font-size="${height * 0.4}" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${text}</text>`;
                break;
                
            case 'classic':
                svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="#${primaryColor}" stroke="#${secondaryColor}" stroke-width="3"/>`;
                svg += `<text x="50%" y="50%" fill="white" font-size="${height * 0.35}" font-family="serif" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${text}</text>`;
                break;
                
            case 'minimal':
                svg += `<text x="50%" y="50%" fill="#${primaryColor}" font-size="${height * 0.4}" font-family="Arial, sans-serif" font-weight="300" text-anchor="middle" dominant-baseline="middle">${text}</text>`;
                break;
                
            case 'bold':
                svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="#${primaryColor}"/>`;
                svg += `<text x="50%" y="50%" fill="#${secondaryColor}" font-size="${height * 0.45}" font-family="Arial, sans-serif" font-weight="900" text-anchor="middle" dominant-baseline="middle">${text}</text>`;
                break;
        }
        
        svg += '</svg>';
        
        return {
            data: svg,
            contentType: 'image/svg+xml'
        };
    }

    generateLogoCanvas(params) {
        const { text, style, width, height, primaryColor, secondaryColor } = params;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        switch (style) {
            case 'modern':
                const gradient = ctx.createLinearGradient(0, 0, width, 0);
                gradient.addColorStop(0, `#${primaryColor}`);
                gradient.addColorStop(1, `#${secondaryColor}`);
                ctx.fillStyle = gradient;
                this.roundRect(ctx, 0, 0, width, height, 10);
                ctx.fill();
                
                ctx.fillStyle = 'white';
                ctx.font = `bold ${height * 0.4}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, width/2, height/2);
                break;
                
            case 'classic':
                ctx.fillStyle = `#${primaryColor}`;
                ctx.fillRect(0, 0, width, height);
                ctx.strokeStyle = `#${secondaryColor}`;
                ctx.lineWidth = 3;
                ctx.strokeRect(1.5, 1.5, width-3, height-3);
                
                ctx.fillStyle = 'white';
                ctx.font = `bold ${height * 0.35}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, width/2, height/2);
                break;
                
            case 'minimal':
                ctx.fillStyle = `#${primaryColor}`;
                ctx.font = `300 ${height * 0.4}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, width/2, height/2);
                break;
                
            case 'bold':
                ctx.fillStyle = `#${primaryColor}`;
                ctx.fillRect(0, 0, width, height);
                
                ctx.fillStyle = `#${secondaryColor}`;
                ctx.font = `900 ${height * 0.45}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, width/2, height/2);
                break;
        }
        
        return {
            data: canvas.toBuffer('image/png'),
            contentType: 'image/png'
        };
    }

    generateBanner(req, res) {
        try {
            this.logAnalytics('banner', req);
            
            const {
                title = 'Welcome',
                subtitle = 'To our amazing service',
                width = 800,
                height = 200,
                bgColor = '1f2937',
                titleColor = 'ffffff',
                subtitleColor = '9ca3af',
                style = 'gradient', // solid, gradient, image
                format = 'png'
            } = req.query;
            
            const params = {
                title,
                subtitle,
                width: parseInt(width),
                height: parseInt(height),
                bgColor,
                titleColor,
                subtitleColor,
                style,
                format: format.toLowerCase()
            };
            
            const result = this.generateBannerCanvas(params);
            
            res.setHeader('Content-Type', result.contentType);
            res.send(result.data);
            
        } catch (error) {
            console.error('Banner generation error:', error);
            res.status(500).json({ success: false, message: 'Banner generation failed' });
        }
    }

    generateBannerCanvas(params) {
        const { title, subtitle, width, height, bgColor, titleColor, subtitleColor, style } = params;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Background
        if (style === 'gradient') {
            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, `#${bgColor}`);
            gradient.addColorStop(1, this.lightenColor(bgColor, 20));
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = `#${bgColor}`;
        }
        ctx.fillRect(0, 0, width, height);
        
        // Title
        ctx.fillStyle = `#${titleColor}`;
        ctx.font = `bold ${height * 0.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, width/2, height * 0.4);
        
        // Subtitle
        if (subtitle) {
            ctx.fillStyle = `#${subtitleColor}`;
            ctx.font = `${height * 0.12}px Arial`;
            ctx.fillText(subtitle, width/2, height * 0.65);
        }
        
        return {
            data: canvas.toBuffer('image/png'),
            contentType: 'image/png'
        };
    }

    escapeXml(text) {
        return text.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case "'": return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });
    }

    lightenColor(color, percent) {
        const num = parseInt(color, 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    createBadgeCanvas(label, message, labelColor, messageColor) {
        const labelWidth = label.length * 7 + 10;
        const messageWidth = message.length * 7 + 10;
        const totalWidth = labelWidth + messageWidth;
        const canvas = createCanvas(totalWidth, 20);
        const ctx = canvas.getContext('2d');
        
        // Label background
        ctx.fillStyle = `#${labelColor}`;
        ctx.fillRect(0, 0, labelWidth, 20);
        
        // Message background
        ctx.fillStyle = `#${messageColor}`;
        ctx.fillRect(labelWidth, 0, messageWidth, 20);
        
        // Label text
        ctx.fillStyle = 'white';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, labelWidth/2, 10);
        
        // Message text
        ctx.fillText(message, labelWidth + messageWidth/2, 10);
        
        return canvas;
    }

    healthCheck(req, res) {
        res.json({
            success: true,
            status: 'healthy',
            version: '2.0.0',
            features: [
                'image-generation', 'avatars', 'gradients', 'patterns',
                'charts', 'badges', 'qr-codes', 'social-images',
                'logos', 'banners', 'templates'
            ],
            formats: this.supportedFormats,
            cache_size: this.cache.size,
            uptime: process.uptime()
        });
    }

    getFonts(req, res) {
        const fonts = [
            'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
            'Verdana', 'Georgia', 'Palatino', 'Garamond',
            'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black'
        ];
        
        res.json({ success: true, fonts });
    }

    getColorP(error) {
        console.error('Generation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }

    parseParameters(query) {
        return {
            width: Math.min(parseInt(query.width) || 200, this.maxDimension),
            height: Math.min(parseInt(query.height) || 200, this.maxDimension),
            bgColor: query.bgColor || '0284C7',
            textColor: query.textColor || 'ffffff',
            text: query.text || 'Banglee',
            format: (query.format || 'svg').toLowerCase(),
            fontSize: parseInt(query.fontSize) || 20,
            fontFamily: query.fontFamily || 'Arial',
            fontWeight: query.fontWeight || 'normal',
            textAlign: query.textAlign || 'center',
            textBaseline: query.textBaseline || 'middle',
            borderRadius: parseInt(query.borderRadius) || 0,
            borderWidth: parseInt(query.borderWidth) || 0,
            borderColor: query.borderColor || '000000',
            padding: parseInt(query.padding) || 20,
            shadow: query.shadow === 'true',
            shadowColor: query.shadowColor || '000000',
            shadowBlur: parseInt(query.shadowBlur) || 5,
            shadowOffsetX: parseInt(query.shadowOffsetX) || 2,
            shadowOffsetY: parseInt(query.shadowOffsetY) || 2,
            gradient: query.gradient === 'true',
            gradientType: query.gradientType || 'linear',
            gradientDirection: query.gradientDirection || '0',
            gradientColors: query.gradientColors ? query.gradientColors.split(',') : null,
            pattern: query.pattern || null,
            opacity: parseFloat(query.opacity) || 1,
            rotation: parseInt(query.rotation) || 0,
            template: query.template || null,
            multiline: query.multiline === 'true',
            lineHeight: parseFloat(query.lineHeight) || 1.2,
            letterSpacing: parseInt(query.letterSpacing) || 0,
            textStroke: query.textStroke === 'true',
            textStrokeWidth: parseInt(query.textStrokeWidth) || 1,
            textStrokeColor: query.textStrokeColor || '000000',
            bgImage: query.bgImage || null,
            bgImageOpacity: parseFloat(query.bgImageOpacity) || 1,
            noise: query.noise === 'true',
            noiseOpacity: parseFloat(query.noiseOpacity) || 0.1
        };
    }

    validateParameters(params) {
        if (!this.supportedFormats.includes(params.format)) {
            return { valid: false, message: `Invalid format. Supported: ${this.supportedFormats.join(', ')}` };
        }
        
        if (params.width < 1 || params.height < 1) {
            return { valid: false, message: 'Width and height must be positive numbers' };
        }
        
        if (params.fontSize < 1 || params.fontSize > 500) {
            return { valid: false, message: 'Font size must be between 1 and 500' };
        }
        
        return { valid: true };
    }

    generateSVG(params) {
        let svg = `<svg width="${params.width}" height="${params.height}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Add definitions for gradients, patterns, filters
        svg += '<defs>';
        
        if (params.gradient && params.gradientColors) {
            svg += this.createSVGGradient(params);
        }
        
        if (params.pattern) {
            svg += this.createSVGPattern(params);
        }
        
        if (params.shadow) {
            svg += `<filter id="shadow">
                <feDropShadow dx="${params.shadowOffsetX}" dy="${params.shadowOffsetY}" 
                             stdDeviation="${params.shadowBlur}" flood-color="#${params.shadowColor}"/>
            </filter>`;
        }
        
        svg += '</defs>';
        
        // Background
        const bgFill = params.gradient && params.gradientColors ? 'url(#bg-gradient)' : 
                      params.pattern ? 'url(#bg-pattern)' : `#${params.bgColor}`;
        
        svg += `<rect width="100%" height="100%" fill="${bgFill}" opacity="${params.opacity}"`;
        if (params.borderRadius > 0) {
            svg += ` rx="${params.borderRadius}" ry="${params.borderRadius}"`;
        }
        svg += '/>';
        
        // Border
        if (params.borderWidth > 0) {
            svg += `<rect x="${params.borderWidth/2}" y="${params.borderWidth/2}" 
                   width="${params.width - params.borderWidth}" height="${params.height - params.borderWidth}"
                   fill="none" stroke="#${params.borderColor}" stroke-width="${params.borderWidth}"`;
            if (params.borderRadius > 0) {
                svg += ` rx="${params.borderRadius}" ry="${params.borderRadius}"`;
            }
            svg += '/>';
        }
        
        // Text
        if (params.text) {
            const textLines = params.multiline ? params.text.split('\\n') : [params.text];
            const lineHeight = params.fontSize * params.lineHeight;
            const startY = params.height / 2 - (textLines.length - 1) * lineHeight / 2;
            
            textLines.forEach((line, index) => {
                const y = startY + index * lineHeight;
                svg += `<text x="50%" y="${y}" fill="#${params.textColor}" 
                       font-size="${params.fontSize}" font-family="${params.fontFamily}" 
                       font-weight="${params.fontWeight}" text-anchor="middle" 
                       dominant-baseline="middle" letter-spacing="${params.letterSpacing}px"`;
                
                if (params.shadow) {
                    svg += ' filter="url(#shadow)"';
                }
                
                if (params.textStroke) {
                    svg += ` stroke="#${params.textStrokeColor}" stroke-width="${params.textStrokeWidth}"`;
                }
                
                if (params.rotation !== 0) {
                    svg += ` transform="rotate(${params.rotation} ${params.width/2} ${y})"`;
                }
                
                svg += `>${this.escapeXml(line)}</text>`;
            });
        }
        
        svg += '</svg>';
        
        return {
            data: svg,
            contentType: 'image/svg+xml'
        };
    }

    generateCanvas(params) {
        const canvas = createCanvas(params.width, params.height);
        const ctx = canvas.getContext('2d');
        
        // Enable high-quality rendering
        ctx.antialias = 'subpixel';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Background
        if (params.gradient && params.gradientColors) {
            const gradient = this.createCanvasGradient(ctx, params);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = `#${params.bgColor}`;
        }
        
        ctx.globalAlpha = params.opacity;
        
        if (params.borderRadius > 0) {
            this.roundRect(ctx, 0, 0, params.width, params.height, params.borderRadius);
            ctx.fill();
        } else {
            ctx.fillRect(0, 0, params.width, params.height);
        }
        
        // Add noise if requested
        if (params.noise) {
            this.addNoise(ctx, params);
        }
        
        // Border
        if (params.borderWidth > 0) {
            ctx.strokeStyle = `#${params.borderColor}`;
            ctx.lineWidth = params.borderWidth;
            
            if (params.borderRadius > 0) {
                this.roundRect(ctx, params.borderWidth/2, params.borderWidth/2, 
                             params.width - params.borderWidth, params.height - params.borderWidth, 
                             params.borderRadius);
                ctx.stroke();
            } else {
                ctx.strokeRect(params.borderWidth/2, params.borderWidth/2, 
                             params.width - params.borderWidth, params.height - params.borderWidth);
            }
        }
        
        // Text
        if (params.text) {
            ctx.globalAlpha = 1;
            this.drawCanvasText(ctx, params);
        }
        
        // Generate buffer based on format
        const contentTypes = {
            png: 'image/png',
            jpeg: 'image/jpeg',
            webp: 'image/webp'
        };
        
        return {
            data: canvas.toBuffer(params.format === 'jpeg' ? 'image/jpeg' : `image/${params.format}`),
            contentType: contentTypes[params.format] || 'image/png'
        };
    }

    generateAvatar(req, res) {
        try {
            this.logAnalytics('avatar', req);
            
            const { 
                name = 'User', 
                size = 200, 
                bgColor, 
                textColor = 'ffffff',
                format = 'svg',
                style = 'initials' // initials, geometric, abstract
            } = req.query;
            
            const params = {
                width: parseInt(size),
                height: parseInt(size),
                bgColor: bgColor || this.generateColorFromString(name),
                textColor,
                text: this.getInitials(name),
                format: format.toLowerCase(),
                borderRadius: parseInt(size) / 2,
                fontSize: Math.floor(parseInt(size) * 0.4),
                fontWeight: 'bold'
            };
            
            const result = params.format === 'svg' ? this.generateSVG(params) : this.generateCanvas(params);
            
            res.setHeader('Content-Type', result.contentType);
            res.send(result.data);
            
        } catch (error) {
            console.error('Avatar generation error:', error);
            res.status(500).json({ success: false, message: 'Avatar generation failed' });
        }
    }

    generateGradient(req, res) {
        try {
            this.logAnalytics('gradient', req);
            
            const params = this.parseParameters({
                ...req.query,
                gradient: 'true',
                text: req.query.text || ''
            });
            
            const result = params.format === 'svg' ? this.generateSVG(params) : this.generateCanvas(params);
            
            res.setHeader('Content-Type', result.contentType);
            res.send(result.data);
            
        } catch (error) {
            res.status(500).json({ success: false, message: 'Gradient generation failed' });
        }
    }

    generateBadge(req, res) {
        try {
            this.logAnalytics('badge', req);
            
            const { 
                label = 'Label', 
                message = 'Message', 
                color = '4c1',
                labelColor = '555',
                format = 'svg'
            } = req.query;
            
            if (format === 'svg') {
                const svg = this.createBadgeSVG(label, message, labelColor, color);
                res.setHeader('Content-Type', 'image/svg+xml');
                res.send(svg);
            } else {
                // Canvas version for badge
                const canvas = this.createBadgeCanvas(label, message, labelColor, color);
                res.setHeader('Content-Type', 'image/png');
                res.send(canvas.toBuffer('image/png'));
            }
            
        } catch (error) {
            res.status(500).json({ success: false, message: 'Badge generation failed' });
        }
    }

    generateQR(req, res) {
        try {
            this.logAnalytics('qr', req);
            
            const { 
                data = 'https://example.com',
                size = 200,
                format = 'svg',
                bgColor = 'ffffff',
                fgColor = '000000'
            } = req.query;
            
            const qrSvg = this.generateQRCodeSVG(data, parseInt(size), bgColor, fgColor);
            
            res.setHeader('Content-Type', 'image/svg+xml');
            res.send(qrSvg);
            
        } catch (error) {
            res.status(500).json({ success: false, message: 'QR generation failed' });
        }
    }

    generateSocialImage(req, res) {
        try {
            this.logAnalytics('social', req);
            
            const {
                platform = 'twitter', // twitter, facebook, linkedin, instagram
                title = 'Social Post',
                subtitle = '',
                bgColor = '1DA1F2',
                format = 'png'
            } = req.query;
            
            const dimensions = this.getSocialDimensions(platform);
            const params = {
                ...dimensions,
                bgColor,
                text: title,
                format,
                fontSize: Math.floor(dimensions.width * 0.05),
                fontWeight: 'bold',
                multiline: true,
                padding: 40
            };
            
            const result = this.generateCanvas(params);
            
            res.setHeader('Content-Type', result.contentType);
            res.send(result.data);
            
        } catch (error) {
            res.status(500).json({ success: false, message: 'Social image generation failed' });
        }
    }

    generateCacheKey(params) {
        return crypto.createHash('md5').update(JSON.stringify(params)).digest('hex');
    }

    generateColorFromString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = Math.abs(hash).toString(16).substring(0, 6);
        return color.padEnd(6, '0');
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    createSVGGradient(params) {
        const { gradientType, gradientDirection, gradientColors } = params;
        
        if (gradientType === 'radial') {
            return `<radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
                ${gradientColors.map((color, i) => 
                    `<stop offset="${i * 100 / (gradientColors.length - 1)}%" stop-color="#${color.trim()}"/>`
                ).join('')}
            </radialGradient>`;
        } else {
            const angle = parseInt(gradientDirection);
            const x1 = angle === 0 ? '0%' : angle === 90 ? '0%' : angle === 180 ? '100%' : '100%';
            const y1 = angle === 0 ? '0%' : angle === 90 ? '100%' : angle === 180 ? '100%' : '0%';
            const x2 = angle === 0 ? '100%' : angle === 90 ? '0%' : angle === 180 ? '0%' : '0%';
            const y2 = angle === 0 ? '0%' : angle === 90 ? '0%' : angle === 180 ? '0%' : '100%';
            
            return `<linearGradient id="bg-gradient" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
                ${gradientColors.map((color, i) => 
                    `<stop offset="${i * 100 / (gradientColors.length - 1)}%" stop-color="#${color.trim()}"/>`
                ).join('')}
            </linearGradient>`;
        }
    }

    createCanvasGradient(ctx, params) {
        const { gradientType, gradientDirection, gradientColors, width, height } = params;
        
        let gradient;
        if (gradientType === 'radial') {
            gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
        } else {
            const angle = parseInt(gradientDirection) * Math.PI / 180;
            const x1 = width/2 + Math.cos(angle) * width/2;
            const y1 = height/2 + Math.sin(angle) * height/2;
            const x2 = width/2 - Math.cos(angle) * width/2;
            const y2 = height/2 - Math.sin(angle) * height/2;
            gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        }
        
        gradientColors.forEach((color, i) => {
            gradient.addColorStop(i / (gradientColors.length - 1), `#${color.trim()}`);
        });
        
        return gradient;
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    drawCanvasText(ctx, params) {
        const { text, fontSize, fontFamily, fontWeight, textColor, width, height, 
                multiline, lineHeight, letterSpacing, textStroke, textStrokeWidth, 
                textStrokeColor, shadow, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY } = params;
        
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `#${textColor}`;
        
        if (letterSpacing > 0) {
            ctx.letterSpacing = `${letterSpacing}px`;
        }
        
        if (shadow) {
            ctx.shadowColor = `#${shadowColor}`;
            ctx.shadowBlur = shadowBlur;
            ctx.shadowOffsetX = shadowOffsetX;
            ctx.shadowOffsetY = shadowOffsetY;
        }
        
        const textLines = multiline ? text.split('\\n') : [text];
        const totalHeight = textLines.length * fontSize * lineHeight;
        const startY = height / 2 - totalHeight / 2 + fontSize / 2;
        
        textLines.forEach((line, index) => {
            const y = startY + index * fontSize * lineHeight;
            
            if (textStroke) {
                ctx.strokeStyle = `#${textStrokeColor}`;
                ctx.lineWidth = textStrokeWidth;
                ctx.strokeText(line, width / 2, y);
            }
            
            ctx.fillText(line, width / 2, y);
        });
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    addNoise(ctx, params) {
        const { width, height, noiseOpacity } = params;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 255 * noiseOpacity;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));     // Red
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    createBadgeSVG(label, message, labelColor, messageColor) {
        const labelWidth = label.length * 7 + 10;
        const messageWidth = message.length * 7 + 10;
        const totalWidth = labelWidth + messageWidth;
        
        return `<svg width="${totalWidth}" height="20" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="${labelWidth}" height="20" fill="#${labelColor}"/>
            <rect x="${labelWidth}" y="0" width="${messageWidth}" height="20" fill="#${messageColor}"/>
            <text x="${labelWidth/2}" y="14" fill="white" font-size="11" font-family="Arial" text-anchor="middle">${label}</text>
            <text x="${labelWidth + messageWidth/2}" y="14" fill="white" font-size="11" font-family="Arial" text-anchor="middle">${message}</text>
        </svg>`;
    }

    generateQRCodeSVG(data, size, bgColor, fgColor) {
        // Simplified QR code placeholder - integrate with actual QR library
        return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#${bgColor}"/>
            <text x="50%" y="50%" fill="#${fgColor}" font-size="12" text-anchor="middle" dominant-baseline="middle">QR: ${data}</text>
        </svg>`;
    }

    getSocialDimensions(platform) {
        const dimensions = {
            twitter: { width: 1200, height: 675 },
            facebook: { width: 1200, height: 630 },
            linkedin: { width: 1200, height: 627 },
            instagram: { width: 1080, height: 1080 }
        };
        return dimensions[platform] || dimensions.twitter;
    }

    getDefaultTemplates() {
        return {
            minimal: { bgColor: 'ffffff', textColor: '333333', fontSize: 24, fontWeight: 'normal' },
            bold: { bgColor: '000000', textColor: 'ffffff', fontSize: 32, fontWeight: 'bold' },
            gradient: { gradient: true, gradientColors: ['ff6b6b', '4ecdc4'], textColor: 'ffffff', fontSize: 28 },
            vintage: { bgColor: 'f4f1de', textColor: '3d405b', fontSize: 26, fontFamily: 'serif' }
        };
    }

    logAnalytics(endpoint, req, res = null) {
        if (this.db) {
            try {
                this.db.query(`INSERT INTO ${this.tables.analytics} (endpoint, parameters, user_agent, ip_address) VALUES (?, ?, ?, ?)`, [endpoint, JSON.stringify(req.query), req.get('User-Agent') || '', req.ip || req.connection.remoteAddress || ''], (err, result) => {
                    if (err) {
                        console.error(`Error logging analytics: `, err);
                    } else if (result.changes > 0) {
                        res && res.json({ success: true, message: 'Analytics logged successfully' });
                    } else {
                        res && res.status(404).json({ success: false, message: 'Failed to log analytics' });
                    }
                });
            } catch (error) {
                console.error('Analytics logging error:', error);
            }
        }
    }

    getAnalytics(req, res) {
        if (!this.db) {
            return res.json({ success: false, message: 'Analytics not available' });
        }
        
        try {
            this.db.query(`
                SELECT 
                    endpoint,
                    COUNT(*) as count,
                    DATE(timestamp) as date
                FROM ${this.tables.analytics} 
                WHERE timestamp >= datetime('now', '-30 days')
                GROUP BY endpoint, DATE(timestamp)
                ORDER BY timestamp DESC
            `, (err, results) => {
                if (err) {
                    console.error(`Error creating ${table} table: `, err);
                } else {
                    res.json({ success: true, stats: results });
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Analytics query failed' });
        }
    }

    getTemplates(req, res) {
        const templates = { ...this.templates };
        
        this.db.query(`SELECT name, config FROM ${this.tables.templates}`, (err, results) => {
            if (err) {
                console.error(`Error getting data from ${table} table: `, err);
            } else {
                results.forEach(template => {
                    templates[template.name] = JSON.parse(template.config);
                });
            }
        });
        
        res.json({ success: true, templates });
    }

    saveTemplate(req, res) {
        if (!this.db) {
            return res.status(400).json({ success: false, message: 'Template storage not available' });
        }
        
        const { name, config } = req.body;
        
        if (!name || !config) {
            return res.status(400).json({ success: false, message: 'Name and config required' });
        }
        
        try {
            this.db.query(`INSERT OR REPLACE INTO ${this.tables.templates} (name, config) VALUES (?, ?)`, [name, JSON.stringify(config)], (err, result) => {
                if (err) {
                    console.error(`Error saving template: `, err);
                } else if (result.changes > 0) {
                    res.json({ success: true, message: 'Template saved successfully' });
                } else {
                    res.status(404).json({ success: false, message: 'Template failed to save' });
                }
            });
        } catch (error) {
            console.error('Template save error:', error);
            res.status(500).json({ success: false, message: 'Failed to save template' });
        }
    }

    getColorPalettes(req, res) {
        const palettes = {
            material: {
                name: 'Material Design',
                colors: [
                    { name: 'Red', hex: 'f44336', rgb: [244, 67, 54] },
                    { name: 'Pink', hex: 'e91e63', rgb: [233, 30, 99] },
                    { name: 'Purple', hex: '9c27b0', rgb: [156, 39, 176] },
                    { name: 'Deep Purple', hex: '673ab7', rgb: [103, 58, 183] },
                    { name: 'Indigo', hex: '3f51b5', rgb: [63, 81, 181] },
                    { name: 'Blue', hex: '2196f3', rgb: [33, 150, 243] },
                    { name: 'Light Blue', hex: '03a9f4', rgb: [3, 169, 244] },
                    { name: 'Cyan', hex: '00bcd4', rgb: [0, 188, 212] },
                    { name: 'Teal', hex: '009688', rgb: [0, 150, 136] },
                    { name: 'Green', hex: '4caf50', rgb: [76, 175, 80] },
                    { name: 'Light Green', hex: '8bc34a', rgb: [139, 195, 74] },
                    { name: 'Lime', hex: 'cddc39', rgb: [205, 220, 57] },
                    { name: 'Yellow', hex: 'ffeb3b', rgb: [255, 235, 59] },
                    { name: 'Amber', hex: 'ffc107', rgb: [255, 193, 7] },
                    { name: 'Orange', hex: 'ff9800', rgb: [255, 152, 0] },
                    { name: 'Deep Orange', hex: 'ff5722', rgb: [255, 87, 34] }
                ]
            },
            tailwind: {
                name: 'Tailwind CSS',
                colors: [
                    { name: 'Slate 500', hex: '64748b', rgb: [100, 116, 139] },
                    { name: 'Gray 500', hex: '6b7280', rgb: [107, 114, 128] },
                    { name: 'Zinc 500', hex: '71717a', rgb: [113, 113, 122] },
                    { name: 'Red 500', hex: 'ef4444', rgb: [239, 68, 68] },
                    { name: 'Orange 500', hex: 'f97316', rgb: [249, 115, 22] },
                    { name: 'Amber 500', hex: 'f59e0b', rgb: [245, 158, 11] },
                    { name: 'Yellow 500', hex: 'eab308', rgb: [234, 179, 8] },
                    { name: 'Lime 500', hex: '84cc16', rgb: [132, 204, 22] },
                    { name: 'Green 500', hex: '22c55e', rgb: [34, 197, 94] },
                    { name: 'Emerald 500', hex: '10b981', rgb: [16, 185, 129] },
                    { name: 'Teal 500', hex: '14b8a6', rgb: [20, 184, 166] },
                    { name: 'Cyan 500', hex: '06b6d4', rgb: [6, 182, 212] },
                    { name: 'Sky 500', hex: '0ea5e9', rgb: [14, 165, 233] },
                    { name: 'Blue 500', hex: '3b82f6', rgb: [59, 130, 246] },
                    { name: 'Indigo 500', hex: '6366f1', rgb: [99, 102, 241] },
                    { name: 'Violet 500', hex: '8b5cf6', rgb: [139, 92, 246] },
                    { name: 'Purple 500', hex: 'a855f7', rgb: [168, 85, 247] },
                    { name: 'Fuchsia 500', hex: 'd946ef', rgb: [217, 70, 239] },
                    { name: 'Pink 500', hex: 'ec4899', rgb: [236, 72, 153] },
                    { name: 'Rose 500', hex: 'f43f5e', rgb: [244, 63, 94] }
                ]
            },
            vintage: {
                name: 'Vintage',
                colors: [
                    { name: 'Dusty Rose', hex: 'dcae96', rgb: [220, 174, 150] },
                    { name: 'Sage Green', hex: '9caf88', rgb: [156, 175, 136] },
                    { name: 'Mustard Yellow', hex: 'e6b85c', rgb: [230, 184, 92] },
                    { name: 'Terracotta', hex: 'c17767', rgb: [193, 119, 103] },
                    { name: 'Dusty Blue', hex: '8fa0a8', rgb: [143, 160, 168] },
                    { name: 'Mauve', hex: 'b08bab', rgb: [176, 139, 171] },
                    { name: 'Olive', hex: 'a0956b', rgb: [160, 149, 107] },
                    { name: 'Burnt Orange', hex: 'cc8963', rgb: [204, 137, 99] }
                ]
            },
            neon: {
                name: 'Neon',
                colors: [
                    { name: 'Electric Blue', hex: '00ffff', rgb: [0, 255, 255] },
                    { name: 'Hot Pink', hex: 'ff1493', rgb: [255, 20, 147] },
                    { name: 'Lime Green', hex: '32cd32', rgb: [50, 205, 50] },
                    { name: 'Electric Purple', hex: 'bf00ff', rgb: [191, 0, 255] },
                    { name: 'Neon Yellow', hex: 'ffff00', rgb: [255, 255, 0] },
                    { name: 'Electric Orange', hex: 'ff4500', rgb: [255, 69, 0] },
                    { name: 'Neon Green', hex: '39ff14', rgb: [57, 255, 20] },
                    { name: 'Electric Red', hex: 'ff073a', rgb: [255, 7, 58] }
                ]
            },
            pastel: {
                name: 'Pastel',
                colors: [
                    { name: 'Pastel Pink', hex: 'ffd1dc', rgb: [255, 209, 220] },
                    { name: 'Pastel Blue', hex: 'aec6cf', rgb: [174, 198, 207] },
                    { name: 'Pastel Green', hex: 'b6e5d8', rgb: [182, 229, 216] },
                    { name: 'Pastel Yellow', hex: 'fff5ba', rgb: [255, 245, 186] },
                    { name: 'Pastel Purple', hex: 'e6e6fa', rgb: [230, 230, 250] },
                    { name: 'Pastel Orange', hex: 'ffcccb', rgb: [255, 204, 203] },
                    { name: 'Pastel Mint', hex: 'c7f0db', rgb: [199, 240, 219] },
                    { name: 'Pastel Peach', hex: 'ffcba4', rgb: [255, 203, 164] }
                ]
            },
            monochrome: {
                name: 'Monochrome',
                colors: [
                    { name: 'Black', hex: '000000', rgb: [0, 0, 0] },
                    { name: 'Gray 900', hex: '1a1a1a', rgb: [26, 26, 26] },
                    { name: 'Gray 800', hex: '333333', rgb: [51, 51, 51] },
                    { name: 'Gray 700', hex: '4d4d4d', rgb: [77, 77, 77] },
                    { name: 'Gray 600', hex: '666666', rgb: [102, 102, 102] },
                    { name: 'Gray 500', hex: '808080', rgb: [128, 128, 128] },
                    { name: 'Gray 400', hex: '999999', rgb: [153, 153, 153] },
                    { name: 'Gray 300', hex: 'b3b3b3', rgb: [179, 179, 179] },
                    { name: 'Gray 200', hex: 'cccccc', rgb: [204, 204, 204] },
                    { name: 'Gray 100', hex: 'e6e6e6', rgb: [230, 230, 230] },
                    { name: 'White', hex: 'ffffff', rgb: [255, 255, 255] }
                ]
            },
            ocean: {
                name: 'Ocean',
                colors: [
                    { name: 'Deep Sea', hex: '003f5c', rgb: [0, 63, 92] },
                    { name: 'Ocean Blue', hex: '2f4b7c', rgb: [47, 75, 124] },
                    { name: 'Sea Blue', hex: '665191', rgb: [102, 81, 145] },
                    { name: 'Teal Wave', hex: 'a05195', rgb: [160, 81, 149] },
                    { name: 'Coral', hex: 'd45087', rgb: [212, 80, 135] },
                    { name: 'Sunset', hex: 'f95d6a', rgb: [249, 93, 106] },
                    { name: 'Sand', hex: 'ff7c43', rgb: [255, 124, 67] },
                    { name: 'Golden', hex: 'ffa600', rgb: [255, 166, 0] }
                ]
            },
            forest: {
                name: 'Forest',
                colors: [
                    { name: 'Dark Forest', hex: '1b4332', rgb: [27, 67, 50] },
                    { name: 'Pine Green', hex: '2d5016', rgb: [45, 80, 22] },
                    { name: 'Moss Green', hex: '52796f', rgb: [82, 121, 111] },
                    { name: 'Sage', hex: '84a98c', rgb: [132, 169, 140] },
                    { name: 'Mint', hex: 'cad2c5', rgb: [202, 210, 197] },
                    { name: 'Earth Brown', hex: '8b4513', rgb: [139, 69, 19] },
                    { name: 'Bark', hex: '6f4e37', rgb: [111, 78, 55] },
                    { name: 'Mushroom', hex: 'a0522d', rgb: [160, 82, 45] }
                ]
            }
        };

        const { palette } = req.query;
        
        if (palette && palettes[palette]) {
            res.json({ 
                success: true, 
                palette: palettes[palette] 
            });
        } else {
            res.json({ 
                success: true, 
                palettes: Object.keys(palettes).map(key => ({
                    id: key,
                    name: palettes[key].name,
                    colors: palettes[key].colors.slice(0, 5) // Show first 5 colors as preview
                })),
                available: Object.keys(palettes)
            });
        }
    }
    
}
module.exports = ImageGenerationAddon;





// DOCS
/**




Here are the available URL endpoints to generate images:

## Main Image Generation
```
GET http://localhost:3000/image/generate?text=Hello&width=400&height=200&bgColor=3b82f6&textColor=ffffff&format=svg
```

## Specific Image Types

### Avatar Generation
```
GET http://localhost:3000/image/avatar?name=John Doe&size=200&format=png
GET http://localhost:3000/image/avatar?name=Jane Smith&bgColor=e91e63&size=150&format=svg
```

### Gradient Images
```
GET http://localhost:3000/image/gradient?width=800&height=400&gradientColors=ff6b6b,4ecdc4&format=png
GET http://localhost:3000/image/gradient?gradientType=radial&gradientColors=purple,pink,orange&width=300&height=300
```

### Pattern Generation
```
GET http://localhost:3000/image/pattern?type=dots&width=400&height=300&primaryColor=0284C7&secondaryColor=ffffff&size=10&spacing=20
GET http://localhost:3000/image/pattern?type=stripes&width=500&height=200&primaryColor=ef4444&format=png
GET http://localhost:3000/image/pattern?type=hexagon&width=600&height=400&primaryColor=10b981&size=15&spacing=30
```

### Chart Generation
```
GET http://localhost:3000/image/chart?type=bar&data=10,20,30,40&labels=A,B,C,D&width=400&height=300&title=Sales Data
GET http://localhost:3000/image/chart?type=pie&data=25,35,20,20&labels=Q1,Q2,Q3,Q4&colors=3b82f6,ef4444,10b981,f59e0b
GET http://localhost:3000/image/chart?type=line&data=5,15,10,25,20&width=500&height=250
```

### Badge Generation
```
GET http://localhost:3000/image/badge?label=Status&message=Active&color=4c1&format=svg
GET http://localhost:3000/image/badge?label=Version&message=v2.0.0&labelColor=555&color=blue
```

### Logo Generation
```
GET http://localhost:3000/image/logo?text=LOGO&style=modern&width=300&height=100&primaryColor=2563eb
GET http://localhost:3000/image/logo?text=Brand&style=classic&width=250&height=80&format=png
```

### Banner Generation
```
GET http://localhost:3000/image/banner?title=Welcome&subtitle=To our service&width=800&height=200&bgColor=1f2937
GET http://localhost:3000/image/banner?title=Sale&subtitle=50% Off&width=600&height=150&style=gradient
```

### Social Media Images
```
GET http://localhost:3000/image/social?platform=twitter&title=Check this out!&bgColor=1DA1F2
GET http://localhost:3000/image/social?platform=instagram&title=New Post&subtitle=Amazing content
```

### QR Code Generation
```
GET http://localhost:3000/image/qr?data=https://example.com&size=200&format=svg
GET http://localhost:3000/image/qr?data=Hello World&size=150&bgColor=ffffff&fgColor=000000
```

## Advanced Parameters

### Text Styling
- `fontSize=24` - Font size
- `fontFamily=Arial` - Font family
- `fontWeight=bold` - Font weight
- `textAlign=center` - Text alignment
- `letterSpacing=2` - Letter spacing
- `multiline=true` - Enable multiline text (use `\n` for line breaks)

### Visual Effects
- `shadow=true&shadowColor=000000&shadowBlur=5` - Add shadow
- `borderRadius=10&borderWidth=2&borderColor=333333` - Add borders
- `gradient=true&gradientColors=ff0000,00ff00,0000ff` - Gradient backgrounds
- `opacity=0.8` - Set opacity
- `rotation=45` - Rotate text

### Example with Multiple Effects
```
GET http://localhost:3000/image/generate?text=Styled Text&width=400&height=200&bgColor=1e40af&textColor=ffffff&fontSize=32&fontWeight=bold&shadow=true&shadowColor=000000&shadowBlur=8&borderRadius=15&gradient=true&gradientColors=3b82f6,1e40af&format=png
```

All endpoints support `format` parameter with values: `svg`, `png`, `jpeg`, `webp`



 */