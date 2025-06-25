require('dotenv').config();
const express = require('express');
const { TwitterApi } = require('twitter-api-v2');
const { RestliClient } = require('linkedin-api-client');
const FB = require('facebook-node-sdk');
const axios = require('axios');
const WebSocket = require('ws');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize API clients
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
}).readWrite;

const linkedinClient = new RestliClient();

const fbClient = new FB({
  appId: process.env.FACEBOOK_APP_ID,
  appSecret: process.env.FACEBOOK_APP_SECRET,
  accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
  version: 'v21.0',
});

// Instagram client uses Facebook Graph API
const instagramClient = axios.create({
  baseURL: 'https://graph.instagram.com',
  headers: { Authorization: `Bearer ${process.env.FACEBOOK_ACCESS_TOKEN}` },
});

// Status endpoint
app.get('/api/status', (req, res) => {
  const status = {
    facebook: !!process.env.FACEBOOK_ACCESS_TOKEN,
    twitter: !!(process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN),
    linkedin: !!process.env.LINKEDIN_ACCESS_TOKEN,
    instagram: !!process.env.FACEBOOK_ACCESS_TOKEN,
  };
  res.json(status);
});

// Share thought (post)
app.post('/api/share_thought', async (req, res) => {
  const { platform, content, mediaUrls } = req.body;
  try {
    let response;
    switch (platform) {
      case 'twitter':
        response = await twitterClient.v2.tweet({
          text: content,
          media: mediaUrls ? { media_ids: await uploadTwitterMedia(mediaUrls) } : {},
        });
        break;
      case 'facebook':
        response = await new Promise((resolve, reject) => {
          fbClient.api('/me/feed', 'POST', { message: content, link: mediaUrls?.[0] }, (r) => r.error ? reject(r.error) : resolve(r));
        });
        break;
      case 'linkedin':
        response = await linkedinClient.create({
          resourcePath: '/posts',
          entity: {
            actor: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
            message: { text: content },
            content: mediaUrls ? { media: { id: await uploadLinkedInMedia(mediaUrls[0]) } } : {},
          },
          accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
          versionString: '202502',
        });
        break;
      case 'instagram':
        if (!mediaUrls) throw new Error('Media required for Instagram');
        const mediaResponse = await instagramClient.post('/me/media', {
          image_url: mediaUrls[0],
          caption: content,
        });
        response = await instagramClient.post(`/me/media_publish`, { creation_id: mediaResponse.data.id });
        break;
      default:
        throw new Error('Invalid platform');
    }
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Comment or reply
app.post('/api/comment', async (req, res) => {
  const { platform, postId, commentText } = req.body;
  try {
    let response;
    switch (platform) {
      case 'twitter':
        response = await twitterClient.v2.reply(commentText, postId);
        break;
      case 'facebook':
        response = await new Promise((resolve, reject) => {
          fbClient.api(`/${postId}/comments`, 'POST', { message: commentText }, (r) => r.error ? reject(r.error) : resolve(r));
        });
        break;
      case 'linkedin':
        response = await linkedinClient.create({
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
        response = await instagramClient.post(`/${postId}/comments`, { message: commentText });
        break;
      default:
        throw new Error('Invalid platform');
    }
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Share post
app.post('/api/share', async (req, res) => {
  const { platform, postId, message } = req.body;
  try {
    let response;
    switch (platform) {
      case 'twitter':
        response = await twitterClient.v2.retweet(process.env.TWITTER_USER_ID, postId);
        break;
      case 'facebook':
        response = await new Promise((resolve, reject) => {
          fbClient.api('/me/feed', 'POST', { message, link: `https://www.facebook.com/${postId}` }, (r) => r.error ? reject(r.error) : resolve(r));
        });
        break;
      case 'linkedin':
        response = await linkedinClient.create({
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
});

// React to post
app.post('/api/react', async (req, res) => {
  const { platform, postId, reaction } = req.body;
  try {
    let response;
    switch (platform) {
      case 'twitter':
        response = await twitterClient.v2.like(process.env.TWITTER_USER_ID, postId);
        break;
      case 'facebook':
        response = await new Promise((resolve, reject) => {
          fbClient.api(`/${postId}/likes`, 'POST', {}, (r) => r.error ? reject(r.error) : resolve(r));
        });
        break;
      case 'linkedin':
        response = await linkedinClient.create({
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
        response = await instagramClient.post(`/${postId}/likes`);
        break;
      default:
        throw new Error('Invalid platform');
    }
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions
async function uploadTwitterMedia(mediaUrls) {
  const mediaIds = [];
  for (const url of mediaUrls) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const mediaId = await twitterClient.v1.uploadMedia(Buffer.from(response.data), { mimeType: response.headers['content-type'] });
    mediaIds.push(mediaId);
  }
  return mediaIds;
}

async function uploadLinkedInMedia(mediaUrl) {
  const registerResponse = await linkedinClient.create({
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

// WebSocket setup
const server = app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const { action, data } = JSON.parse(message);
    let response;
    try {
      switch (action) {
        case 'share_thought':
          response = await handleShareThought(data);
          break;
        case 'comment':
          response = await handleComment(data);
          break;
        case 'share':
          response = await handleShare(data);
          break;
        case 'react':
          response = await handleReact(data);
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

// WebSocket handlers
async function handleShareThought({ platform, content, mediaUrls }) {
  switch (platform) {
    case 'twitter':
      return await twitterClient.v2.tweet({
        text: content,
        media: mediaUrls ? { media_ids: await uploadTwitterMedia(mediaUrls) } : {},
      });
    case 'facebook':
      return await new Promise((resolve, reject) => {
        fbClient.api('/me/feed', 'POST', { message: content, link: mediaUrls?.[0] }, (r) => r.error ? reject(r.error) : resolve(r));
      });
    case 'linkedin':
      return await linkedinClient.create({
        resourcePath: '/posts',
        entity: {
          actor: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
          message: { text: content },
          content: mediaUrls ? { media: { id: await uploadLinkedInMedia(mediaUrls[0]) } } : {},
        },
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
        versionString: '202502',
      });
    case 'instagram':
      if (!mediaUrls) throw new Error('Media required for Instagram');
      const mediaResponse = await instagramClient.post('/me/media', {
        image_url: mediaUrls[0],
        caption: content,
      });
      return await instagramClient.post(`/me/media_publish`, { creation_id: mediaResponse.data.id });
    default:
      throw new Error('Invalid platform');
  }
}

async function handleComment({ platform, postId, commentText }) {
  switch (platform) {
    case 'twitter':
      return await twitterClient.v2.reply(commentText, postId);
    case 'facebook':
      return await new Promise((resolve, reject) => {
        fbClient.api(`/${postId}/comments`, 'POST', { message: commentText }, (r) => r.error ? reject(r.error) : resolve(r));
      });
    case 'linkedin':
      return await linkedinClient.create({
        resourcePath: `/posts/${encodeURIComponent(postId)}/comments`,
        entity: {
          actor: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
          message: { text: commentText },
        },
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
        versionString: '202502',
      });
    case 'instagram':
      return await instagramClient.post(`/${postId}/comments`, { message: commentText });
    default:
      throw new Error('Invalid platform');
  }
}

async function handleShare({ platform, postId, message }) {
  switch (platform) {
    case 'twitter':
      return await twitterClient.v2.retweet(process.env.TWITTER_USER_ID, postId);
    case 'facebook':
      return await new Promise((resolve, reject) => {
        fbClient.api('/me/feed', 'POST', { message, link: `https://www.facebook.com/${postId}` }, (r) => r.error ? reject(r.error) : resolve(r));
      });
    case 'linkedin':
      return await linkedinClient.create({
        resourcePath: '/posts',
        entity: {
          actor: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
          message: { text: message },
          content: { share: postId },
        },
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
        versionString: '202502',
      });
    case 'instagram':
      throw new Error('Instagram does not support sharing posts via API');
    default:
      throw new Error('Invalid platform');
  }
}

async function handleReact({ platform, postId, reaction }) {
  switch (platform) {
    case 'twitter':
      return await twitterClient.v2.like(process.env.TWITTER_USER_ID, postId);
    case 'facebook':
      return await new Promise((resolve, reject) => {
        fbClient.api(`/${postId}/likes`, 'POST', {}, (r) => r.error ? reject(r.error) : resolve(r));
      });
    case 'linkedin':
      return await linkedinClient.create({
        resourcePath: `/posts/${encodeURIComponent(postId)}/reactions`,
        entity: {
          actor: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
          reactionType: reaction || 'LIKE',
        },
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
        versionString: '202502',
      });
    case 'instagram':
      return await instagramClient.post(`/${postId}/likes`);
    default:
      throw new Error('Invalid platform');
  }
}