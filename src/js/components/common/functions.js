import toast from 'react-hot-toast';
// import { Notyf } from 'notyf';
// import 'notyf/notyf.min.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const location_host = `https://${location.host}/vivianeokorie`; // 'https://core.agency.local';

export const nl2br = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/\n/g, '<br>');
}

export const site_url = (url) => {
    if (url.startsWith('/')) {
        url = url.substring(1);
    }
    // return `${location_host}/${url}`;
    return chrome.runtime.getURL(url);
}
export const home_route = (url) => {
    if (url.startsWith('/')) {
        url = url.substring(1);
    }
    // return `/${url}`;
    return `/${url}`;
}
export const home_url = (url) => {
    if (url.startsWith('/')) {
        url = url.substring(1);
    }
    // return site_url(`/${url}`);
    return site_url(`/${url}`);
}
export const rest_url = (url) => {
    if (url.startsWith('/')) {
        url = url.substring(1);
    }
    // return site_url(`wp-json/${url}`);
    return `${location_host}/wp-json/${url}`;
}

export const app_url = (url) => {
    if (url.startsWith('/')) {
        url = url.substring(1);
    }
    return `${siteCoreConfig?.appURI}/${url}`
}

export const get_page = () => {
    return `${
        location.hash == '' ? '#/home' : location.hash
    }`.substring(1);
}

export const request_headers = () => {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${siteCoreConfig.ajax_nonce}`
        }
    }
}

export const timeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const strtotime = (date) => {
    const dobj = typeof parseInt(date) === 'number' && ! date.toString().includes(':') ? parseInt(date) : Math.floor(new Date(date).getTime() / 1000);
    return dayjs.unix(dobj).utc();
}

export const change_url_state = (newUrl, newTitle = document.title) => {
    if (typeof window.history.pushState === 'function') {
      window.history.pushState({ path: newUrl }, newTitle, newUrl);
      document.title = newTitle;
    } else {
      console.log('Browser does not support pushState.');
    }
}

export const get_user_role = (user) => {
    // if (!user?.roles) {return '';}
    const roles = user?.roles??[];
    switch (true) {
        case roles.includes('administrator'):
            return 'Admin';
            break;
        case roles.includes('author'):
            return 'Influencer';
            break;
        case roles.includes('editor'):
            return 'Agency';
            break;
        case roles.includes('contributor'):
            return 'Freelancer';
            break;
        default:
            return 'Client'; // 'subscriber'
            break;
    }
}

class ToastNotification {
    constructor() {
        this.custom = toast.custom;
        this.loading = toast.loading;
        this.promise = toast.promise;
        this.dismiss = toast.dismiss;
    }
    success(msg, opt = {}) {
        return toast.success(msg, opt)
    }
    error(msg, opt = {}) {
        return toast.error(msg, opt)
    }
}

export const notify = new ToastNotification();


class RoleManager {
    constructor() {
        this.roles = [];
        this.caps = [];
    }
    
    setRoles(roles) {
        this.roles = roles;
    }
    getRole(role) {
        return this.roles.find(r => r.id === role);
    }

    set_abilitites(caps) {
        if (!caps) {return;}
        // console.log(caps)
        this.caps = Object.keys(caps).filter(k => caps[k]);
    }

    has_ability(ability = null) {
        if (!ability) return false;
        if (typeof ability === 'string') {ability = [ability];}
        return this.caps.some(cap => cap && ['all_access', ...ability].includes(cap));
    }
}
export const roles = new RoleManager();


// https://react-hot-toast.com/docs/toast
// toast.promise(myPromise, {
//     loading: 'Loading',
//     success: 'Got the data',
//     error: 'Error when fetching',
// });

