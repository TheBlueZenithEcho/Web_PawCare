import time
import sys
import json
from datetime import datetime
import random
import urllib.request

def run_simulation():
    # Gia lap 1 payload cu the de test (Khong dau de tranh loi)
    payload = {
        "customer_id": "CUS00123",
        "phone": "0901234567",
        "name": "Nguyen Van A",
        "old_segment": "Loyal",
        "new_segment": "Champions",
        "rfm_scores": {
            "R": 5,
            "F": 5,
            "M": 5
        },
        "trigger_event": "segment_upgrade",
        "timestamp": datetime.now().isoformat()
    }
    
    print("\n--- BAT DAU TEST WEBHOOK (n8n) ---")
    webhook_url = input("\n👉 Nhap Test URL cua n8n (vi du: http://localhost:5678/webhook-test/...): ").strip()
    if not webhook_url:
        print("❌ Ban chua nhap URL. Dang dung URL mac dinh...")
        webhook_url = "http://localhost:5678/webhook/rfm-trigger"
        
    print(f"\nDang ban du lieu toi: [POST] {webhook_url}")
    print("Du lieu:")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    
    try:
        req = urllib.request.Request(webhook_url, method="POST")
        req.add_header('Content-Type', 'application/json')
        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        response = urllib.request.urlopen(req, data=data)
        print(f"\n✅ Gui thanh cong! Status: {response.status}")
    except Exception as e:
        print(f"\n❌ Loi khi gui: {e}")

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding='utf-8')
    run_simulation()
