from waitress import serve
from app import app, backup_database

if __name__ == '__main__':
    print("="*60)
    print("🚀 Jakarta Semantic Harmony - Production Mode")
    print("="*60)
    
    # Backup database saat start
    backup_database()
    
    print("✅ Server running on http://0.0.0.0:1081")
    print("📍 Accessible from local network")
    print("🛑 Press CTRL+C to stop")
    print("="*60)
    
    # Serve dengan Waitress (production WSGI server)
    serve(app, host='0.0.0.0', port=1081, threads=4)
