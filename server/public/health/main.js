
class ECGChart {
    constructor(canvasId) {
        this.ctx = document.getElementById(canvasId).getContext('2d');
        this.time = 0;
        this.maxDataPoints = 50; // Limit to prevent performance issues
    
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
            labels: [],
            datasets: [{
                label: 'ECG Signal',
                data: [],
                borderColor: '#4caf50',
                borderWidth: 2,
                fill: false,
                tension: 0.1, // Smooth curve
            }]
            },
            options: {
            responsive: true,
            scales: {
                x: {
                type: 'linear',
                title: {
                    display: true,
                    text: 'Time (s)'
                }
                },
                y: {
                title: {
                    display: true,
                    text: 'Amplitude (mV)'
                }
                }
            },
            plugins: {
                legend: {
                display: true,
                position: 'top'
                }
            }
            }
        });
    }
  
    addDataPoint(amplitude) {
        this.chart.data.labels.push(this.time.toFixed(2));
        this.chart.data.datasets[0].data.push(amplitude);
    
        // Keep data within a fixed range
        if (this.chart.data.labels.length > this.maxDataPoints) {
            this.chart.data.labels.shift();
            this.chart.data.datasets[0].data.shift();
        }
    
        this.chart.update();
        this.time += 0.1;
    }
  
    simulateLiveData() {
        setInterval(() => {
            const amplitude = Math.sin(this.time) + Math.random() * 0.1; // Simulated ECG signal
            this.addDataPoint(amplitude);
        }, 100);
    }
}


class HealthMonitor {
    constructor() {
        this.socket = io('http://localhost:3000', {
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 5000
        });
        this.token = null;
        this.streamingInterval = null;
        this.offlineData = [];
        this.userTableBody = document.getElementById('userTableBody');
        this.createUserBtn = document.getElementById('createUserBtn');
        this.showTableBtn = document.getElementById('showTableBtn');
        this.userTableContainer = document.getElementById('userTableContainer');
        this.chartContainer = document.getElementById('chartContainer');
        this.healthChartCanvas = document.getElementById('healthChart');
        this.healthChart = null;
        this.streamTypes = [
            ['blood_pressure', 'Blood Pressure', '#FF6B6B'],
            ['body_heat', 'Body Temperature', '#60A5FA'],
            ['heart_rate', 'Heart Rate', '#FFB74D'],   
            ['sugar_level', 'Sugar Level', '#FBBF24'],  
            ['sleep_record', 'Sleep Record', '#4CAF50'], 
            ['activity_record', 'Activity Record', '#9C27B0']
        ];
        this.colorMap = new Map(this.streamTypes.map(([key, level, color]) => [level, color]));
        
        this.initializeEventListeners();
        this.fetchUsers();
    }
    
    initializeEventListeners() {
        this.showTableBtn.addEventListener('click', () => this.showUserTable());
        document.getElementById('closeChartBtn').addEventListener('click', () => this.closeChart());
        document.getElementById('startStream').addEventListener('click', () => this.startStreaming());
        document.getElementById('launchBtn').addEventListener('click', () => this.launchChart());
        this.createUserBtn.addEventListener('click', () => this.createUser());

        document.querySelectorAll('#streamType').forEach(select => {
            this.streamTypes.forEach(([key, level, color]) => {
                const option = document.createElement('option');
                option.value = key;option.textContent = level;
                select.appendChild(option);
            });
        });
        
        this.socket.on('connect', () => this.sendBufferedData());
        this.socket.on('disconnect', () => this.handleDisconnect());
    }
    
    showUserTable() {
        this.userTableContainer.classList.remove('hidden');
        this.showTableBtn.classList.add('hidden');
    }
    
    closeChart() {
        this.chartContainer.classList.add('hidden');
        this.socket.emit('s2c_close', { stream_type: 'health_insights' });
    }
    
