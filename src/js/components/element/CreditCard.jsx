import { useEffect, useState, useRef } from "react";
import { rest_url } from "@functions";
import request from "@common/request";
import { Trash } from "lucide-react";
import { useTranslation } from "@context/LanguageProvider";

export default function CreditCard({ store = [], pk = '', setAllowProceed = () => {} }) {
    const [stored = [], setStored = () => {}] = store;
    const { __ } = useTranslation();
    const [showCardForm, setShowCardForm] = useState(stored.length === 0);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const cardRef = useRef({ tap: null, card: null });

    useEffect(() => {
        if (showCardForm) {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.4/bluebird.min.js";
            script.async = true;
            document.body.appendChild(script);

            const tapScript = document.createElement("script");
            tapScript.src = "https://secure.gosell.io/js/sdk/tap.min.js";
            tapScript.async = true;
            tapScript.onload = initializeTap;
            document.body.appendChild(tapScript);

            return () => {
                document.body.removeChild(script);
                document.body.removeChild(tapScript);
            };
        }
    }, [showCardForm]);

    const initializeTap = () => {
        if (!window.Tapjsli) return;

        const tapInstance = window.Tapjsli(pk);
        cardRef.current.tap = tapInstance;

        const elements = tapInstance.elements({});

        const style = {
            base: {
                color: '#535353',
                lineHeight: '18px',
                fontFamily: 'sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: 'rgba(0, 0, 0, 0.26)',
                    fontSize: '15px'
                }
            },
            invalid: {
                color: 'red'
            }
        };

        const labels = {
            cardNumber: __('Card Number'),
            expirationDate: __('MM/YY'),
            cvv: __('CVV'),
            cardHolder: __('Card Holder Name')
        };

        const paymentOptions = {
            currencyCode: 'all', // ["KWD", "USD", "SAR"],
            labels: labels,
            TextDirection: 'ltr',
            paymentAllowed: 'all', // ['VISA', 'MASTERCARD', 'AMERICAN_EXPRESS', 'MADA']
        };

        const card = elements.create('card', { style: style }, paymentOptions);
        card.mount('#element-container');
        cardRef.current.card = card;

        card.addEventListener('change', function (event) {
            const displayError = document.getElementById('error-handler');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
    };

    const handleTapSubmit = async () => {
        if (!cardRef.current || !cardRef.current.tap || !cardRef.current.card) return;
        setLoading(true);

        const result = await cardRef.current.tap.createToken(cardRef.current.card);
        if (result.error) {alert(result.error.message);setLoading(false);return;}
        // 
        const { id: tokenId, card: cardData } = result;
        const cardholderName = cardData.name || "";
        console.log(result)

        const maskedCardNumber = cardData.first_six + "••••••" + cardData.last_four;
        const expiryDate = `${cardData.exp_month}/${cardData.exp_year}`;

        request(rest_url('/sitecore/v1/payment/card/submit/tap'), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                card_id: cardData.id,
                token: tokenId,
                name: cardholderName,
                masked_card: maskedCardNumber,
                expiry_date: expiryDate
            })
        })
        .then(data => {
            setStored(data?.length ? data : []);
            setShowCardForm(false);
            setSelectedId(data.find(c => c.token == tokenId)?.id);
        })
        .catch(error => console.error(error))
        .finally(() => setLoading(false));
    };

    const removeSavedCard = (card_id) => {
        if (!confirm(__('Are you sure you want to remove this card?'))) {return;}
        request(rest_url(`/sitecore/v1/payment/card/${card_id}/remove`), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        }).then(data => setStored(prev => prev.filter(c => c.id !== card_id))).catch(error => {
            throw new Error(error);
        });
    }

    useEffect(() => {
        if (showCardForm) {
            setAllowProceed(false);
        } else {
            setAllowProceed({ selected: selectedId });
        }
    }, [showCardForm, selectedId]);

    useEffect(() => {
        if (stored.length === 0) {
            setShowCardForm(true);
        }
    }, [stored]);

    return (
        <div className="p-4 card rounded-lg shadow">
            {!showCardForm && stored.length > 0 && (
                <div>
                    <div className="space-y-2">
                        {stored.map((card, index) => (
                            <div className="xpo_flex xpo_flex-nowrap xpo_gap-4 xpo_justify-betweenxpo_items-center cursor-pointer">
                                <label key={index} className="xpo_flex xpo_items-center space-x-2">
                                    <input
                                        type="radio"
                                        checked={selectedId === card.id}
                                        onChange={() => setSelectedId(card.id)}
                                        className="form-radio form-check-input"
                                    />
                                    <span>{card?.masked_card??card?.label??card?.id??card?.card_id}</span>
                                </label>
                                <Trash
                                    className="h-4 xpo_w-4 rounded-xl cursor-pointer"
                                    title={__('Remove this card')}
                                    onClick={() => removeSavedCard(card.id)}
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        className="mt-4 xpo_text-blue-600 underline"
                        onClick={() => setShowCardForm(true)}
                    >{__('Use different card')}</button>
                </div>
            )}

            {showCardForm && (
                <div className="space-y-4">
                    <div id="element-container" className="w-full border rounded xpo_p-2"></div>
                    <div id="error-handler" className="text-red-500"></div>
                    <div className="xpo_flex xpo_justify-between">
                        {stored.length ? (
                        <button
                            onClick={() => setShowCardForm(false)}
                            className="px-4 py-2 bg-gray-300 rounded xpo_text-gray-700"
                        >{__('Cancel')}</button>
                        ) : null}
                        <button
                            onClick={handleTapSubmit}
                            className="px-4 py-2 btn rounded"
                            disabled={loading}
                        >{loading ? __('Submitting...') : __('Submit')}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
