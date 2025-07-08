import { Video, Comment } from "../types";

export const videos = [
  {
    id: "1",
    title: "Introduction to React Hooks",
    thumbnail: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/08925d20-60a2-4834-bbf3-728e9cc8a4af.jpg",
    channelName: "CodeMaster",
    channelAvatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/7715e577-904c-46a7-91f9-3fa92141bb11.jpg",
    views: 1254789,
    uploadedAt: "2 weeks ago",
    duration: "15:24",
    description: "Learn the fundamentals of React Hooks and how they can improve your code structure and reusability.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    likes: 45000,
    dislikes: 850,
    category: "Programming"
  },
  {
    id: "2",
    title: "The Ultimate Street Food Tour",
    thumbnail: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/5a844505-874a-4ce4-bed0-66e14e1b0c65.jpg",
    channelName: "Food Explorer",
    channelAvatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/b780d460-b328-425c-96fc-bb20373a3d62.jpg",
    views: 3457890,
    uploadedAt: "3 days ago",
    duration: "23:42",
    description: "Join us on a street food adventure through the markets of Southeast Asia.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    likes: 120000,
    dislikes: 1200,
    category: "Food"
  },
  {
    id: "3",
    title: "Top 10 Places to Visit Before 2026",
    thumbnail: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/2502fad7-c0b0-4b41-a1fc-154eec6bcce7.jpg",
    channelName: "Travel Insider",
    channelAvatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/aaea353f-1851-4bbd-9fc5-b460c44d0836.jpg",
    views: 2142567,
    uploadedAt: "1 month ago",
    duration: "18:15",
    description: "Discover the most breathtaking destinations you need to visit in the next year.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    likes: 89000,
    dislikes: 1500,
    category: "Travel"
  },
  {
    id: "4",
    title: "Modern JavaScript: ES6 and Beyond",
    thumbnail: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/c07bd796-7bf0-46b9-b788-c8404c7834bb.jpg",
    channelName: "Web Dev Master",
    channelAvatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/203244d9-33f9-4ba2-8d4d-7938af0d5c32.jpg",
    views: 987345,
    uploadedAt: "5 days ago",
    duration: "28:10",
    description: "Dive deep into modern JavaScript features and best practices for 2025.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    likes: 34500,
    dislikes: 430,
    category: "Programming"
  },
  {
    id: "5",
    title: "Morning Routine: 5AM Club",
    thumbnail: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/829813f6-25a1-48ab-aa9b-4f757d9c1516.jpg",
    channelName: "Productivity Hub",
    channelAvatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/0544027e-2ceb-4adf-9571-9b51e5a49466.jpg",
    views: 5432198,
    uploadedAt: "2 months ago",
    duration: "12:45",
    description: "How starting your day at 5AM can transform your productivity and mental health.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    likes: 230000,
    dislikes: 8500,
    category: "Lifestyle"
  },
  {
    id: "6",
    title: "Basic Cooking Skills Everyone Should Know",
    thumbnail: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/3378b566-b67f-41ec-8e21-95e5194c34db.jpg",
    channelName: "Kitchen Academy",
    channelAvatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/5d2d18db-a7fd-405a-b385-2460bec7a477.jpg",
    views: 876543,
    uploadedAt: "4 weeks ago",
    duration: "32:18",
    description: "Master these essential cooking techniques to elevate your home cuisine.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    likes: 67000,
    dislikes: 890,
    category: "Food"
  },
  {
    id: "7",
    title: "Beginner's Guide to Digital Photography",
    thumbnail: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/4719cbbb-b3f6-4d44-af8e-9b115bcf23cc.jpg",
    channelName: "Creative Lens",
    channelAvatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/2474f2fd-0a3d-422e-b0aa-2d52344a8a3f.jpg",
    views: 1345298,
    uploadedAt: "3 weeks ago",
    duration: "24:52",
    description: "Learn the fundamentals of composition, lighting, and camera settings for stunning photos.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    likes: 78000,
    dislikes: 1200,
    category: "Photography"
  },
  {
    id: "8",
    title: "Full Body Workout at Home - No Equipment",
    thumbnail: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/c5b3bf40-d81d-4fb1-908b-5d9a3f0b05e2.jpg",
    channelName: "Fit & Healthy",
    channelAvatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/cba01ba7-7ba4-4f1d-813a-e7b0fcb56bd4.jpg",
    views: 4567890,
    uploadedAt: "1 week ago",
    duration: "35:20",
    description: "A complete workout routine that targets all muscle groups without any equipment.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    likes: 156000,
    dislikes: 2300,
    category: "Fitness"
  }
];

