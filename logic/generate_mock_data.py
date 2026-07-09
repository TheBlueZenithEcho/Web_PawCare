import pandas as pd
import numpy as np
from faker import Faker
from datetime import datetime, timedelta

fake = Faker('vi_VN')

def generate_data():
    print("Đang tạo dữ liệu giả lập...")
    
    num_customers = 500
    customers = []
    for i in range(num_customers):
        customers.append({
            'customer_id': f'CUS{str(i).zfill(5)}',
            'name': fake.name(),
            'phone': fake.phone_number()
        })
    df_customers = pd.DataFrame(customers)

    num_transactions = 2000
    transactions = []
    current_date = datetime.now()

    for _ in range(num_transactions):
        cust_id = np.random.choice(df_customers['customer_id'])
        
        days_ago = int(np.random.exponential(scale=60)) 
        if days_ago > 365: 
            days_ago = np.random.randint(1, 365)
            
        trans_date = current_date - timedelta(days=days_ago)
        trans_type = np.random.choice(['BOOKING', 'ORDER'], p=[0.6, 0.4])
        
        if trans_type == 'BOOKING':
            amount = np.random.uniform(200000, 2000000)
        else:
            amount = np.random.uniform(100000, 5000000)
            
        transactions.append({
            'transaction_id': f'TXN{fake.unique.random_number(digits=6)}',
            'customer_id': cust_id,
            'type': trans_type,
            'amount': round(amount, -3),
            'transaction_date': trans_date.strftime('%Y-%m-%d %H:%M:%S')
        })

    df_transactions = pd.DataFrame(transactions)

    df_customers.to_csv('customers.csv', index=False, encoding='utf-8')
    df_transactions.to_csv('transactions.csv', index=False, encoding='utf-8')
    print("Đã tạo thành công: customers.csv và transactions.csv (lưu tại thư mục logic)")

if __name__ == "__main__":
    generate_data()