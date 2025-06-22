import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import request from "@common/request";
import { notify, rest_url, home_url, change_url_state } from "@functions";
import { usePopup } from "@context/PopupProvider";
import { useTranslation } from "@context/LanguageProvider";
import { useLoading } from "@context/LoadingProvider";
import { useCurrency } from "@context/CurrencyProvider";
import { Loader, X } from "lucide-react";
import { sprintf } from "sprintf-js";


export default function InvoiceEdit() {
  const { print_money, currency, currencyList } = useCurrency();
  const { __ } = useTranslation();
  const { setPopup } = usePopup();
  const { setLoading } = useLoading();
  const { invoice_id: paramInvoiceID } = useParams();
  const [packagesList, setPackagesList] = useState([]);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    invoice_id : paramInvoiceID,
    client_email: "",
    client_phone: "",
    currency: currency,
    items: [{ type: 'custom', label: '', price: 0.00, identifier: [null, null] }],
    total: 0,
    metadata: {
      first_name: '',
      middle_name: '',
      last_name: '',
      city: '',
      address: '',
      emirate: '',
      phone: '',
      phone_code: '',
    }
  });

  const fetchInvoice = async () => {
    request(rest_url(`/sitecore/v1/contracts/packages`)).then(list => setPackagesList(list.filter(l => Object.keys(l.pricing??[])?.length))).catch(e => console.error(e));
    if (!form.invoice_id || form.invoice_id <= 0) return;
    setLoading(true);
    request(rest_url(`/sitecore/v1/invoice/${form.invoice_id}`)).then(data => 
      setForm(prev => ({
        ...prev, ...data,
        items: data.items.map(i => ({...i, identifier: i.identifier?.split('->')??[null, null] })),
      }))
    )
    .catch(e => console.error(e))
    .finally(() => setLoading(false));
  };

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    const total = items.reduce((sum, item) => sum + get_item_price(item), 0);
    setForm(prev => ({ ...prev, items, total }));
  };
  const handleIdentifierChange = (index, field, value) => {
    const items = [...form.items];
    items[index]['identifier'][field] = field === 0 ? parseInt(value) : value;
    handleItemChange(index, 'identifier', items[index]['identifier']);
    const total = items.reduce((sum, item) => sum + get_item_price(item), 0);
    setForm(prev => ({ ...prev, items, total }));
  };

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { type: 'custom', label: '', price: 0.00, identifier: [null, null] }] }));
  };
  
  const submitInvoice = async () => {
    setLoading(true);
    request(rest_url("/sitecore/v1/invoice/create"), {
      method: "POST",
      headers: {'Cache-Control': 'no-cache', 'Content-Type': 'application/json'},
      body: JSON.stringify({
        ...form,
        items: form.items.map(i => ({...i, identifier: i.identifier.join('->')})),
        total: form.items.reduce((sum, item) => sum + get_item_price(item), 0)
      })
    })
    .then(res => {
      setForm(res);setStep(4);
      notify.success(__('Invoice updated successfully!'));
      change_url_state(home_url(`invoices/${res.invoice_id}/view`), __('Invoice') + ' #' + res.invoice_id);
    })
    .catch(e => setPopup(<div>Failed to submit invoice</div>))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoice();
  }, [form.invoice_id]);

  const get_item_price = (item) => {
    const [_package, _plan] = item.identifier;
    const _package_obj = packagesList.find(p => p.id == _package);
    const amount = (item.type === 'custom' ? item.price : _package_obj?.pricing[_plan]??0);
    return parseFloat(amount);
  }
  
  const get_item_label = (item) => {
    const [_package, _plan] = item.identifier;
    const _package_obj = packagesList.find(p => p.id == _package);
    const label = item.type === 'custom' ? item.label : _package_obj?.name + ' - ' + _package_obj?.packagefor;
    return label;
  }

  return (
    <div className="card">
      <div className="card-body">
        <h6 className="mb-4 xpo_text-xl">{__('Edit Invoice')} #{form.invoice_id}</h6>
        <p className="text-neutral-500">{__('Please complete each step to create or edit your invoice.')}</p>

        <div className="form-wizard">
          <div className="form-wizard-header overflow-x-auto scroll-sm xpo_pb-8 my-32">
            <ul className="list-unstyled form-wizard-list style-three">
              {[1, 2, 3, 4].map((s) => (
                <li
                  key={s}
                  className={`form-wizard-list__item xpo_flex xpo_items-center xpo_gap-8 ${step === s ? 'active' : ''}`}
                >
                  <div className="form-wizard-list__line">
                    <span className="count">{s}</span>
                  </div>
                  <span className="text xpo_text-xs fw-semibold">
                    {s === 1 ? __('Invoice Details') : s === 2 ? __('Invoice Items') : s === 3 ? __('Review invoice') : __('Share')}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {step === 1 && (
            <fieldset className="wizard-fieldset show">
              <h6 className="text-md xpo_text-neutral-500">{__('Personal Information')}</h6>
              <div className="row gy-3">
                <div className="col-sm-6">
                  <label className="form-label">{__('First Name')}</label>
                  <input type="text" className="form-control" value={form.metadata?.first_name} onChange={(e) => setForm(prev => ({ ...prev, metadata: {...prev.metadata, first_name: e.target.value} }))} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">{__('Middle Name')}</label>
                  <input type="text" className="form-control" value={form.metadata?.middle_name} onChange={(e) => setForm(prev => ({ ...prev, metadata: {...prev.metadata, middle_name: e.target.value} }))} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">{__('Last Name')}</label>
                  <input type="text" className="form-control" value={form.metadata?.last_name} onChange={(e) => setForm(prev => ({ ...prev, metadata: {...prev.metadata, last_name: e.target.value} }))} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">{__('Email')}</label>
                  <input type="email" className="form-control" value={form.client_email} onChange={(e) => setForm(prev => ({ ...prev, client_email: e.target.value }))} />
                </div>
                <div className="col-sm-6">
                  {/* <label className="form-label">{__('Phone')}</label> */}
                  <PhoneInput
                    country={'us'}
                    value={form.metadata?.phone}
                    onChange={(phone, countryData) => {
                      setForm(prev => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          phone: phone.replace(/\D/g, ''),
                          countryCode: countryData.iso2
                        }
                      }));
                    }}
                    // onChange={(phone) => setForm(prev => ({ ...prev, metadata: {...prev.metadata, phone: e.target.value} }))}
                    inputClass="form-control xpo_w-100"
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">{__('Currency')}</label>
                  <select className="form-control" value={form.currency}
                    onChange={(e) => setForm(prev => ({ ...prev, currency: e.target.value }))}
                  >
                    {currencyList.sort((a, b) => a.code.localeCompare(b.code)).map((opt, index) => <option key={index} value={opt.code}>{opt.code} - {opt.sign}</option>)}
                  </select>
                </div>
                <div className="form-group xpo_text-end">
                  <button type="button" className="form-wizard-next-btn btn btn-primary-600 px-32" onClick={() => setStep(2)}>{__('Next')}</button>
                </div>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="wizard-fieldset show">
              <h6 className="text-md xpo_text-neutral-500">{__('Invoice Items')}</h6>
              <div className="row gy-3">
                {/* {form.items.map((item, index) => (
                  <React.Fragment key={index}>
                    <div className="col-sm-6">
                      <label className="form-label">{__('Item Label')}</label>
                      <input type="text" className="form-control" value={item.label} onChange={(e) => handleItemChange(index, 'label', e.target.value)} />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label">{__('Item Price')}</label>
                      <input type="number" className="form-control" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} />
                    </div>
                  </React.Fragment>
                ))} */}

                {form.items.map((item, index) => (
                  <React.Fragment key={index}>

                    <div className="col-sm-4">
                      <label className="form-label">{__('Item Type')}</label>
                      <select
                        value={item.type}
                        className="form-control"
                        onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                      >
                        <option value="custom">{__('Custom')}</option>
                        <option value="package">{__('Package')}</option>
                      </select>
                    </div>

                    {item.type === 'custom' ? (
                      <>
                        <div className="col-sm-4">
                          <label className="form-label">{__('Item Label')}</label>
                          <input
                            type="text"
                            className="form-control"
                            value={item.label}
                            onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                          />
                        </div>

                        <div className="col-sm-4">
                          <label className="form-label">{__('Item Price')}</label>
                          <input
                            type="number"
                            value={item.price}
                            className="form-control"
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-sm-4">
                          <label className="form-label">{__('Identifier')}</label>
                          <select
                            className="form-control"
                            value={item.identifier[0]??null}
                            onChange={(e) => handleIdentifierChange(index, 0, e.target.value)}
                          >
                            <option value="">Select Identifier</option>
                            {packagesList.map((opt, index) => (
                              <option key={index} value={opt.id}>
                                {opt?.name??''} - {opt?.packagefor??''}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-sm-4">
                          <label className="form-label">{__('Plan')}</label>
                          <select
                            className="form-control"
                            value={item?.identifier[1]??null}
                            onChange={(e) => handleIdentifierChange(index, 1, e.target.value)}
                          >
                            <option value="">Select Plan</option>
                            {Object.entries(packagesList.find(p => p.id == form.items.find(i => i.id == item.id).identifier[0])?.pricing || {}).map(([key, value]) => ({ value: key, label: `${key} - ${value}` })).map((opt, optIndex) => (
                              <option key={optIndex} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                  </React.Fragment>
                ))}

                
                <div className="col-12 xpo_text-end">
                  <button type="button" className="btn btn-outline" onClick={addItem}>{__('Add Item')}</button>
                </div>
                <div className="col-12 xpo_flex xpo_justify-content-between xpo_items-center">
                  <strong>{__('Total')}:</strong>
                  <span className="text-xl fw-bold">{print_money(form.total, form.currency)}</span>
                </div>
                <div className="form-group xpo_flex xpo_items-center xpo_justify-content-end xpo_gap-8">
                  <button type="button" className="form-wizard-previous-btn btn btn-neutral-500 border-neutral-100 px-32" onClick={() => setStep(1)}>{__('Back')}</button>
                  <button type="button" className="form-wizard-next-btn btn btn-primary-600 px-32" onClick={() => setStep(3)}>{__('Next')}</button>
                </div>
              </div>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="wizard-fieldset show">
              <h6 className="text-md xpo_text-neutral-500">{__('Review Invoice')}</h6>
              <div className="row gy-3">
                <div className="col-sm-6">
                  <strong>{__('Client Name')}:</strong>
                  <div>{[form.metadata?.first_name, form.metadata?.middle_name, form.metadata?.last_name].filter(Boolean).join(" ")}</div>
                </div>
                <div className="col-sm-6">
                  <strong>{__('Email')}:</strong>
                  <div>{form.client_email}</div>
                </div>
                <div className="col-sm-6">
                  <strong>{__('Phone')}:</strong>
                  <div>{form.metadata?.phone}</div>
                </div>
                <div className="col-sm-6">
                  <strong>{__('Currency')}:</strong>
                  <div>{form.currency}</div>
                </div>
                <div className="col-12">
                  <strong>{__('Items')}:</strong>
                  <ul className="list-group">
                    {form.items.filter(item => item).map((item, i) => (
                      <li key={i} className="list-group-item xpo_flex xpo_justify-content-between">
                        <span>{get_item_label(item)}</span>
                        <span>{get_item_price(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-12 xpo_flex xpo_justify-content-between border-top xpo_pt-3 xpo_mt-3">
                  <strong>{__('Total')}</strong>
                  <span>{print_money(form.total, form.currency)}</span>
                </div>
              </div>
              <div className="form-group xpo_flex xpo_items-center xpo_justify-content-end xpo_gap-8 xpo_mt-4">
                <button type="button" className="form-wizard-previous-btn btn btn-neutral-500 border-neutral-100 px-32" onClick={() => setStep(2)}>{__('Back')}</button>
                <button type="button" className="form-wizard-next-btn btn btn-primary-600 px-32" onClick={submitInvoice}>{__('Confirm Invoice')}</button>
              </div>
            </fieldset>
          )}

          {step === 4 && (
            <fieldset className="wizard-fieldset show">
              <div className="xpo_flex xpo_flex-col xpo_gap-8">
                <div>
                  <h3 className="text-lg fw-semibold">{__('Invoice Submitted Successfully')}</h3>
                  <p>{__('You can now share your invoice using the links below:')}</p>
                </div>
                <div>
                  <ShareInperson form={form} link={`${window.location.origin}/invoice/${form.invoice_id}/pay`} __={__} />
                </div>
              </div>
            </fieldset>
          )}
        </div>
      </div>
    </div>
  );
}


const ShareInperson = ({ form, link, __ }) => {
  const [emails, setEmails] = useState([]);
  const [message, setMessage] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(null);

  const addEmail = () => {
    const trimmed = inputValue.trim();
    if (trimmed && validateEmail(trimmed) && !emails.includes(trimmed)) {
      setEmails([...emails, trimmed]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {emails, subject: __('You have been invited!'), body: sprintf('Please find your invoice %s attached', (message || link))};
    request(rest_url(`sitecore/v1/invoice/${form.invoice_id}/share`), {
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
      method: 'POST',
    })
    .then(res => {
      if (res.success) {
        notify.success(res?.message??__('Link shared successfully!'));
        setEmails([]);setMessage('');
      } else {
        notify.error(res?.message??__('Failed to share link.'));
      }
    })
    // .catch(err => console.error(err))
    .catch(err => notify.error(err?.message??__('Error sending the request.')))
    .finally(() => setLoading(false));
  };

  const handleShareTo = (platform) => {
    let shareUrl;
    const encodedLink = encodeURIComponent(link);
    switch (platform) {
      case 'messenger':
        shareUrl = `https://www.facebook.com/dialog/send?link=${encodedLink}&app_id=123456789&redirect_uri=${encodedLink}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedLink}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedLink}`;
        break;
      case 'wechat':
        notify.success('Please use the WeChat app to share this link.');
        return;
      default:
        return;
    }
    if (shareUrl) {
      const win = window.open(shareUrl, '_blank', 'width=600,height=400');
      if (win) win.focus();
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="xpo_p-4 xpo_border xpo_rounded xpo_shadow-sm xpo_bg-white xpo_space-y-4">
      <div className="xpo_flex xpo_gap-2">
        <button
          onClick={() => handleShareTo('messenger')}
          className="btn rounded-pill btn-primary-100 xpo_text-primary-600 radius-8 px-20 py-11"
        >{__('Messenger')}</button>
        <button
          onClick={() => handleShareTo('whatsapp')}
          className="btn rounded-pill btn-success-100 xpo_text-success-600 radius-8 px-20 py-11"
        >{__('WhatsApp')}</button>
        <button
          onClick={() => handleShareTo('twitter')}
          className="btn rounded-pill btn-neutral-100 xpo_text-primary-light radius-8 px-20 py-11"
        >{__('Twitter')}</button>
        <a
          href={`mailto:?subject=You've got a link!&body=${encodeURIComponent(link)}`}
          className="btn rounded-pill btn-light-50 xpo_text-dark radius-8 px-20 py-11"
        >{__('Share Email')}</a>
        {navigator.share && (
          <button
            onClick={() => navigator.share({ title: __('Invoice'), text: __('Check out this invoice!'), url: link })}
            className="btn rounded-pill btn-info-100 xpo_text-info-600 radius-8 px-20 py-11"
          >{__('Share')}</button>
        )}
        <button
          onClick={() => 
            navigator.clipboard.writeText(link)
            .then(() => notify.success(__('Link copied to clipboard!')))
            .catch(err => notify.error(err?.message??__('Failed to copy link.')))
          }
          className="btn rounded-pill btn-link xpo_text-secondary-light xpo_text-decoration-none radius-8 px-20 py-11 hover:xpo_text-white"
        >{__('Copy')}</button>
      </div>

      <form onSubmit={handleShareSubmit} className="xpo_space-y-4">
        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700">{__('Invite via Email')}</label>

        <div className="xpo_flex xpo_flex-wrap xpo_gap-2 xpo_p-2 xpo_border xpo_rounded xpo_bg-gray-50">
          {emails.map(email => (
            <div key={email} className="xpo_flex xpo_items-center xpo_bg-gray-200 xpo_px-2 xpo_py-1 xpo_rounded xpo_text-sm">
              {email}
              <button
                type="button"
                onClick={() => setEmails(prev => prev.filter(e => e !== email))}
                className="xpo_ml-1 xpo_text-red-600 hover:xpo_text-red-800"
              ><X /></button>
            </div>
          ))}
          <input
            type="text"
            onBlur={addEmail}
            value={inputValue}
            onKeyDown={handleKeyDown}
            placeholder={__('Enter email...')}
            onChange={(e) => setInputValue(e.target.value)}
            className="xpo_flex-grow xpo_border-none focus:xpo_ring-0 xpo_outline-none xpo_text-sm xpo_bg-transparent"
          />
        </div>

        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={__('Enter your message here (Optional)...')}
          className="xpo_w-full xpo_border xpo_rounded xpo_p-2 xpo_text-sm"
        />

        <button
          type="submit"
          disabled={loading}
          className={`xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_bg-primary-600 xpo_text-white xpo_px-6 xpo_py-2 xpo_rounded hover:xpo_bg-primary-700 ${loading ? 'xpo_cursor-not-allowed' : ''}`}
        >
          {loading && <Loader className="xpo_animate-spin" />}
          <span>{loading ? __('Sending...') : __('Send')}</span>
        </button>
      </form>
    </div>
  );
};