export const recommendedVideos = (currentVideoId) => {
  return videos.filter(video => video.id !== currentVideoId).slice(0, 6);
};

export const videoCategories = [
  "All",
  "Programming",
  "Food",
  "Travel",
  "Music",
  "Gaming",
  "Sports",
  "Education",
  "Lifestyle",
  "News",
  "Entertainment",
  "Science",
  "Technology",
  "Photography",
  "Fitness"
];

export const comments = {
  "1": [
    {
      id: "c1",
      username: "ReactFan42",
      avatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/8681c453-00d8-417e-a811-bbd33322ccdd.jpg",
      content: "This tutorial completely changed how I approach React development. Hooks are a game changer!",
      likes: 245,
      timestamp: "2 days ago",
      replies: [
        {
          id: "r1c1",
          username: "JsDevLearner",
          avatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/c03bc65b-84d7-47e5-9891-b70d51b5eef4.jpg",
          content: "I agree! useState and useEffect solved so many problems for me.",
          likes: 34,
          timestamp: "1 day ago"
        }
      ]
    },
    {
      id: "c2",
      username: "CodeNewbie",
      avatar: "https://sider.ai/autoimage/avatar3",
      content: "Could you explain useCallback a bit more? I'm still confused about when to use it.",
      likes: 67,
      timestamp: "3 days ago",
      replies: [
        {
          id: "r1c2",
          username: "CodeMaster",
          avatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/7715e577-904c-46a7-91f9-3fa92141bb11.jpg",
          content: "Sure! useCallback is mainly used to prevent unnecessary re-renders when passing functions as props to child components. Check out my dedicated video on this topic!",
          likes: 89,
          timestamp: "2 days ago"
        }
      ]
    }
  ],
  "2": [
    {
      id: "c1",
      username: "FoodLover88",
      avatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/fbe3101a-b3ec-4a70-bb92-dcd0c71d3a0d.jpg",
      content: "The street food in Thailand looks absolutely incredible! Adding it to my travel bucket list right now!",
      likes: 412,
      timestamp: "1 day ago"
    },
    {
      id: "c2",
      username: "ChefAtHome",
      avatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/3c8083a0-556f-45cf-a2c2-1359f1a399db.jpg",
      content: "Does anyone know where to find that specific noodle dish shown at 12:45? I need to try making it!",
      likes: 156,
      timestamp: "2 days ago",
      replies: [
        {
          id: "r1c2",
          username: "AsianCuisineExpert",
          avatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/d9f0defd-a209-43e5-a4e9-be58b93ee086.jpg",
          content: "It's called Pad See Ew. Here's a recipe link: https://www.example.com/pad-see-ew-recipe",
          likes: 78,
          timestamp: "1 day ago"
        }
      ]
    }
  ]
};

// Generate comments for other videos
for (let i = 3; i <= 8; i++) {
  comments[i.toString()] = [
    {
      id: `c1v${i}`,
      username: `User${Math.floor(Math.random() * 1000)}`,
      avatar: `https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/35060b80-cce1-40a0-8704-c441ec7378e2.jpg`,
      content: "Great video! I really enjoyed the content and learned a lot.",
      likes: Math.floor(Math.random() * 500),
      timestamp: `${Math.floor(Math.random() * 7) + 1} days ago`
    },
    {
      id: `c2v${i}`,
      username: `User${Math.floor(Math.random() * 1000)}`,
      avatar: `https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/35060b80-cce1-40a0-8704-c441ec7378e2.jpg`,
      content: "Thanks for sharing this information. Looking forward to more videos on this topic.",
      likes: Math.floor(Math.random() * 300),
      timestamp: `${Math.floor(Math.random() * 14) + 1} days ago`
    }
  ];
}

export const currentUser = {
  id: "user1",
  username: "CurrentUser",
  avatar: "https://pub-cdn.wisebox.ai/u/U0BGVHO7LB/web-coder/68513c2008c59a1ded13a738/resource/34b5acc3-00d0-4177-85ab-eef2ae6d7437.jpg",
  isLoggedIn: true
};