    startStreaming() {
        const streamType = document.getElementById('streamType').value;
        if (this.streamingInterval) clearInterval(this.streamingInterval);
        
        const ecgChart = new ECGChart('streamLive');
        ecgChart.simulateLiveData();

        this.socket.emit('start_connection', { deviceType: streamType });
        
        this.streamingInterval = setInterval(() => {
            const data = this.generateDummyData(streamType);
            ecgChart.addDataPoint(data.value);
            if (this.socket.connected) {
                this.socket.emit('device_stream', { ...data, offline_data: this.offlineData });
                this.offlineData = [];
            } else {
                this.offlineData.push(data);
            }
        }, 2000);
    }
    
    launchChart() {
        this.userTableContainer.classList.add('hidden');
        this.displayChart();
        this.socket.emit('s2c_stream', { stream_type: 'health_insights' });
        
        this.socket.on('c2s_stream', (data) => {
            if (data.stream_type === 'health_insights') {
                const labels = data.data.map(item => item.level);
                const updatedData = data.data.map(item => item.value);
                this.displayChart(labels, updatedData);
            }
        });
    }
    
    generateColor(label) {
        if (!this.colorMap.has(label)) {
            const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
            this.colorMap.set(label, color);
        }
        return this.colorMap.get(label);
    }
    
