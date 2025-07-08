require('dotenv').config();
const express = require('express');
const { TwitterApi } = require('twitter-api-v2');
const { RestliClient } = require('linkedin-api-client');
const FB = require('facebook-node-sdk');
const axios = require('axios');
const WebSocket = require('ws');

class SocialServerAddon {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.port = process.env.PORT || 3000;
    }

    init() {
        this.twitterClient = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        }).readWrite;

        this.linkedinClient = new RestliClient();

        this.fbClient = new FB({
            appId: process.env.FACEBOOK_APP_ID,
            appSecret: process.env.FACEBOOK_APP_SECRET,
            accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
            version: 'v21.0',
        });

        this.instagramClient = axios.create({
            baseURL: 'https://graph.instagram.com',
            headers: { Authorization: `Bearer ${process.env.FACEBOOK_ACCESS_TOKEN}` },
        });

        this.setupWebSocket();
    }
    
    register(router) {
        router.get('/api/status', this.getStatus.bind(this));
        router.post('/api/share_thought', this.shareThought.bind(this));
        router.post('/api/comment', this.comment.bind(this));
        router.post('/api/share', this.share.bind(this));
        router.post('/api/react', this.react.bind(this));
    }

    getStatus(req, res) {
        const status = {
            facebook: !!process.env.FACEBOOK_ACCESS_TOKEN,
            twitter: !!(process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN),
            linkedin: !!process.env.LINKEDIN_ACCESS_TOKEN,
            instagram: !!process.env.FACEBOOK_ACCESS_TOKEN,
        };
        res.json(status);
    }

    async shareThought(req, res) {
        const { platform, content, mediaUrls } = req.body;
        try {
            let response;
            switch (platform) {
                case 'twitter':
                    response = await this.twitterClient.v2.tweet({
                        text: content,
                        media: mediaUrls ? { media_ids: await this.uploadTwitterMedia(mediaUrls) } : {},
                    });
                    break;
                case 'facebook':
                    response = await new Promise((resolve, reject) => {
                        this.fbClient.api('/me/feed', 'POST', { message: content, link: mediaUrls?.[0] }, (r) => r.error ? reject(r.error) : resolve(r));
                    });
                    break;
                case 'linkedin':
                    response = await this.linkedinClient.create({
                        resourcePath: '/posts',
                        entity: {
                            actor: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
                            message: { text: content },
                            content: mediaUrls ? { media: { id: await this.uploadLinkedInMedia(mediaUrls[0]) } } : {},
                        },
                        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
                        versionString: '202502',
                    });
                    break;
                case 'instagram':
                    if (!mediaUrls) throw new Error('Media required for Instagram');
                    const mediaResponse = await this.instagramClient.post('/me/media', {
                        image_url: mediaUrls[0],
                        caption: content,
                    });
                    response = await this.instagramClient.post(`/me/media_publish`, { creation_id: mediaResponse.data.id });
                    break;
                default:
                    throw new Error('Invalid platform');
            }
            res.json({ success: true, data: response.data });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async comment(req, res) {
        const { platform, postId, commentText } = req.body;
        try {
            let response;
            switch (platform) {
                case 'twitter':
                    response = await this.twitterClient.v2.reply(commentText, postId);
                    break;
                case 'facebook':
                    response = await new Promise((resolve, reject) => {
                        this.fbClient.api(`/${postId}/comments`, 'POST', { message: commentText }, (r) => r.error ? reject(r.error) : resolve(r));
                    });
                    break;
                case 'linkedin':
                    response = await this.linkedinClient.create({
                        resourcePath: `/posts/${encodeURIComponent(postId)}/comments`,
                        entity: {
                            actor: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
                            message: { text: commentText },
                        },
                        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
                        versionString: '202502',
                    });
                    break;
                case 'instagram':
                    response = await this.instagramClient.post(`/${postId}/comments`, { message: commentText });
                    break;
                default:
                    throw new Error('Invalid platform');
            }
            res.json({ success: true, data: response.data });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async share(req, res) {
        const { platform, postId, message } = req.body;
        try {
            let response;
            switch (platform) {
                case 'twitter':
                    response = await this.twitterClient.v2.retweet(process.env.TWITTER_USER_ID, postId);
                    break;
                case 'facebook':
                    response = await new Promise((resolve, reject) => {
                        this.fbClient.api('/me/feed', 'POST', { message, link: `https://www.facebook.com/${postId}` }, (r) => r.error ? reject(r.error) : resolve(r));
                    });
                    break;
                case 'linkedin':
                    response = await this.linkedinClient.create({
                        resourcePath: '/posts',
                        entity: {
                            actor: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
                            message: { text: message },
                            content: { share: postId },
                        },
                        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
                        versionString: '202502',
                    });
                    break;
                case 'instagram':
                    throw new Error('Instagram does not support sharing posts via API');
                default:
                    throw new Error('Invalid platform');
            }
            res.json({ success: true, data: response.data });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async react(req, res) {
        const { platform, postId, reaction } = req.body;
        try {
            let response;
            switch (platform) {
                case 'twitter':
                    response = await this.twitterClient.v2.like(process.env.TWITTER_USER_ID, postId);
                    break;
                case 'facebook':
                    response = await new Promise((resolve, reject) => {
                        this.fbClient.api(`/${postId}/likes`, 'POST', {}, (r) => r.error ? reject(r.error) : resolve(r));
                    });
                    break;
                case 'linkedin':
                    response = await this.linkedinClient.create({
                        resourcePath: `/posts/${encodeURIComponent(postId)}/reactions`,
                        entity: {
                            actor: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
                            reactionType: reaction || 'LIKE',
                        },
                        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
                        versionString: '202502',
                    });
                    break;
                case 'instagram':
                    response = await this.instagramClient.post(`/${postId}/likes`);
                    break;
                default:
                    throw new Error('Invalid platform');
            }
            res.json({ success: true, data: response.data });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    setupWebSocket() {
        const wss = new WebSocket.Server({ server: this.app });
        wss.on('connection', (ws) => {
            ws.on('message', async (message) => {
                const { action, data } = JSON.parse(message);
                let response;
                try {
                    switch (action) {
                        case 'share_thought':
                            response = await this.shareThought(data);
                            break;
                        case 'comment':
                            response = await this.comment(data);
                            break;
                        case 'share':
                            response = await this.share(data);
                            break;
                        case 'react':
                            response = await this.react(data);
                            break;
                        default:
                            throw new Error('Invalid action');
                    }
                    ws.send(JSON.stringify({ success: true, data: response }));
                } catch (error) {
                    ws.send(JSON.stringify({ success: false, error: error.message }));
                }
            });
        });
    }

    async uploadTwitterMedia(mediaUrls) {
        const mediaIds = [];
        for (const url of mediaUrls) {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const mediaId = await this.twitterClient.v1.uploadMedia(Buffer.from(response.data), { mimeType: response.headers['content-type'] });
            mediaIds.push(mediaId);
        }
        return mediaIds;
    }

    async uploadLinkedInMedia(mediaUrl) {
        const registerResponse = await this.linkedinClient.create({
            resourcePath: '/assets?action=registerUpload',
            entity: { asset: 'urn:li:digitalmediaAsset:new' },
            accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
            versionString: '202502',
        });
        const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
        const assetUrn = registerResponse.data.value.asset;
        const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
        await axios.put(uploadUrl, Buffer.from(response.data), {
            headers: { 'Content-Type': response.headers['content-type'] },
        });
        return assetUrn;
    }
}

module.exports = SocialServerAddon;