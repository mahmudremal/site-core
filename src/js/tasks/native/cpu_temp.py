# To register the native host with Chrome, you’ll need to add it to the system registry. You can use a command prompt or terminal to execute the following commands (make sure to change the paths):
# reg add "HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.yournativeapp" /t REG_SZ /d "C:\path\to\com.yournativeapp.json" /f


import json
import sys
import os
import psutil

def get_cpu_temperature():
    # Get temperatures for all sensors
    temperatures = psutil.sensors_temperatures()
    # Assuming the default sensor is called 'coretemp'
    return temperatures.get('coretemp', [{}])[0].get('current', "N/A")

def send_message(message):
    sys.stdout.write(json.dumps(message) + '\n')
    sys.stdout.flush()

def receive_message():
    raw_data = sys.stdin.read()
    return json.loads(raw_data)

if __name__ == '__main__':
    while True:
        message = receive_message()
        if 'get_cpu_temp' in message:
            cpu_temp = get_cpu_temperature()
            send_message({'cpu_temperature': cpu_temp})