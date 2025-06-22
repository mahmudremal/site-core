import React, { useState, useEffect } from 'react';
import { useTranslation } from '@context/LanguageProvider';
import faqImg from '@img/faq-img.png';
import { TicketPlus, User } from 'lucide-react';
import { home_route, rest_url, notify } from '@functions';
import request from '@common/request';
import { useNavigate } from 'react-router-dom';


export default function OpenTicket() {
    const { __ } = useTranslation();
    let navigate = useNavigate();

    const handle_form_submit = (e) => {
        e.preventDefault();const form = e.target;
        const formData = new FormData(form);
        request(rest_url(`sitecore/v1/supports/ticket`), {method: 'POST', body: formData})
        .then(res => {
            notify.success(res.message);
            form.reset();
            request.cache.remove('sitecore/v1/supports/ticket');
            setTimeout(() => {
                navigate(home_route('/support/supports'));
            }, 2000);
        })
        .catch(e => notify.error(e?.response?.message??e?.message??__('Error fetching partner docs.')));
        // Handle the form submission logic here
    };
    
    return (
        <div className="card basic-data-table">
            <div className="card-header xpo_p-0 border-0">
                <div className="responsive-padding-40-150 bg-secondary-100">
                    <div className="row gy-4 xpo_items-center">
                        <div className="col-xl-7">
                            <h4 className="mb-20">{__('Open New Ticket')}</h4>        
                            <p className="mb-0 xpo_text-secondary-light xpo_max-w-634-px xpo_text-xl">{__('We\'re always being waiting for your message. Please feel free to contact us.')}</p>
                        </div>
                        <div className="col-xl-5 d-xl-block d-none relative">
                            <img src={faqImg} alt={__('Remote Meeting')} />
                            <div className="absolute top-0 left-0 xpo_w-full xpo_h-full"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body bg-base responsive-padding-40-150">
                <form className="row gy-3 xpo_p-0 xpo_m-auto" action="#" method="post" encType="multipart/form-data" onSubmit={(e) => handle_form_submit(e)}>
                    <div className="row gy-3">
                        <div className="row gy-3 xpo_p-0 xpo_m-auto hidden">
                            <div className="col">
                                <label className="form-label">{__('First Name')}</label>
                                <div className="icon-field">
                                    <span className="icon">
                                        <User className="text-xl" />
                                    </span>
                                    <input type="text" name="first_name" className="form-control" placeholder={__('Enter First Name')} />
                                </div>
                            </div>
                            <div className="col">
                                <label className="form-label">{__('Last Name')}</label>
                                    <div className="icon-field">
                                    <span className="icon">
                                        <User className="text-xl" />
                                    </span>
                                    <input type="text" name="last_name" className="form-control" placeholder={__('Enter Last Name')} />
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="form-label">{__('About')}</label>
                            <div className="icon-field">
                                <span className="icon">
                                    <TicketPlus className="text-xl" />
                                </span>
                                {/* <input type="text" className="form-control" placeholder={__('Write About')} /> */}
                                <select className="form-control" name="about" required>
                                    <option value="">{__('Select About')}</option>
                                    <option value="Service related">{__('Service related')}</option>
                                    <option value="Account despute">{__('Account despute')}</option>
                                    <option value="Project support">{__('Project support')}</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-12">
                            {/* was-validated */}
                            <div className="">
                                <label className="form-label">{__('Description')}</label>
                                <textarea className="form-control" name="description" rows="4" cols="50" placeholder={__('Write here...')} required></textarea>
                                <div className="invalid-feedback">{__('Please enter a message in the description field.')}</div>
                            </div>
                        </div>
                        

                        <div className="col-12">
                            <label className="form-label">{__('Attachment(s)')}</label>
                            <input className="form-control" type="file" name="attachments[]" multiple style={{lineHeight: 1.3}} />
                        </div>
                        

                        <div className="col-12">
                            <button type="submit" className="btn btn-primary-600">{__('Submit')}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}