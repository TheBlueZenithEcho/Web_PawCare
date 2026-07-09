import pandas as pd
from datetime import datetime

def calculate_r_score(recency):
    if recency <= 30: return 5
    elif recency <= 60: return 4
    elif recency <= 90: return 3
    elif recency <= 180: return 2
    else: return 1

def calculate_f_score(frequency):
    if frequency >= 12: return 5
    elif frequency >= 8: return 4
    elif frequency >= 4: return 3
    elif frequency >= 2: return 2
    else: return 1

def calculate_m_score(monetary):
    if monetary >= 10000000: return 5
    elif monetary >= 5000000: return 4
    elif monetary >= 2000000: return 3
    elif monetary >= 500000: return 2
    else: return 1

def determine_segment(r, f, m):
    score = r + f + m
    if score >= 13: return "Champions"
    elif r <= 2 and (f >= 4 or m >= 3): return "At Risk"
    elif score >= 10: return "Loyal"
    elif score >= 7: return "Needs Attention"
    else: return "Hibernating"

def run_engine():
    print("Dang doc du lieu giao dich...")
    try:
        df_txn = pd.read_csv('transactions.csv')
    except FileNotFoundError:
        print("Khong tim thay file transactions.csv")
        return
        
    df_txn['transaction_date'] = pd.to_datetime(df_txn['transaction_date'])
    current_date = datetime.now()
    
    print("Dang tinh toan RFM...")
    rfm = df_txn.groupby('customer_id').agg({
        'transaction_date': lambda x: (current_date - x.max()).days,
        'transaction_id': 'count',
        'amount': 'sum'
    }).reset_index()
    
    rfm.rename(columns={
        'transaction_date': 'Recency',
        'transaction_id': 'Frequency',
        'amount': 'Monetary'
    }, inplace=True)
    
    print("Dang phan cum khach hang...")
    rfm['R_Score'] = rfm['Recency'].apply(calculate_r_score)
    rfm['F_Score'] = rfm['Frequency'].apply(calculate_f_score)
    rfm['M_Score'] = rfm['Monetary'].apply(calculate_m_score)
    
    rfm['Segment'] = rfm.apply(lambda row: determine_segment(row['R_Score'], row['F_Score'], row['M_Score']), axis=1)
    
    rfm.to_csv('rfm_segments.csv', index=False, encoding='utf-8')
    print("Da xu ly xong! Ket qua phan cum duoc luu tai: rfm_segments.csv")

if __name__ == "__main__":
    run_engine()