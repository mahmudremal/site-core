const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('Connected to server');
};

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log('Server response:', response);
};

// Check platform status
fetch('http://localhost:3000/api/status')
  .then(res => res.json())
  .then(status => console.log('Platform status:', status));

// // Example WebSocket actions
// function shareThought(platform, content, mediaUrls) {
//   ws.send(JSON.stringify({
//     action: 'share_thought',
//     data: { platform, content, mediaUrls }
//   }));
// }

// function comment(platform, postId, commentText) {
//   ws.send(JSON.stringify({
//     action: 'comment',
//     data: { platform, postId, commentText }
//   }));
// }

// // Example REST API calls
// async function shareThoughtRest(platform, content, mediaUrls) {
//   const res = await fetch('http://localhost:3000/api/share_thought', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ platform, content, mediaUrls })
//   });
//   return res.json();
// }