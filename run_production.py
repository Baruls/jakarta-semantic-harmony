from app import app, backup_database
import os

if __name__ == '__main__':
    print("="*60)
    print("🚀 Jakarta Semantic Harmony - Production Mode")
    print("="*60)
    
    # Backup database saat start
    backup_database()
    
    print("✅ Server running on http://0.0.0.0:1081")
    print("📍 Accessible from local network & tunnels (playit.gg)")
    print("🛑 Press CTRL+C to stop")
    print("="*60)
    
    # Use Flask built-in server for production (compatible with tunnels)
    # Debug=False for production, threaded=True for concurrent requests
    app.run(host='0.0.0.0', port=1081, debug=False, threaded=True)
