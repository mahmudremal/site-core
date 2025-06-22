import request from '@common/request';

const __ = (t) => t;

class Visitor {
    constructor() {
        this.config = {
            visit: window?._visitorline ?? {},
            endpoint: `https://${location.host}/wp-json`,
            i18n: window?._visitorline?.i18n ?? {},
            debug: window.console,
        };

        this.visit_id = this.config.visit.visit_id ?? null;
        this.startTime = Date.now();

        // Organize state variables into configurations
        this.state = {
            timing: {
                totalAttentionTime: 0,
                lastMouseMoveTime: 0,
            },
            scroll: {
                lastScrollY: 0,
                scrolledPositions: [],
            },
            mouse: {
                positions: [],
                totalMouseMovement: 0,
            },
            attention: {
                rate: 0,
                active: false,
            },
        };

        this.boundingBoxes = [];

        this.setup_hooks();
    }

    setup_hooks() {
        this.trackPageVisibility();
        this.trackInteractions();
        this.trackAttentionPoints();
        this.bounding_box();
    }

    trackAttentionPoints() {
        // Monitor scroll position
        window.addEventListener('scroll', () => this.logScrollPosition());

        // Monitor mouse movement
        document.addEventListener('mousemove', (event) => this.logMouseMovement(event));

        // Keep track of active time on the page
        window.addEventListener('focus', () => {
            this.state.attention.active = true;
            this.state.timing.lastMouseMoveTime = Date.now();
        });

        window.addEventListener('blur', () => {
            this.state.attention.active = false;
            this.calculateAttentionRate();
        });

        // Update attention time every second if the user is active
        setInterval(() => {
            if (this.state.attention.active) {
                const currentTime = Date.now();
                this.state.timing.totalAttentionTime += 1;

                // Check for mouse movement
                if (currentTime - this.state.timing.lastMouseMoveTime <= 1000) {
                    this.state.attention.rate += 1; // Increment attention rate if there was mouse movement within this second
                }

                // Smooth out the attention rate over time
                this.state.attention.rate = Math.max(this.state.attention.rate - 0.1, 0);
            }
        }, 1000);
    }

    logScrollPosition() {
        const currentScrollY = window.scrollY;

        if (this.state.scroll.lastScrollY !== currentScrollY) {
            this.state.scroll.scrolledPositions.push(currentScrollY);
            this.state.scroll.lastScrollY = currentScrollY;
            // this.config.debug.log('Scrolled to:', currentScrollY);
        }
    }

    logMouseMovement(event) {
        const { clientX, clientY } = event;
        this.state.mouse.positions.push({ x: clientX, y: clientY });
        this.state.timing.lastMouseMoveTime = Date.now();

        // Assuming distance is moved in pixels from the last position
        if (this.state.mouse.positions.length > 1) {
            const lastPos = this.state.mouse.positions[this.state.mouse.positions.length - 2];
            const distance = Math.sqrt(Math.pow(clientX - lastPos.x, 2) + Math.pow(clientY - lastPos.y, 2));
            this.state.mouse.totalMouseMovement += distance;
        }
    }

    calculateAttentionRate() {
        // Log or use calculated attention rate
        const avgAttentionRate = this.state.attention.rate / this.state.timing.totalAttentionTime;
        this.config.debug.log('Average Attention Rate:', avgAttentionRate);
        // Here you might want to log or send this value to your backend
    }

    trackPageVisibility() {
        window.addEventListener('load', () => {
            this.logEvent('stay', 0, this.encodeJSON({ time: { starts: this.startTime } })).then(res => {
                const { event_id } = res;
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const currentTime = Date.now();
                            if (currentTime <= this.startTime + 1000 * 3) { return; }
                            const timeSpent = (currentTime - this.startTime) / 1000;
                            this.config.debug.log('stay', `Time spent: ${timeSpent} seconds`);
                            this.logEvent('stay', event_id, this.encodeJSON({ time: { starts: this.startTime, spent: timeSpent, at: currentTime } }));
                            this.startTime = currentTime;
                        }
                    });
                }, { threshold: [0] });

                observer.observe(document.body);
                window.addEventListener('beforeunload', () => {
                    const currentTime = Date.now();
                    const timeSpent = (currentTime - this.startTime) / 1000;
                    this.config.debug.log('stay', `Page leave after: ${timeSpent} seconds`);
                    this.logEvent('stay', event_id, this.encodeJSON({ time: { starts: this.startTime, spent: timeSpent, at: currentTime } }));
                });
            });
        });
    }

    trackInteractions() {
        document.addEventListener('click', (event) => {
            if (!typeof window?.getSelection) {return;}
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            const target = event.target;
            const text = target.innerText && target.innerText.trim() ? target.innerText.trim() : '';
            var rect = target.getBoundingClientRect();
            const eventData = {
                time: Date.now(),
                tag: target.tagName.toLowerCase(),
                bound: {
                    top: rect.top + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    height: rect.height
                },
                src: target.src || target.dataset.src || null,
                type: selectedText.length > 0 ? 'highlight' : 'click',
                screen: { w: window.innerWidth, h: window.innerHeight },
                text: selectedText.length > 0 ? selectedText : (text.length > 33 ? text.substr(0, 30) + '...' : text),
            };
            // this.createBoundingBox(eventData);
            this.logEvent('click', 0, this.encodeJSON(eventData));
        });
    }

    logEvent(eventType, eventId = 0, additionalData) {
        const url = `${this.config.endpoint}/sitecore/v1/events/${eventId}`;

        const requestData = {
            method: 'POST',
            headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                activity_id: this.visit_id,
                event_type: eventType,
                target: additionalData
            })
        };

        return new Promise((resolve, reject) => {
            request(url, requestData)
                .then(data => {
                    this.config.debug.log('Event logged:', data);
                    resolve(data);
                })
                .catch(err => {
                    this.config.debug.error('Error logging event:', err);
                    reject(err);
                });
        });
    }

    encodeJSON(code) {
        return JSON.stringify(code);
    }


    bounding_box() {
        window.addEventListener('resize', () => {
            this.boundingBoxes.forEach(item => {
                const { element, eventData } = item;
                const { bound, screen } = eventData;
                this.updateBoundingBoxPosition(element, bound, screen);
            });
        });
    }

    createBoundingBox(eventData) {
        const { bound, screen } = eventData;

        const box = document.createElement('div');
        box.style.position = 'absolute';
        box.style.pointerEvents = 'none';
        box.style.background = 'rgba(255, 255, 0, 0.4)';
        box.style.border = '2px solid #F32013';
        box.style.zIndex = '1000';

        document.body.appendChild(box);

        // Push with original eventData and element
        this.boundingBoxes.push({
            element: box,
            eventData: eventData
        });

        // Initial draw
        this.updateBoundingBoxPosition(box, bound, screen);
    }

    updateBoundingBoxPosition(box, originalBound, originalScreen) {
        const scaleX = window.innerWidth / originalScreen.w;
        const scaleY = window.innerHeight / originalScreen.h;

        box.style.left = `${originalBound.left * scaleX}px`;
        box.style.top = `${originalBound.top * scaleY}px`;
        box.style.width = `${originalBound.width * scaleX}px`;
        box.style.height = `${originalBound.height * scaleY}px`;
    }



}

new Visitor();