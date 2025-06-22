import React, { useEffect } from 'react';

const LoadStyles = () => {
  useEffect(() => {
    const stylesheets = [
      "/dist/library/css/remixicon.css",
      "/dist/library/css/bootstrap.min.css",
      "/dist/library/css/apexcharts.css",
      "/dist/library/css/dataTables.min.css",
      "/dist/library/css/editor-katex.min.css",
      "/dist/library/css/editor.atom-one-dark.min.css",
      "/dist/library/css/editor.quill.snow.css",
      "/dist/library/css/flatpickr.min.css",
      "/dist/library/css/full-calendar.css",
      "/dist/library/css/jquery-jvectormap-2.0.5.css",
      "/dist/library/css/magnific-popup.css",
      "/dist/library/css/slick.css",
      "/dist/library/css/prism.css",
      "/dist/library/css/file-upload.css",
      "/dist/library/css/audioplayer.css",
      "/dist/library/css/style.css"
    ];

    stylesheets.forEach((stylesheet) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = stylesheet;
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    });

    const scripts = [];
    
    scripts.forEach((src) => {
      const script = document.createElement("script");
      script.src = src;
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    });
  }, []);  // Empty dependency array ensures this runs only once

  return null; // No need to render anything
};

export default LoadStyles;
