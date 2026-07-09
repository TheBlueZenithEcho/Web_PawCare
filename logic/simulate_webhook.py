import pandas as pd
import json
from datetime import datetime
import random

def run_simulation():
    try:
        df_rfm = pd.read_csv('rfm_segments.csv')
        df_customers = pd.read_csv('customers.csv')
    except FileNotFoundError:
        print("Khong tim thay file.")
        return

    df = pd.merge(df_rfm, df_customers, on='customer_id', how='left')
    
    sample_customers = df.sample(3).to_dict('records')
    segments = ["Champions", "Loyal", "Needs Attention", "At Risk", "Hibernating"]
    
    for cust in sample_customers:
        current_segment = cust['Segment']
        old_segment = random.choice([s for s in segments if s != current_segment])
        
        event_type = "segment_upgrade" if segments.index(current_segment) < segments.index(old_segment) else "segment_downgrade"
        
        payload = {
            "customer_id": cust['customer_id'],
            "phone": cust.get('phone', ''),
            "name": cust.get('name', ''),
            "old_segment": old_segment,
            "new_segment": current_segment,
            "rfm_scores": {
                "R": cust['R_Score'],
                "F": cust['F_Score'],
                "M": cust['M_Score']
            },
            "trigger_event": event_type,
            "timestamp": datetime.now().isoformat()
        }
        
        import urllib.request
        
        print("\n--- Sending to Webhook (n8n) ---")
        webhook_url = input("\n👉 Nhập Test URL của n8n (chuột phải copy ở cục Webhook) rồi ấn Enter: ").strip()
        if not webhook_url:
            webhook_url = "http://localhost:5678/webhook/rfm-trigger"
            
        print(f"URL: [POST] {webhook_url}")
        print("Payload:")
        print(json.dumps(payload, indent=2))
        
        try:
            req = urllib.request.Request(webhook_url, method="POST")
            req.add_header('Content-Type', 'application/json')
            data = json.dumps(payload).encode('utf-8')
            response = urllib.request.urlopen(req, data=data)
            print(f"✅ Gửi thành công! Status: {response.status}")
        except Exception as e:
            print(f"❌ Lỗi khi gửi: {e}")

if __name__ == "__main__":
    run_simulation()
