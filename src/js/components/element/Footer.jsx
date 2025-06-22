import React, { useState } from "react";
import { useTranslation } from "@context/LanguageProvider";
import { sprintf } from "sprintf-js";

const Footer = () => {
    const { __ } = useTranslation();
    const [opening, setOpening] = useState(null);
    
    const openDeveloper = () => {
        setOpening(true);
        setTimeout(() => {
            setOpening(false);
            window.open('https://www.mahmudremal.com/');
        }, 1500);
    }

    const date = new Date();
    
    return (
        <footer className="d-footer">
            <div className="row xpo_items-center xpo_justify-between">
                <div className="col-auto">
                    <p className="mb-0">{sprintf(__('© %d %s All Rights Reserved.'), date.getFullYear(), 'UXnDev LLC.')}</p>
                </div>
                <div className="col-auto">
                    <p className="mb-0">{__('Made by')} <span className="text-primary-600 cursor-pointer" onClick={openDeveloper}>{opening ? __('Opening...') : 'Remal M.'}</span></p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

