import { debug } from "@modules/debug";

class Screen {
    constructor(args) {
        this.win = false;
        this.error = {
            NOT_ALLOWED_SCREEN: {
                code: 401, message: 'Screen not allowed!'
            }
        };
        this.config = {...args};
        // if (args.url) {return;}
        // this.launch(args.url);
    }
    launch(url) {
        return new Promise((resolve, reject) => {
            this.win = window.open(url, '_blank', 'width=800,height=600');
            if (this.win) {
                this.win.onload = () => {
                    this.preSetupPage();
                    resolve(this);
                };
                this.win.onerror = (error) => {
                    reject({code: 0, error: error});
                }
            } else {
                reject(this.error.NOT_ALLOWED_SCREEN);
            }
        });
    }
    navigateTo(url, throwError = false) {
        return new Promise(async (resolve, reject) => {
            // if (this.win) {this.win.close();}
            // this.win = window.open(url, '_blank', 'width=800,height=600');
            // debug.log('Redirecting to: ', url);
            this.win.location.replace(url);
            this.onPageLoaded().then(loaded => {
                this.preSetupPage();resolve(this);
            }).catch(error => {
                if (throwError) {reject({code: 0, error: error});} else {resolve('');}
            });
        });
    }
    onPageLoaded(timeout = 15000) {
        return new Promise((resolve, reject) => {
            try {
                const start = Date.now();
                setTimeout(() => {
                    const checkIfLoaded = setInterval(() => {
                        if (this.win.document && this.win.document.readyState === 'complete') {
                            debug.log('Closing interval');
                            clearInterval(checkIfLoaded);
                            this.preSetupPage();
                            resolve(this);
                        } else if (Date.now() - start > timeout) {
                            reject(new Error('Page loading timed out'));
                        } else {
                            debug.log('Loading...');
                        }
                    }, 100);
                }, 200);
            } catch (error) {
                reject(error);
            }
        });
    }
    preSetupPage() {
        // this.win.document.title = 'Scraping under process! Please avoid touching screen...';
        // this.win.document.body.style.backgroundColor = '#FF6F00';
        if (typeof this.config?.onload === 'function') {
            this.config.onload();
        }
    }

}



export default Screen;
