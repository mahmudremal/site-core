import { MessageCircleQuestion, CheckCircle, FileText, PenTool, CreditCard, ArrowRight, ArrowLeft, Phone, Mail, Building, User, Tag, DollarSign, Signature, FileDown, Loader2 } from 'lucide-react';
import generate_pdf_agreement, { conditional_pricing } from './generate';
import SignatureCanvas from 'react-signature-canvas';
import { useState, useEffect, useRef } from 'react';
import { rest_url, sleep } from "@functions";
import { Popup, __ } from '@js/utils';
import { sprintf } from 'sprintf-js';
import axios from 'axios';

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
            axios.get(rest_url(`sitecore/v1/services/list`), { params: { tax_id } })
                .then(res => res.data)
                .then(res => {
                    if (res?.list) setServices(res.list);
                    if (res?.config) setConfig(prev => ({ ...prev, ...res.config }));
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
                        selectedServices.map(s => s.pricing?.primary_agreement ?? '').join('\n\n'),
                        { ...formData, signature: signature }, config
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
                            reject(new Error(err.response?.data?.message ?? __('An error occurred while submitting the agreement', 'site-core')));
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
                    {config.pre && <p className="text-gray-700 mb-4">{config.pre}</p>}
                    {children}
                    {config.post && <p className="text-gray-700">{config.post}</p>}
                </div>
            );
        }

        return (
            <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden">
                {/* Header with Progress Steps */}
                <div className="bg-gradient-to-r from-agreements-500 to-agreements-600 px-8 py-6">
                    <span className="text-2xl font-bold text-white mb-6">Service Agreement Process</span>
                    <div className="flex items-center justify-between">
                        {steps.map((stepInfo, index) => {
                            const Icon = stepInfo.icon;
                            return (
                                <div key={index} className="flex items-center flex-1">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${index <= step
                                            ? 'bg-white border-white text-agreements-600'
                                            : 'border-white/50 text-white/50'
                                        }`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className={`text-sm font-semibold transition-all duration-300 ${index <= step ? 'text-white' : 'text-white/50'
                                            }`}>
                                            {stepInfo.title}
                                        </p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`h-0.5 flex-1 mx-4 transition-all duration-300 ${index < step ? 'bg-white' : 'bg-white/30'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                    {/* Step 0: Service Selection */}
                    {step === 0 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <span className="text-2xl font-bold text-gray-800 mb-2">Choose Additional Features</span>
                                <p className="text-gray-600">Select the services that best fit your business needs</p>
                            </div>

                            <div className="grid gap-4">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="bg-gray-200 rounded-lg p-6 h-24"></div>
                                        </div>
                                    ))
                                ) : (
                                    services.map((service, i) => (
                                        <div key={i} className={`border-2 rounded-lg p-6 transition-all duration-200 cursor-pointer hover:shadow-lg ${service?.checked
                                                ? 'border-agreements-500 bg-agreements-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                            <label htmlFor={`service-${service.id}`} className="cursor-pointer flex items-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    id={`service-${service.id}`}
                                                    checked={service?.checked || false}
                                                    onChange={(e) => setServices(prev => prev.map(s => ({
                                                        ...s,
                                                        checked: s.id === service.id ? e.target.checked : s.checked
                                                    })))}
                                                    className="mt-1 w-5 h-5 text-agreements-600 border-gray-300 rounded focus:ring-agreements-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-gray-800">{service.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                            {service.pricing?.primary && (
                                                                <span className="bg-agreements-100 text-agreements-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                    ${service.pricing.primary}
                                                                </span>
                                                            )}
                                                            <a
                                                                target="_blank"
                                                                href={service.permalink}
                                                                rel="noopener noreferrer"
                                                                className="text-agreements-500 hover:text-agreements-600 transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MessageCircleQuestion size={20} title={service.excerpt} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    {service.excerpt && (
                                                        <p className="text-gray-600 text-sm mt-2">{service.excerpt}</p>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>

                            {selectedServices.length > 0 && (
                                <div className="bg-gradient-to-r from-agreements-50 to-agreements-50 border border-agreements-200 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <DollarSign className="text-agreements-600" size={24} />
                                        <h4 className="font-semibold text-gray-800">Estimated Investment</h4>
                                    </div>
                                    <p className="text-gray-700">
                                        {sprintf(__('Your estimated expense is around $%s. This may vary based on additional requirements, scope changes, or project complexity.', 'site-core'), totalPrice.toFixed(2))}
                                    </p>
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-600 font-medium">Selected Services:</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedServices.map((service, i) => (
                                                <span key={i} className="bg-agreements-100 text-agreements-800 px-3 py-1 rounded-full text-sm">
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
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <span className="text-2xl font-bold text-gray-800 mb-2">Your Information</span>
                                <p className="text-gray-600">Please provide your details for the agreement</p>
                            </div>

                            <form ref={infoForm} onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <User size={16} />
                                            Full Name
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => updateFormData('fullName', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agreements-500 focus:border-transparent transition-all"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Mail size={16} />
                                            Email Address
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateFormData('email', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agreements-500 focus:border-transparent transition-all"
                                            placeholder="Enter your email address"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Phone size={16} />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => updateFormData('phone', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agreements-500 focus:border-transparent transition-all"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Building size={16} />
                                            Business Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.businessName}
                                            onChange={(e) => updateFormData('businessName', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agreements-500 focus:border-transparent transition-all"
                                            placeholder="Enter your business name"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Tag size={16} />
                                            Business Industry
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.businessIndustry}
                                            onChange={(e) => updateFormData('businessIndustry', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agreements-500 focus:border-transparent transition-all"
                                            placeholder="e.g., Technology, Healthcare, Retail"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 2: Agreement Terms */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <span className="text-2xl font-bold text-gray-800 mb-2">
                                    {selectedServices.length > 0
                                        ? `Agreement for ${selectedServices.map(s => s.title).join(', ')}`
                                        : 'Service Agreement'
                                    }
                                </span>
                                <p className="text-gray-600">Please review the terms and conditions</p>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
                                <div className="prose prose-sm max-w-none">
                                    <AgreementBody>
                                        {selectedServices.map((service, i) =>
                                            service.pricing?.primary_agreement ? (
                                                // className="bg-white border border-gray-200 rounded p-4 mb-4"
                                                <div key={i}>
                                                    <h4 className="font-semibold text-gray-800 mb-2">{service.title} - Terms</h4>
                                                    <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: service.pricing.primary_agreement.replaceAll('\n', '<br />') }}></p>
                                                </div>
                                            ) : null
                                        )}
                                    </AgreementBody>
                                </div>
                            </div>

                            <div className="bg-agreements-50 border border-agreements-200 rounded-lg p-4">
                                <p className="text-agreements-800 text-sm">
                                    <strong>Note:</strong> By proceeding, you acknowledge that you have read and agree to these terms.
                                    If you have any questions, please feel free to contact us before signing.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Digital Signature */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <span className="text-2xl font-bold text-gray-800 mb-2">Agreement Preview & Signature</span>
                                <p className="text-gray-600">Review the final agreement and provide your digital signature</p>
                            </div>

                            <div
                                onClick={() => pdfURL && window.open(pdfURL.url, '_blank')}
                                className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${pdfURL ? 'cursor-pointer' : ''}`}
                            >
                                <div>
                                    {pdfURL ? <FileDown size={48} className="mx-auto text-gray-400 mb-4 animate-bounce" /> : <FileText size={48} className="mx-auto text-gray-400 mb-4" />}
                                    <p className="text-gray-600 text-lg font-medium">{pdfURL ? 'PDF Agreement Download' : 'PDF Agreement Preview'}</p>
                                    <p className="text-gray-500 text-sm">{pdfURL ? 'The complete agreement document for this contract.' : 'The complete agreement document will be displayed here'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="text-center">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center justify-center gap-2">
                                        <Signature size={20} />
                                        Please provide your digital signature
                                    </h4>
                                    <p className="text-gray-600 text-sm">Draw your signature in the box below</p>
                                </div>

                                <div className="flex flex-col items-center space-y-4">
                                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                        <SignatureCanvas
                                            ref={sigCanvas}
                                            penColor='#02424F'
                                            canvasProps={{
                                                width: 500,
                                                height: 200,
                                                className: 'bg-white'
                                            }}
                                        />
                                    </div>
                                    <div
                                        onClick={clearSignature}
                                        className="text-gray-600 hover:text-gray-800 underline text-sm transition-colors"
                                    >
                                        Clear Signature
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Payment Details */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <CheckCircle size={64} className="mx-auto text-agreements-500 mb-4" />
                                <span className="text-2xl font-bold text-gray-800 mb-2">Agreement Confirmed!</span>
                                <p className="text-gray-600">Your agreement has been successfully submitted</p>
                            </div>

                            <div className="bg-gradient-to-br from-agreements-50 to-agreements-50 border border-agreements-200 rounded-lg p-8">
                                <div className="flex items-start gap-4">
                                    <CreditCard size={32} className="text-agreements-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="text-xl font-semibold text-gray-800 mb-3">Payment Information</h4>
                                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                                            <p className="text-gray-700 mb-4">
                                                We require a 50% advance payment before project initiation. Please make the payment within 15 days to finalize the agreement.
                                            </p>
                                            <div className="space-y-2">
                                                <p className="text-gray-700">
                                                    <strong>Amount to Pay:</strong> <span className="text-agreements-600 font-semibold">${(totalPrice * 0.5).toFixed(2)}</span>
                                                </p>
                                                <p className="text-gray-700">
                                                    <strong>Bank Details:</strong> <span dangerouslySetInnerHTML={{ __html: (config.bankaddress || '[bank_address]').replaceAll('\n', '<br />') }}></span>
                                                </p>
                                                <p className="text-gray-700">
                                                    <strong>Payment Deadline:</strong> {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-yellow-800 text-sm">
                                    <strong>Important:</strong> Please keep this payment information for your records.
                                    You will receive a confirmation email with all details shortly.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
                        <div>
                            {step > 0 && step < 4 && (
                                <div
                                    onClick={() => setStep(prev => prev - 1)}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 cursor-pointer"
                                >
                                    <ArrowLeft size={16} />
                                    Back
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {step === 2 && config?.phone && (
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`https://wa.me/${config.phone}`}
                                    className="flex items-center gap-2 px-6 py-3 bg-agreements-100 hover:bg-agreements-200 text-agreements-700 rounded-lg transition-colors duration-200"
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
                                            if (pdfURL) { URL.revokeObjectURL(pdfURL.url); setPdfURL(null); }
                                            generate_pdf_agreement(
                                                selectedServices.map(s => s.pricing?.primary_agreement ?? '').join('\n\n'),
                                                formData, { ...config, agencySignature: null }
                                            )
                                                .then(pdf => setPdfURL(pdf))
                                                .catch(err => console.error(err));
                                        }
                                        setStep(prev => prev + 1);
                                    }}
                                    disabled={step === 0 && selectedServices.length === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-agreements-600 hover:bg-agreements-700 disabled:bg-gray-300 cursor-pointer disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
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
                                    className="flex items-center gap-2 px-6 py-3 bg-agreements-600 hover:bg-agreements-700 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 cursor-pointer"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <PenTool size={16} />}
                                    Confirm Agreement
                                </div>
                            )}

                            {step === 4 && (
                                <div
                                    onClick={() => setPopup(null)}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 cursor-pointer"
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
            window?.scrollTo && window.scrollTo({ top: 0, behavior: 'smooth' });
            sleep(1000).then(() =>
                setPopup(<ServicePopup tax_id={tax_id} />)
            );
        }
        buttons.forEach(button => button.addEventListener('click', handle_click));

        return () => buttons.forEach(button => button.removeEventListener('click', handle_click));
    }, [buttons]);

    return (
        <div>
            {popup ? (
                <Popup showCross={false} onClose={() => setPopup(null)} className="absolute top-0 left-0 w-full inset-0 z-50 flex items-center justify-center z-[9999]" backdropClassName="fixed inset-0 bg-black/40 bg-opacity-30" bodyClassName="absolute top-0 z-10 p-6 max-w-full min-w-[90vw] md:min-w-[28rem]">
                    <div className="bg-white rounded-xl shadow-lg">
                        {popup}
                    </div>
                </Popup>
            ) : null}
        </div>
    );
};

export default ServicePackage;