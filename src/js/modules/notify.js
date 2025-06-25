// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/scss/main.scss';

import React from 'react';

import { Notyf } from 'notyf';
// import 'notyf/notyf.min.css';

const playSound = () => {
    const audio = new Audio('/path/to/your/sound.mp3');
    audio.play();
};

const notify = new Notyf({
    duration: 2000,
    position: { x: 'right', y: 'top' },
    types: [
        { type: 'warning', background: 'orange', icon: { className: 'material-icons', tagName: 'i', text: 'warning' } },
        { type: 'error', background: 'indianred', duration: 2000, dismissible: true }
    ]
});

// const notify = toast;
// (args ={}) => {
//     toast('This is a notification with sound!', {
//         onOpen: args?.onOpen??playSound
//     });
// }
const ToastContainer = () => {
    return <></>;
}

export {
    ToastContainer,
    playSound,
    notify,
    // toast,
}