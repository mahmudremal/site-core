
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatProduct = ( product ) => {
  return [product].map(p => ({
    // id: 5897,
    // name: "AuraFlow Pro Wireless Headphones",
    // price: "199.99",
    // original_price: "249.99",
    // short_description: "Experience unparalleled sound clarity and comfort with AuraFlow Pro, featuring active noise cancellation and a 30-hour battery life.",
    // description: "<p>Immerse yourself in a world of pure audio with the <strong>AuraFlow Pro Wireless Headphones</strong>. Crafted for audiophiles and everyday listeners alike, these headphones deliver a balanced, high-fidelity sound that brings your music, podcasts, and calls to life. The advanced <strong>Active Noise Cancellation (ANC)</strong> technology silences the world around you, allowing for uninterrupted listening pleasure, while the transparent mode keeps you aware of your surroundings when needed. A single charge provides an incredible <strong>30 hours of continuous playback</strong>, ensuring your soundtrack lasts all day and night. The lightweight, ergonomic design with plush memory foam earcups guarantees comfort even during long sessions. Built-in touch controls let you manage your audio and calls effortlessly.</p>",
    // images: [...Array(10).keys()].map(i => `https://picsum.photos/seed/${i}/1000/1000`),
    // average_rating: 4.8,
    // reviews_count: 512,
    // variations: {
    //   color: {
    //     label: "Color",
    //     type: "color",
    //     options: [
    //       {
    //         value: "midnight_black",
    //         label: "Midnight Black",
    //         color: "#1C1C1C",
    //         image: "https://picsum.photos/seed/11/200/200"
    //       },
    //       {
    //         value: "starlight_silver",
    //         label: "Starlight Silver",
    //         color: "#C0C0C0",
    //         image: "https://picsum.photos/seed/12/200/200"
    //       },
    //       {
    //         value: "arctic_white",
    //         label: "Arctic White",
    //         color: "#F0F8FF",
    //         image: "https://picsum.photos/seed/13/200/200"
    //       }
    //     ]
    //   },
    //   model: {
    //     label: "Model",
    //     type: "button",
    //     options: [
    //       {
    //         value: "pro",
    //         label: "Pro",
    //         price: "199.99"
    //       },
    //       {
    //         value: "pro_plus",
    //         label: "Pro+",
    //         price: "249.99"
    //       }
    //     ]
    //   }
    // },
    // features: [
    //   "Hybrid Active Noise Cancellation (ANC)",
    //   "Transparency Mode",
    //   "30-Hour Battery Life",
    //   "Fast Charging: 10 mins = 5 hours playback",
    //   "Bluetooth 5.2 Connectivity",
    //   "Customizable EQ settings via companion app",
    //   "Built-in microphone for clear calls"
    // ],
    // specifications: {
    //   "Driver Size": "40mm Bio-Cellulose Drivers",
    //   "Frequency Response": "10Hz - 25kHz",
    //   "Bluetooth Codecs": "SBC, AAC, aptX HD",
    //   "Battery Life": "Up to 30 hours (ANC on)",
    //   "Charging Port": "USB-C",
    //   "Weight": "250g",
    //   "Material": "Premium matte-finish plastic with aluminum accents"
    // },
    ...p
  }))[0];
}