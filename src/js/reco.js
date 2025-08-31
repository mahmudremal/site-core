(function(){
  const uid = (document.cookie.match(/reco_uid=([^;]+)/)||[])[1];
  const sid = sessionStorage.getItem('reco_sid') || (window.crypto?.randomUUID ? window.crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); }));
  sessionStorage.setItem('reco_sid', sid);

  function send(event){ 
      const payload = { ...event, session_id: sid };
      navigator.sendBeacon(RECO_CFG.endpoint, new Blob([JSON.stringify(payload)], {type:'application/json'})); 
  }

  const meta = {url:location.href, ref:document.referrer, utm:Object.fromEntries(new URLSearchParams(location.search))};
  send({event_type:'view_page', meta});

  document.querySelectorAll('[data-reco-item]').forEach(el=>{
    send({event_type:'view_item', item_id:parseInt(el.dataset.recoItem), meta});
  });
  document.querySelectorAll('[data-reco-category]').forEach(el=>{
    send({event_type:'view_category', category_id:parseInt(el.dataset.recoCategory), meta});
  });

  document.addEventListener('click', e=>{
    const btn=e.target.closest('[data-reco-add]');
    if(!btn) return;
    send({event_type:'add_to_cart', item_id:parseInt(btn.dataset.recoAdd)});
  }, true);
})();
