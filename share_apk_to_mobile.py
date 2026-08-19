import socket
import os
import http.server
import socketserver

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

ip = get_ip()
apk_dir = r"android\app\build\outputs\apk\debug"

try:
    os.chdir(apk_dir)
except FileNotFoundError:
    print("Error: APK not found! Please build the app first.")
    exit(1)

print("\n" + "="*55)
print("  DOWNLOAD DIRECTLY TO YOUR MOBILE OVER WI-FI")
print("="*55)
print("\n1. Make sure your PC and Mobile are on the SAME Wi-Fi.")
print("2. Open Chrome/Safari on your mobile and type this exact link:\n")
print(f"   http://{ip}:8000/app-debug.apk\n")
print("="*55)
print("Server is running... Press Ctrl+C to close it once the download finishes.\n")

handler = http.server.SimpleHTTPRequestHandler
try:
    with socketserver.TCPServer(("", 8000), handler) as httpd:
        httpd.serve_forever()
except OSError:
    print("Port 8000 is currently busy. Please try closing other programs.")
