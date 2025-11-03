import { useEffect } from "react";
export default function TawkWidget() {

  /*
  Tawk_API = Tawk_API || {};
  window.Tawk_API.autoStart = false;
  window.Tawk_API.onStatusChange = function(status){
    # online | away | offline
    if (status === 'online') {
      window.Tawk_API.start({showWidget : true});
    }
  };
  window.Tawk_API.onChatMinimized = () => {window.Tawk_API.shutdown();};
  window.Tawk_API.onLoad = () => {}
  window.Tawk_API.onBeforeLoad = () => {}
  window.Tawk_API.onChatMaximized = () => {}
  window.Tawk_API.onChatMinimized = () => {}
  window.Tawk_API.onChatHidden = () => {}
  window.Tawk_API.onChatStarted = () => {}
  window.Tawk_API.onChatEnded = () => {}
  window.Tawk_API.onPrechatSubmit = (data) => {}
  window.Tawk_API.onOfflineSubmit = (data) => {}
  window.Tawk_API.onChatMessageVisitor = (message) => {}
  window.Tawk_API.onChatMessageAgent = (message) => {}
  window.Tawk_API.onChatMessageSystem = (message) => {}
  window.Tawk_API.onAgentJoinChat = (data) => {}
  window.Tawk_API.onAgentLeaveChat = (data) => {}
  window.Tawk_API.onChatSatisfaction = (data) => {}
  window.Tawk_API.onVisitorNameChanged = (name) => {}
  window.Tawk_API.onFileUpload = (link) => {}
  window.Tawk_API.onTagsUpdated = (data) => {}
  window.Tawk_API.visitor = {
    name  : 'Name',
    email : 'email@email.com'
  };
  window.Tawk_API.maximize();
  window.Tawk_API.minimize();
  window.Tawk_API.toggle();
  window.Tawk_API.popup();
  window.Tawk_API.getWindowType();
  window.Tawk_API.showWidget();
  window.Tawk_API.hideWidget();
  window.Tawk_API.toggleVisibility();
  window.Tawk_API.getStatus();
  window.Tawk_API.isChatMaximized();
  window.Tawk_API.isChatMinimized();
  window.Tawk_API.isChatHidden();
  window.Tawk_API.isChatOngoing();
  window.Tawk_API.isVisitorEngaged();
  window.Tawk_API.endChat();
  window.Tawk_API.setAttributes({
    'name'  : 'Name',
    'email' : 'email@email.com',
    'hash'  : 'hash value',
    // ....custom any key value
  }, (error) => {});
  window.Tawk_API.addTags(['hello', 'world'], (error) => {});
  window.Tawk_API.removeTags(['hello', 'world'], (error) => {});
  window.Tawk_API.addEvent('product-add-to-cart', {sku: 'A0012', name: 'Jeans', price:'50'}, (error) => {});
  <script type="text/javascript">
  var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
  (function(){
  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
  s1.async=true;
  s1.src='https://embed.tawk.to/68fddb21511129194ce1556a/1j8fpvves';
  s1.charset='UTF-8';
  s1.setAttribute('crossorigin','*');
  s0.parentNode.insertBefore(s1,s0);
  })();
  </script>
  */
  
  
  // useEffect(() => {
  //   if (window?.Tawk_API && window?.Tawk_API?._initialized) return;
  //   window.Tawk_API = window.Tawk_API || {};
  //   window.Tawk_API._initialized = true; // flag
  //   // --- Custom API Setup ---
  //   window.Tawk_API.autoStart = false;
  //   window.Tawk_API.onStatusChange = function (status) {
  //     if (status === "online") {
  //       window.Tawk_API.start({ showWidget: true });
  //     }
  //   };
  //   window.Tawk_API.onChatMinimized = () => {
  //     window.Tawk_API.shutdown();
  //   };
  //   window.Tawk_API.visitor = {
  //     name: "Remal Mahmud",
  //     email: "hello@mahmudremal.com",
  //   };
  //   // const s1 = document.createElement("script");
  //   // s1.async = true;s1.charset = "UTF-8";
  //   // s1.setAttribute("crossorigin", "*");
  //   // s1.src = "https://embed.tawk.to/68fddb21511129194ce1556a/1j8fpvves";
  //   // const s0 = document.getElementsByTagName("script")[0];
  //   // s0.parentNode.insertBefore(s1, s0);
  // }, []);


/*

add_action('wp_footer', function () {
    ?>
    <script type="text/javascript">
        var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
        window.Tawk_API.visitor = {name: "Remal Mahmud", email: "hello@mahmudremal.com", phone: 8801814118328, jobTitle: 'Customer'};
        (function(){
            var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = 'https://embed.tawk.to/68fddb21511129194ce1556a/1j8fpvves';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            s0.parentNode.insertBefore(s1, s0);
        })();
    </script>
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "rcky141nlk");
    </script>
    <?php
});
add_action('wp_head', function () {
    ?>
    <!-- Google Tag Manager -->
    <script>
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-KHXP5Z56');
    </script>
    <!-- End Google Tag Manager -->
    <?php
});
add_action('wp_body_open', function () {
    ?>
    <!-- Google Tag Manager (noscript) -->
    <noscript>
        <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KHXP5Z56"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
    </noscript>
    <!-- End Google Tag Manager (noscript) -->
    <?php
});

*/
  
  
  return null;
}