    displayChart(labels = [], dataValues = []) {
        this.chartContainer.classList.remove('hidden');
        
        if (!this.healthChart) {
            const ctx = this.healthChartCanvas.getContext('2d');
            this.healthChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataValues,
                        backgroundColor: labels.map(label => this.generateColor(label))
                    }]
                },
                options: { responsive: true, animation: false }
            });
        } else {
            this.healthChart.data.labels = labels;
            this.healthChart.data.datasets[0].data = dataValues;
            this.healthChart.data.datasets[0].backgroundColor = labels.map(label => this.generateColor(label));
            this.healthChart.update();
        }
    }
    
    sendBufferedData() {
        if (this.offlineData.length > 0) {
            this.offlineData.forEach(data => this.socket.emit('device_stream', data));
            this.offlineData = [];
        }
    }
    
    handleDisconnect() {
        console.log('Disconnected! Attempting to reconnect...');
        setTimeout(() => {
            this.socket.connect();
        }, 5000);
    }
    
    createUser() {
        const instance = this;
        const tr = document.createElement('tr');
        const tdFn = document.createElement('td');
        tdFn.className = 'border p-2';
        const inputFn = document.createElement('input');
        inputFn.type = 'text';
        inputFn.placeholder = 'First Name';
        inputFn.className = 'border rounded p-1';
        tdFn.appendChild(inputFn);
        const tdLn = document.createElement('td');
        tdLn.className = 'border p-2';
        const inputLn = document.createElement('input');
        inputLn.type = 'text';
        inputLn.placeholder = 'Last Name';
        inputLn.className = 'border rounded p-1';
        tdLn.appendChild(inputLn);
        const tdEmail = document.createElement('td');
        tdEmail.className = 'border p-2';
        const inputEmail = document.createElement('input');
        inputEmail.type = 'email';
        inputEmail.placeholder = 'Email';
        inputEmail.className = 'border rounded p-1';
        tdEmail.appendChild(inputEmail);
        const tdPhone = document.createElement('td');
        tdPhone.className = 'border p-2';
        const inputPhone = document.createElement('input');
        inputPhone.type = 'text';
        inputPhone.placeholder = 'Phone';
        inputPhone.className = 'border rounded p-1';
        tdPhone.appendChild(inputPhone);
        const tdAction = document.createElement('td');
        tdAction.className = 'border p-2';
        const registerBtn = document.createElement('button');
        registerBtn.textContent = 'Register';
        registerBtn.className = 'bg-green-500 text-white px-2 py-1 rounded';
        registerBtn.addEventListener('click', function() {
            fetch('/health/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fn: inputFn.value, ln: inputLn.value, e: inputEmail.value, p: inputPhone.value })
            }).then(r => r.json()).then(data => {
                if(data.user) {
                    instance.authenticateUser(inputEmail.value);
                    instance.fetchUsers();
                }
            });
        });
        tdAction.appendChild(registerBtn);
        tr.appendChild(tdFn);
        tr.appendChild(tdLn);
        tr.appendChild(tdEmail);
        tr.appendChild(tdPhone);
        tr.appendChild(tdAction);
        instance.userTableBody.prepend(tr);
    }
    
    authenticateUser(email) {
        fetch('/health/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ e: email })
        }).then(r => r.json()).then(data => {
            if(data.token) {
                this.token = data.token;
                this.authenticateSocket(this.token);
                this.userTableContainer.classList.add('hidden');
                this.showTableBtn.classList.remove('hidden');
                this.showToast('Logged in as ' + email, 'success');
            } else {
                this.showToast('Authentication failed', 'error');
            }
        });
    }
    
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast-enter bg-' + (type === 'success' ? 'green' : 'red') + '-500 text-white px-4 py-2 rounded mb-2';
        toast.textContent = message;
        document.getElementById('toastContainer').appendChild(toast);
        setTimeout(() => {toast.classList.add('toast-enter-active');}, 50);
        setTimeout(() => {
            toast.classList.remove('toast-enter-active');
            toast.classList.add('toast-exit-active');
            setTimeout(() => { toast.remove(); }, 500);
        }, 3000);
    }
    
    authenticateSocket(t) {
        this.socket.emit('authenticate', t);
    }
    
    fetchUsers() {
        const instance = this;
        fetch('/health/users').then(r => r.json()).then(data => {
            while(userTableBody.firstChild) userTableBody.removeChild(userTableBody.firstChild);
            data.forEach(u => {
                const tr = document.createElement('tr');
                const tdFn = document.createElement('td');
                tdFn.className = 'border p-2';
                tdFn.textContent = u.fn;
                const tdLn = document.createElement('td');
                tdLn.className = 'border p-2';
                tdLn.textContent = u.ln;
                const tdEmail = document.createElement('td');
                tdEmail.className = 'border p-2';
                tdEmail.textContent = u.e;
                const tdPhone = document.createElement('td');
                tdPhone.className = 'border p-2';
                tdPhone.textContent = u.p;
                const tdAction = document.createElement('td');
                tdAction.className = 'border p-2 flex space-x-2';
                const loginBtn = document.createElement('button');
                loginBtn.textContent = 'Login';
                loginBtn.className = 'bg-blue-500 text-white px-2 py-1 rounded';
                loginBtn.dataset.email = u.e;
                loginBtn.addEventListener('click', function() {
                    instance.authenticateUser(u.e);
                });
                const launchBtn = document.createElement('button');
                launchBtn.textContent = 'Launch';
                launchBtn.className = 'bg-purple-500 text-white px-2 py-1 rounded';
                launchBtn.addEventListener('click', function() {
                    userTableContainer.classList.add('hidden');
                    showTableBtn.classList.remove('hidden');
                    instance.displayChart();
                });
                tdAction.appendChild(loginBtn);
                tdAction.appendChild(launchBtn);
                tr.appendChild(tdFn);
                tr.appendChild(tdLn);
                tr.appendChild(tdEmail);
                tr.appendChild(tdPhone);
                tr.appendChild(tdAction);
                userTableBody.prepend(tr);
            });
        });
    }
    
    generateDummyData(streamType) {
        let value;
        if(streamType === 'blood_pressure') {
            value = 120 + (Math.random() - 0.5) * 8;
        } else if(streamType === 'body_heat') {
            value = 36.8 + (Math.random() - 0.5) * 0.3;
        } else if(streamType === 'sugar_level') {
            value = 90 + (Math.random() - 0.5) * 15;
        } else if(streamType === 'sleep_record') {
            value = 7 + (Math.random() - 0.5) * 0.8;
        } else {
            value = 0;
        }
        return { record_type: streamType, value: parseFloat(value.toFixed(2)), time: Date.now() };
    }
}

const healthMonitor = new HealthMonitor();

