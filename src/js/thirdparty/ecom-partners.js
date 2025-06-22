document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a.link[class*="zPrice-plan-"]').forEach(button => {
        button.addEventListener('click', (event) => {
            const match = container.className.match(/data-ecom-package-(\d+)-(.+?)(?:\s|$)/);
            const textElement = button.querySelector('.elementor-button-text');
            if (match) {
                event.preventDefault();
                const pricing_id = match[1];
                const pricing_plan = match[2];
                const btnText = textElement.innerHTML;
                button.setAttribute('disabled', true);
                textElement.innerHTML = 'Loading...';
                fetch(`https://core.ecommerized.com/wp-json/sitecore/v1/contracts/packages/${pricing_id}/${pricing_plan}/create`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        invoice_id: null,
                        currency: 'AED',
                        client_email: '',
                        first_name: '',
                        middle_name: '',
                        last_name: '',

                        countryCode: '',
                        client_phone: '',
                    })
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        // console.error('Error creating invoice:', response.status);
                        return Promise.reject(response);
                    }
                })
                .then(data => {
                    // console.log('Invoice created successfully:', data);
                    if (data?.invoice_link) {
                        location.href = data.invoice_link;
                    }
                    return data;
                })
                .catch(error => {
                    // console.error('Fetch error:', error);
                })
                .finally(() => {
                    textElement.innerHTML = btnText;
                    button.removeAttribute('disabled');
                    // console.log('Fetch operation completed.');
                });
            }
        });
    });
});