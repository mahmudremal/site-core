import { MessageCircleQuestion, CheckCircle, FileText, PenTool, CreditCard, ArrowRight, ArrowLeft, Phone, Mail, Building, User, Tag, DollarSign, Signature, FileDown, Loader2 } from 'lucide-react';
import { rest_url, sleep, home_url, strtotime } from "@functions";
import { useState, useEffect, useRef } from 'react';
import { Popup, __ } from '@js/utils';
import axios from 'axios';
import { sprintf } from 'sprintf-js';
import SignatureCanvas from 'react-signature-canvas'
import generate_pdf_agreement, { conditional_pricing } from './generate';

const ServicePackage = ({ buttons = [] }) => {
    const [popup, setPopup] = useState(null);

    const ServicePopup = ({ tax_id }) => {
        const [step, setStep] = useState(0);
        const [loading, setLoading] = useState(true);
        const [services, setServices] = useState([]);
        const [pdfURL, setPdfURL] = useState(null);
        const [saving, setSaving] = useState(null);
        const [formData, setFormData] = useState({
            tax_id: tax_id,
            fullName: '',
            email: '',
            phone: '',
            businessName: '',
            businessIndustry: '',
            signature: null
        });
        const [config, setConfig] = useState({
            pre: '',
            post: '',
            logo: '',
            phone: '',
            email: '',
            address: '',
            website: '',
            background: '',
            agencySignature: '',
            agencyRepresentative: '',
        });
        const sigCanvas = useRef(null);

        const steps = [
            { title: __('Select Services', 'site-core'), icon: CheckCircle },
            { title: __('Your Information', 'site-core'), icon: User },
            { title: __('Agreement Terms', 'site-core'), icon: FileText },
            { title: __('Digital Signature', 'site-core'), icon: PenTool },
            { title: __('Payment Details', 'site-core'), icon: CreditCard }
        ];
        
        useEffect(() => {
            setLoading(true);
            axios.get(rest_url(`sitecore/v1/services/list`), {params: {tax_id}})
            .then(res => res.data)
            .then(res => {
                if (res?.list) setServices(res.list);
                if (res?.config) setConfig(prev => ({...prev, ...res.config}));
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
        }, []);

        const submit_agreement = (e) => {
            e.preventDefault();
            setSaving(true);
            return new Promise(async (resolve, reject) => {
                if (!sigCanvas.current) {
                    return reject(new Error(__('Signature canvas is not initialized', 'site-core')));
                }
                if (!sigCanvas.current.isEmpty()) {
                    const signature = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
                    const pdf = await generate_pdf_agreement(
                        selectedServices.map(s => s.pricing?.primary_agreement??'').join('\n\n'),
                        {...formData, signature: signature}, config
                    ).catch(err => reject(new Error(__('Failed to generate agreement PDF', 'site-core'))));
                    if (pdfURL) {
                        URL.revokeObjectURL(pdfURL.url);
                    }
                    setPdfURL(pdf);
                    await sleep(2000);
                    const formdata = new FormData();
                    formdata.append('tax_id', tax_id);
                    formdata.append('_referrar', location.href);
                    formdata.append('record', JSON.stringify(formData));
                    formdata.append('signature', pdf.blob, `agreement-${Date.now()}-${formData.businessName}.pdf`);
                    formdata.append('services', services.filter(i => i.checked).map(i => i.id).join(','));
                    axios.post(rest_url(`sitecore/v1/services/agreement`), formdata)
                    .then(res => res.data)
                    .then(res => {
                        if (res.success) {
                            resolve(__('Agreement submitted successfully', 'site-core'));
                        } else {
                            reject(new Error(__('Failed to submit agreement', 'site-core')));
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        reject(new Error(err.response?.data?.message??__('An error occurred while submitting the agreement', 'site-core')));
                    });
                } else {
                    reject(new Error(__('Please draw your signature before submitting', 'site-core')));
                }
            });
        }

        const clearSignature = () => {
            if (sigCanvas.current) {
                sigCanvas.current.clear();
            }
        };

        const updateFormData = (field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        };

        const selectedServices = services.filter(i => i.checked);
        // const totalPrice = selectedServices.reduce((total, s) => total + parseFloat(s.pricing?.primary ?? 0), 0);
        const totalPrice = conditional_pricing(selectedServices, config, formData);

        const infoForm = useRef(null);
        
        const AgreementBody = ({ children }) => {
            return (
                <div>
                    {config.pre && <p className="xpo_text-gray-700 xpo_mb-4">{config.pre}</p>}
                    {children}
                    {config.post && <p className="xpo_text-gray-700">{config.post}</p>}
                </div>
            );
        }
        
        return (
            <div className="xpo_w-full xpo_max-w-4xl xpo_mx-auto xpo_rounded-2xl xpo_overflow-hidden">
                {/* Header with Progress Steps */}
                <div className="xpo_bg-gradient-to-r xpo_from-markethia-500 xpo_to-markethia-600 xpo_px-8 xpo_py-6">
                    <span className="xpo_text-2xl xpo_font-bold xpo_text-white xpo_mb-6">Service Agreement Process</span>
                    <div className="xpo_flex xpo_items-center xpo_justify-between">
                        {steps.map((stepInfo, index) => {
                            const Icon = stepInfo.icon;
                            return (
                                <div key={index} className="xpo_flex xpo_items-center xpo_flex-1">
                                    <div className={`xpo_flex xpo_items-center xpo_justify-center xpo_w-10 xpo_h-10 xpo_rounded-full xpo_border-2 xpo_transition-all xpo_duration-300 ${
                                        index <= step 
                                            ? 'xpo_bg-white xpo_border-white xpo_text-markethia-600' 
                                            : 'xpo_border-white/50 xpo_text-white/50'
                                    }`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="xpo_ml-3 xpo_flex-1">
                                        <p className={`xpo_text-sm xpo_font-medium xpo_transition-all xpo_duration-300 ${
                                            index <= step ? 'xpo_text-white' : 'xpo_text-white/50'
                                        }`}>
                                            {stepInfo.title}
                                        </p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`xpo_h-0.5 xpo_flex-1 xpo_mx-4 xpo_transition-all xpo_duration-300 ${
                                            index < step ? 'xpo_bg-white' : 'xpo_bg-white/30'
                                        }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="xpo_p-8">
                    {/* Step 0: Service Selection */}
                    {step === 0 && (
                        <div className="xpo_space-y-6">
                            <div className="xpo_text-center xpo_mb-8">
                                <span className="xpo_text-2xl xpo_font-bold xpo_text-gray-800 xpo_mb-2">Choose Additional Features</span>
                                <p className="xpo_text-gray-600">Select the services that best fit your business needs</p>
                            </div>

                            <div className="xpo_grid xpo_gap-4">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <div key={i} className="xpo_animate-pulse">
                                            <div className="xpo_bg-gray-200 xpo_rounded-lg xpo_p-6 xpo_h-24"></div>
                                        </div>
                                    ))
                                ) : (
                                    services.map((service, i) => (
                                        <div key={i} className={`xpo_border-2 xpo_rounded-lg xpo_p-6 xpo_transition-all xpo_duration-200 xpo_cursor-pointer hover:xpo_shadow-lg ${
                                            service?.checked 
                                                ? 'xpo_border-markethia-500 xpo_bg-markethia-50' 
                                                : 'xpo_border-gray-200 hover:xpo_border-gray-300'
                                        }`}>
                                            <label htmlFor={`service-${service.id}`} className="xpo_cursor-pointer xpo_flex xpo_items-start xpo_gap-4">
                                                <input
                                                    type="checkbox" 
                                                    id={`service-${service.id}`} 
                                                    checked={service?.checked || false}
                                                    onChange={(e) => setServices(prev => prev.map(s => ({
                                                        ...s, 
                                                        checked: s.id === service.id ? e.target.checked : s.checked 
                                                    })))}
                                                    className="xpo_mt-1 xpo_w-5 xpo_h-5 xpo_text-markethia-600 xpo_border-gray-300 xpo_rounded focus:xpo_ring-markethia-500"
                                                />
                                                <div className="xpo_flex-1">
                                                    <div className="xpo_flex xpo_items-center xpo_justify-between">
                                                        <h4 className="xpo_font-semibold xpo_text-gray-800">{service.title}</h4>
                                                        <div className="xpo_flex xpo_items-center xpo_gap-2">
                                                            {service.pricing?.primary && (
                                                                <span className="xpo_bg-markethia-100 xpo_text-markethia-800 xpo_px-3 xpo_py-1 xpo_rounded-full xpo_text-sm xpo_font-medium">
                                                                    ${service.pricing.primary}
                                                                </span>
                                                            )}
                                                            <a 
                                                                target="_blank" 
                                                                href={service.permalink} 
                                                                rel="noopener noreferrer"
                                                                className="xpo_text-markethia-500 hover:xpo_text-markethia-600 xpo_transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MessageCircleQuestion size={20} title={service.excerpt} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    {service.excerpt && (
                                                        <p className="xpo_text-gray-600 xpo_text-sm xpo_mt-2">{service.excerpt}</p>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>

                            {selectedServices.length > 0 && (
                                <div className="xpo_bg-gradient-to-r xpo_from-markethia-50 xpo_to-markethia-50 xpo_border xpo_border-markethia-200 xpo_rounded-lg xpo_p-6">
                                    <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_mb-3">
                                        <DollarSign className="xpo_text-markethia-600" size={24} />
                                        <h4 className="xpo_font-semibold xpo_text-gray-800">Estimated Investment</h4>
                                    </div>
                                    <p className="xpo_text-gray-700">
                                        {sprintf(__('Your estimated expense is around $%s. This may vary based on additional requirements, scope changes, or project complexity.', 'site-core'), totalPrice.toFixed(2))}
                                    </p>
                                    <div className="xpo_mt-3">
                                        <p className="xpo_text-sm xpo_text-gray-600 xpo_font-medium">Selected Services:</p>
                                        <div className="xpo_flex xpo_flex-wrap xpo_gap-2 xpo_mt-2">
                                            {selectedServices.map((service, i) => (
                                                <span key={i} className="xpo_bg-markethia-100 xpo_text-markethia-800 xpo_px-3 xpo_py-1 xpo_rounded-full xpo_text-sm">
                                                    {service.title}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 1: Information Form */}
                    {step === 1 && (
                        <div className="xpo_space-y-6">
                            <div className="xpo_text-center xpo_mb-8">
                                <span className="xpo_text-2xl xpo_font-bold xpo_text-gray-800 xpo_mb-2">Your Information</span>
                                <p className="xpo_text-gray-600">Please provide your details for the agreement</p>
                            </div>

                            <form ref={infoForm} onSubmit={(e) => e.preventDefault()}>
                                <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-6">
                                    <div className="xpo_space-y-2">
                                        <label className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm xpo_font-medium xpo_text-gray-700">
                                            <User size={16} />
                                            Full Name
                                        </label>
                                        <input
                                            required
                                            type="text" 
                                            value={formData.fullName}
                                            onChange={(e) => updateFormData('fullName', e.target.value)}
                                            className="xpo_w-full xpo_p-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-markethia-500 focus:xpo_border-transparent xpo_transition-all" 
                                            placeholder="Enter your full name" 
                                        />
                                    </div>

                                    <div className="xpo_space-y-2">
                                        <label className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm xpo_font-medium xpo_text-gray-700">
                                            <Mail size={16} />
                                            Email Address
                                        </label>
                                        <input
                                            required
                                            type="email" 
                                            value={formData.email}
                                            onChange={(e) => updateFormData('email', e.target.value)}
                                            className="xpo_w-full xpo_p-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-markethia-500 focus:xpo_border-transparent xpo_transition-all" 
                                            placeholder="Enter your email address" 
                                        />
                                    </div>

                                    <div className="xpo_space-y-2">
                                        <label className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm xpo_font-medium xpo_text-gray-700">
                                            <Phone size={16} />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel" 
                                            value={formData.phone}
                                            onChange={(e) => updateFormData('phone', e.target.value)}
                                            className="xpo_w-full xpo_p-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-markethia-500 focus:xpo_border-transparent xpo_transition-all" 
                                            placeholder="Enter your phone number" 
                                        />
                                    </div>

                                    <div className="xpo_space-y-2">
                                        <label className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm xpo_font-medium xpo_text-gray-700">
                                            <Building size={16} />
                                            Business Name
                                        </label>
                                        <input
                                            type="text" 
                                            value={formData.businessName}
                                            onChange={(e) => updateFormData('businessName', e.target.value)}
                                            className="xpo_w-full xpo_p-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-markethia-500 focus:xpo_border-transparent xpo_transition-all" 
                                            placeholder="Enter your business name" 
                                        />
                                    </div>

                                    <div className="md:xpo_col-span-2 xpo_space-y-2">
                                        <label className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm xpo_font-medium xpo_text-gray-700">
                                            <Tag size={16} />
                                            Business Industry
                                        </label>
                                        <input
                                            required
                                            type="text" 
                                            value={formData.businessIndustry}
                                            onChange={(e) => updateFormData('businessIndustry', e.target.value)}
                                            className="xpo_w-full xpo_p-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-markethia-500 focus:xpo_border-transparent xpo_transition-all" 
                                            placeholder="e.g., Technology, Healthcare, Retail" 
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 2: Agreement Terms */}
                    {step === 2 && (
                        <div className="xpo_space-y-6">
                            <div className="xpo_text-center xpo_mb-8">
                                <span className="xpo_text-2xl xpo_font-bold xpo_text-gray-800 xpo_mb-2">
                                    {selectedServices.length > 0 
                                        ? `Agreement for ${selectedServices.map(s => s.title).join(', ')}`
                                        : 'Service Agreement'
                                    }
                                </span>
                                <p className="xpo_text-gray-600">Please review the terms and conditions</p>
                            </div>

                            <div className="xpo_bg-gray-50 xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_p-6 xpo_max-h-96 xpo_overflow-y-auto">
                                <div className="xpo_prose xpo_prose-sm xpo_max-w-none">
                                    <AgreementBody>
                                        {selectedServices.map((service, i) => 
                                            service.pricing?.primary_agreement ? (
                                                // className="xpo_bg-white xpo_border xpo_border-gray-200 xpo_rounded xpo_p-4 xpo_mb-4"
                                                <div key={i}>
                                                    <h4 className="xpo_font-semibold xpo_text-gray-800 xpo_mb-2">{service.title} - Terms</h4>
                                                    <p className="xpo_text-gray-700" dangerouslySetInnerHTML={{__html: service.pricing.primary_agreement.replaceAll('\n', '<br />')}}></p>
                                                </div>
                                            ) : null
                                        )}
                                    </AgreementBody>
                                </div>
                            </div>

                            <div className="xpo_bg-markethia-50 xpo_border xpo_border-markethia-200 xpo_rounded-lg xpo_p-4">
                                <p className="xpo_text-markethia-800 xpo_text-sm">
                                    <strong>Note:</strong> By proceeding, you acknowledge that you have read and agree to these terms. 
                                    If you have any questions, please feel free to contact us before signing.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Digital Signature */}
                    {step === 3 && (
                        <div className="xpo_space-y-6">
                            <div className="xpo_text-center xpo_mb-8">
                                <span className="xpo_text-2xl xpo_font-bold xpo_text-gray-800 xpo_mb-2">Agreement Preview & Signature</span>
                                <p className="xpo_text-gray-600">Review the final agreement and provide your digital signature</p>
                            </div>

                            <div
                                onClick={() => pdfURL && window.open(pdfURL.url, '_blank')}
                                className={`xpo_bg-gray-100 xpo_border-2 xpo_border-dashed xpo_border-gray-300 xpo_rounded-lg xpo_p-8 xpo_text-center ${pdfURL ? 'xpo_cursor-pointer' : ''}`}
                            >
                                <div>
                                    {pdfURL ? <FileDown size={48} className="xpo_mx-auto xpo_text-gray-400 xpo_mb-4 xpo_animate-bounce" /> : <FileText size={48} className="xpo_mx-auto xpo_text-gray-400 xpo_mb-4" />}
                                    <p className="xpo_text-gray-600 xpo_text-lg xpo_font-medium">{pdfURL ? 'PDF Agreement Download' : 'PDF Agreement Preview'}</p>
                                    <p className="xpo_text-gray-500 xpo_text-sm">{pdfURL ? 'The complete agreement document for this contract.' : 'The complete agreement document will be displayed here'}</p>
                                </div>
                            </div>

                            <div className="xpo_space-y-4">
                                <div className="xpo_text-center">
                                    <h4 className="xpo_text-lg xpo_font-semibold xpo_text-gray-800 xpo_mb-2 xpo_flex xpo_items-center xpo_justify-center xpo_gap-2">
                                        <Signature size={20} />
                                        Please provide your digital signature
                                    </h4>
                                    <p className="xpo_text-gray-600 xpo_text-sm">Draw your signature in the box below</p>
                                </div>

                                <div className="xpo_flex xpo_flex-col xpo_items-center xpo_space-y-4">
                                    <div className="xpo_border-2 xpo_border-gray-300 xpo_rounded-lg xpo_overflow-hidden xpo_shadow-sm">
                                        <SignatureCanvas
                                            ref={sigCanvas}
                                            penColor='#02424F'
                                            canvasProps={{
                                                width: 500,
                                                height: 200,
                                                className: 'xpo_bg-white'
                                            }}
                                        />
                                    </div>
                                    <div 
                                        onClick={clearSignature}
                                        className="xpo_text-gray-600 hover:xpo_text-gray-800 xpo_underline xpo_text-sm xpo_transition-colors"
                                    >
                                        Clear Signature
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Payment Details */}
                    {step === 4 && (
                        <div className="xpo_space-y-6">
                            <div className="xpo_text-center xpo_mb-8">
                                <CheckCircle size={64} className="xpo_mx-auto xpo_text-markethia-500 xpo_mb-4" />
                                <span className="xpo_text-2xl xpo_font-bold xpo_text-gray-800 xpo_mb-2">Agreement Confirmed!</span>
                                <p className="xpo_text-gray-600">Your agreement has been successfully submitted</p>
                            </div>

                            <div className="xpo_bg-gradient-to-br xpo_from-markethia-50 xpo_to-markethia-50 xpo_border xpo_border-markethia-200 xpo_rounded-lg xpo_p-8">
                                <div className="xpo_flex xpo_items-start xpo_gap-4">
                                    <CreditCard size={32} className="xpo_text-markethia-600 xpo_flex-shrink-0 xpo_mt-1" />
                                    <div>
                                        <h4 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_mb-3">Payment Information</h4>
                                        <div className="xpo_bg-white xpo_rounded-lg xpo_p-6 xpo_border xpo_border-gray-200">
                                            <p className="xpo_text-gray-700 xpo_mb-4">
                                                We require a 50% advance payment before project initiation. Please make the payment within 15 days to finalize the agreement.
                                            </p>
                                            <div className="xpo_space-y-2">
                                                <p className="xpo_text-gray-700">
                                                    <strong>Amount to Pay:</strong> <span className="xpo_text-markethia-600 xpo_font-semibold">${(totalPrice * 0.5).toFixed(2)}</span>
                                                </p>
                                                <p className="xpo_text-gray-700">
                                                    <strong>Bank Details:</strong> {config.bankaddress || '[bank_address]'}
                                                </p>
                                                <p className="xpo_text-gray-700">
                                                    <strong>Payment Deadline:</strong> {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="xpo_bg-yellow-50 xpo_border xpo_border-yellow-200 xpo_rounded-lg xpo_p-4">
                                <p className="xpo_text-yellow-800 xpo_text-sm">
                                    <strong>Important:</strong> Please keep this payment information for your records. 
                                    You will receive a confirmation email with all details shortly.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="xpo_flex xpo_items-center xpo_justify-between xpo_pt-8 xpo_border-t xpo_border-gray-200 xpo_mt-8">
                        <div>
                            {step > 0 && step < 4 && (
                                <div 
                                    onClick={() => setStep(prev => prev - 1)}
                                    className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-6 xpo_py-3 xpo_bg-gray-100 hover:xpo_bg-gray-200 xpo_text-gray-700 xpo_rounded-lg xpo_transition-colors xpo_duration-200 xpo_cursor-pointer"
                                >
                                    <ArrowLeft size={16} />
                                    Back
                                </div>
                            )}
                        </div>

                        <div className="xpo_flex xpo_items-center xpo_gap-3">
                            {step === 2 && (
                                <a 
                                    href={`https://wa.me/8801973016222`} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-6 xpo_py-3 xpo_bg-markethia-100 hover:xpo_bg-markethia-200 xpo_text-markethia-700 xpo_rounded-lg xpo_transition-colors xpo_duration-200"
                                >
                                    <Phone size={16} />
                                    Talk First
                                </a>
                            )}

                            {step < 3 && (
                                <div 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (step === 1 && infoForm.current && !infoForm.current.checkValidity()) {
                                            return alert(__('Please fill necessary information. These informations are useful to us for further agreement.', 'site-core'));
                                        }
                                        if (step === 2) {
                                            if (pdfURL) {URL.revokeObjectURL(pdfURL.url);setPdfURL(null);}
                                            generate_pdf_agreement(
                                                selectedServices.map(s => s.pricing?.primary_agreement??'').join('\n\n'),
                                                formData, {...config, agencySignature: null}
                                            )
                                            .then(pdf => setPdfURL(pdf))
                                            .catch(err => console.error(err));
                                        }
                                        setStep(prev => prev + 1);
                                    }}
                                    disabled={step === 0 && selectedServices.length === 0}
                                    className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-6 xpo_py-3 xpo_bg-markethia-600 hover:xpo_bg-markethia-700 disabled:xpo_bg-gray-300 xpo_cursor-pointer disabled:xpo_cursor-not-allowed xpo_text-white xpo_rounded-lg xpo_transition-colors xpo_duration-200"
                                >
                                    Continue
                                    <ArrowRight size={16} />
                                </div>
                            )}

                            {step === 3 && (
                                <div 
                                    disabled={saving}
                                    onClick={(e) => 
                                        submit_agreement(e)
                                        .then(() => setStep(prev => prev + 1))
                                        .catch(err => alert(err.message))
                                        .finally(() => setSaving(false))
                                    }
                                    className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-6 xpo_py-3 xpo_bg-markethia-600 hover:xpo_bg-markethia-700 disabled:xpo_bg-gray-300 xpo_text-white xpo_rounded-lg xpo_transition-colors xpo_duration-200 xpo_cursor-pointer"
                                >
                                    {saving ? <Loader2 size={16} className="xpo_animate-spin" /> : <PenTool size={16} />}
                                    Confirm Agreement
                                </div>
                            )}

                            {step === 4 && (
                                <div 
                                    onClick={() => setPopup(null)}
                                    className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-6 xpo_py-3 xpo_bg-gray-600 hover:xpo_bg-gray-700 xpo_text-white xpo_rounded-lg xpo_transition-colors xpo_duration-200 xpo_cursor-pointer"
                                >
                                    <CheckCircle size={16} />
                                    Complete
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    useEffect(() => {
        const handle_click = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const tax_id = e.currentTarget?.dataset?.tax_id;
            if (!tax_id) return;
            setPopup(<ServicePopup tax_id={tax_id} />);
        }
        buttons.forEach(button => button.addEventListener('click', handle_click));
        
        return () => buttons.forEach(button => button.removeEventListener('click', handle_click));
    }, [buttons]);
    
    return (
        <div>
            {popup ? (
                <Popup showCross={false} onClose={() => setPopup(null)} className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_inset-0 xpo_z-50 xpo_flex xpo_items-center xpo_justify-center xpo_z-[9999]" backdropClassName="xpo_fixed xpo_inset-0 xpo_bg-black/40 xpo_bg-opacity-30" bodyClassName="xpo_absolute xpo_top-0 xpo_z-10 xpo_p-6 xpo_max-w-full xpo_min-w-[90vw] md:xpo_min-w-[28rem]">
                    <div className="xpo_bg-white xpo_rounded-xl xpo_shadow-lg">
                        {popup}
                    </div>
                </Popup>
            ) : null}
        </div>
    );
};

export default ServicePackage;