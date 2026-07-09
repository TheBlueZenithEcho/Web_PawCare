document.addEventListener('DOMContentLoaded', () => {
    
    // Config: Supabase
    const SUPABASE_URL = 'https://fkizlhcipjikyajibtzx.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_Z7fo-7kBUESzP4XnjBjbLw_Kt-73Rzb';
    const supaClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let mergedData = [];
    let currentSelectedCustomer = null;

    const webhookInput = document.getElementById('webhook-url');
    const toast = document.getElementById('toast');
    const emailModal = document.getElementById('email-modal');
    const modalEmailTo = document.getElementById('modal-email-to');
    const modalEmailMessage = document.getElementById('modal-email-message');
    
    // Bulk Modal elements
    const bulkModal = document.getElementById('bulk-email-modal');
    const bulkSegmentSelect = document.getElementById('bulk-segment-select');
    const bulkCount = document.getElementById('bulk-count');
    const bulkEmailMessage = document.getElementById('bulk-email-message');

    // Birthday Modal elements
    const birthdayModal = document.getElementById('birthday-modal');
    const birthdayMonthSelect = document.getElementById('birthday-month-select');
    const birthdayCount = document.getElementById('birthday-count');
    const birthdayMessage = document.getElementById('birthday-message');

    // Filters
    const filterSort = document.getElementById('filter-sort');
    const filterSegment = document.getElementById('filter-segment');

    function showToast(message, isError = false) {
        toast.className = 'toast show';
        toast.style.backgroundColor = isError ? '#b91c1c' : '#15803d';
        toast.innerHTML = isError ? 
            `<i class="fa-solid fa-circle-xmark"></i> <span>${message}</span>` : 
            `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
        setTimeout(() => { toast.className = 'toast hidden'; }, 3000);
    }

    async function sendWebhookPayload(url, payload) {
        try {
            const response = await fetch('/api/proxy', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUrl: url, payload: payload })
            });
            return response.ok;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    const messageTemplates = {
        'Champions': "Chào bạn {name},\n\nCảm ơn bạn đã luôn tin tưởng và lựa chọn PawCare là người bạn đồng hành trong việc chăm sóc thú cưng. Sự ủng hộ nhiệt tình của bạn chính là động lực to lớn giúp PawCare ngày càng hoàn thiện hơn.\n\nNhằm tri ân khách hàng thân thiết, PawCare xin gửi tặng bé cưng một phần quà đặc biệt: Miễn phí 100% gói Spa Thư Giãn cho lần ghé thăm tiếp theo.\n\nRất mong sớm được gặp lại bạn và bé tại cửa hàng!\n\nTrân trọng,\nĐội ngũ chăm sóc khách hàng VIP PawCare",
        'Loyal': "Chào bạn {name},\n\nPawCare vô cùng trân trọng sự gắn bó của bạn và bé cưng trong suốt thời gian qua. Để đáp lại tình cảm đó, chúng tôi dành tặng riêng cho bạn ưu đãi giảm giá 20% cho gói Grooming & Spa toàn diện.\n\nHãy đưa bé đến PawCare để bé được tận hưởng dịch vụ tắm gội, cắt tỉa lông chuyên nghiệp nhất. Đảm bảo bé sẽ vô cùng thích thú và xinh đẹp khi trở về nhà.\n\nTrân trọng,\nĐội ngũ PawCare",
        'Needs Attention': "Chào bạn {name},\n\nPawCare nhận thấy đã khá lâu rồi bé cưng nhà mình chưa đến tân trang nhan sắc. Việc tắm gội và tỉa lông định kỳ không chỉ giúp bé luôn sạch sẽ, xinh xắn mà còn mang lại sự thoải mái tuyệt đối cho các bé.\n\nĐừng quên đặt lịch hẹn Spa hoặc Grooming với PawCare trong tháng này nhé! Chúng tôi luôn sẵn lòng chào đón và mang đến dịch vụ chăm sóc tốt nhất cho bé.\n\nTrân trọng,\nĐội ngũ PawCare",
        'At Risk': "Chào bạn {name},\n\nĐã một khoảng thời gian khá dài PawCare không thấy bé cưng ghé thăm. Chúng tôi rất nhớ bé và hy vọng cả bạn cùng bé vẫn luôn vui vẻ.\n\nĐể chào đón sự quay trở lại của hai bạn, PawCare xin gửi tặng Voucher trị giá 500.000đ áp dụng cho tất cả các dịch vụ (Grooming/Spa, Lưu trú thú cưng - Pet Hotel, và Mua sắm tại Shop). Hy vọng voucher này sẽ là một bất ngờ nhỏ giúp bé có thêm những trải nghiệm tuyệt vời.\n\nTrân trọng,\nĐội ngũ PawCare",
        'Hibernating': "Chào bạn {name},\n\nPawCare luôn trân trọng những khách hàng đã từng sử dụng dịch vụ. Chúng tôi hiểu rằng bạn có thể đang bận rộn, nhưng nhu cầu vui chơi và được chăm sóc của thú cưng luôn cần được quan tâm mỗi ngày.\n\nPawCare xin gửi tặng mã giảm giá 30% cho bất kỳ dịch vụ nào trong tháng này. Hãy cho chúng tôi cơ hội được phục vụ bạn và bé cưng một lần nữa nhé!\n\nTrân trọng,\nĐội ngũ PawCare"
    };

    function generateEmailHTML(messageContent) {
        const headerHTML = `
        <div style="text-align: center; padding: 30px 0 20px 0; background-color: #ffffff; border-bottom: 2px solid #81c784;">
            <div style="display: inline-block; vertical-align: middle;">
                <img src="data:image/png;base64,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" alt="Paw" width="40" height="40" style="vertical-align: middle; margin-right: 12px; border: none; outline: none; text-decoration: none; display: block;" />
            </div>
            <h1 style="color: #1C693D; font-size: 40px; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; letter-spacing: 1px; display: inline-block; vertical-align: middle;">
                PawCare
            </h1>
            <p style="color: #6b7280; font-size: 15px; margin-top: 12px; font-style: italic; font-weight: 500;">Nâng niu thú cưng cùng PawCare</p>
        </div>
        `;

        const bodyHTML = `
        <div style="padding: 40px 30px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; color: #374151; line-height: 1.8; background-color: #ffffff;">
            ${messageContent.replace(/\n/g, '<br>')}
        </div>
        `;

        const footerHTML = `
        <div style="background-color: #2F3E32; color: #d1d5db; padding: 25px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center; font-size: 13px;">
            <div style="margin-bottom: 15px;">
                <a href="#" style="color: #81c784; text-decoration: none; margin: 0 10px;">Về chúng tôi</a> | 
                <a href="#" style="color: #81c784; text-decoration: none; margin: 0 10px;">Cửa hàng</a> | 
                <a href="#" style="color: #81c784; text-decoration: none; margin: 0 10px;">Khuyến mãi</a>
            </div>
            <div style="margin-bottom: 15px; color: #9ca3af;">
                📞 1900 1234 &nbsp;&nbsp;|&nbsp;&nbsp; ✉️ contact@pawcare.com
            </div>
            <div style="color: #6b7280; font-size: 11px;">
                &copy; 2024 PawCare Pet Shop. All rights reserved.
            </div>
        </div>
        `;

        return `<div style="background-color: #f3f4f6; padding: 30px 10px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
                ${headerHTML}
                ${bodyHTML}
                ${footerHTML}
            </div>
        </div>`;
    }

    const subjectTemplates = {
        'Champions': "Tri ân Khách hàng VIP - Tặng phần quà đặc biệt từ PawCare",
        'Loyal': "Ưu đãi 20% gói Grooming tháng này dành riêng cho bạn",
        'Needs Attention': "Lịch kiểm tra sức khỏe định kỳ cho thú cưng",
        'At Risk': "Nhớ bé quá! Tặng bạn Voucher 500K từ PawCare",
        'Hibernating': "Giảm 30% tất cả dịch vụ - Chào mừng bạn quay lại!"
    };

    // --- RFM ENGINE LOGIC ---
    function getQuintileScore(val, sortedValues, isRecency = false) {
        if(sortedValues.length === 0) return 1;
        const q1 = sortedValues[Math.floor(sortedValues.length * 0.2)] || sortedValues[0];
        const q2 = sortedValues[Math.floor(sortedValues.length * 0.4)] || sortedValues[0];
        const q3 = sortedValues[Math.floor(sortedValues.length * 0.6)] || sortedValues[0];
        const q4 = sortedValues[Math.floor(sortedValues.length * 0.8)] || sortedValues[0];

        let score = 5;
        if(val <= q1) score = 1;
        else if(val <= q2) score = 2;
        else if(val <= q3) score = 3;
        else if(val <= q4) score = 4;

        // Recency: gia tri nho (gan day nhat) thi diem cao (5)
        return isRecency ? (6 - score) : score;
    }

    function assignSegment(r, f, m) {
        const score = parseInt(`${r}${f}${m}`);
        if ([555, 554, 544, 545, 454, 455, 445].includes(score)) return 'Champions';
        if ([543, 444, 435, 355, 354, 345, 344, 335, 453, 553].includes(score)) return 'Loyal';
        if ([535, 534, 443, 434, 343, 334, 325, 324, 533].includes(score)) return 'Needs Attention';
        if ([255, 254, 245, 244, 253, 252, 243, 242, 235, 234, 225, 224, 153, 152, 145, 143, 142, 135, 134, 133, 125, 124].includes(score)) return 'At Risk';
        return 'Hibernating';
    }

    async function initApp() {
        try {
            showToast("Đang tải dữ liệu Real-time từ Supabase...");
            
            // Fetch Data
            const { data: customers, error: errCust } = await supaClient.from('customer').select('customer_id, first_name, last_name, phone, email');
            const { data: orders, error: errOrd } = await supaClient.from('orders').select('customer_id, created_at, total_amount');
            const { data: bookings, error: errBook } = await supaClient.from('booking').select('customer_id, created_at, total_bill');

            if(errCust || errOrd || errBook) throw new Error("Lỗi fetch dữ liệu");

            const now = new Date();
            let rawData = {};

            // Initialize customers in map
            customers.forEach(c => {
                rawData[c.customer_id] = {
                    customer_id: c.customer_id,
                    name: `${c.first_name} ${c.last_name}`,
                    phone: c.phone,
                    email: c.email,
                    recent_date: null,
                    frequency: 0,
                    monetary: 0,
                    birth_month: Math.floor(Math.random() * 12) + 1
                };
            });

            // Process Orders
            orders.forEach(o => {
                const c = rawData[o.customer_id];
                if(c) {
                    const d = new Date(o.created_at);
                    if(!c.recent_date || d > c.recent_date) c.recent_date = d;
                    c.frequency += 1;
                    c.monetary += parseFloat(o.total_amount || 0);
                }
            });

            // Process Bookings
            bookings.forEach(b => {
                const c = rawData[b.customer_id];
                if(c) {
                    const d = new Date(b.created_at);
                    if(!c.recent_date || d > c.recent_date) c.recent_date = d;
                    c.frequency += 1;
                    c.monetary += parseFloat(b.total_bill || 0);
                }
            });

            // Calculate Recency in days
            let validCustomers = Object.values(rawData).filter(c => c.frequency > 0);
            validCustomers.forEach(c => {
                const diffTime = Math.abs(now - c.recent_date);
                c.recency = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            });

            // Sort values to find quintiles
            const sortedR = validCustomers.map(c => c.recency).sort((a,b) => a - b);
            const sortedF = validCustomers.map(c => c.frequency).sort((a,b) => a - b);
            const sortedM = validCustomers.map(c => c.monetary).sort((a,b) => a - b);

            // Assign Scores and Segments
            validCustomers.forEach(c => {
                c.R_Score = getQuintileScore(c.recency, sortedR, true); // true for reverse
                c.F_Score = getQuintileScore(c.frequency, sortedF, false);
                c.M_Score = getQuintileScore(c.monetary, sortedM, false);
                c.Segment = assignSegment(c.R_Score, c.F_Score, c.M_Score);
                // Assign to global Monetary variable for charts
                c.Monetary = c.monetary; 
            });

            mergedData = validCustomers;

            updateMetrics();
            renderCharts();
            renderTable();

            showToast("Đã phân tích xong dữ liệu RFM!");

        } catch (error) {
            console.error(error);
            showToast("Có lỗi xảy ra khi tính toán RFM.", true);
        }
    }

    // --- UI RENDER LOGIC ---
    function updateMetrics() {
        document.getElementById('total-customers').innerText = mergedData.length.toLocaleString();
        document.getElementById('champions-count').innerText = mergedData.filter(d => d.Segment === 'Champions').length.toLocaleString();
        document.getElementById('loyal-count').innerText = mergedData.filter(d => d.Segment === 'Loyal').length.toLocaleString();
        document.getElementById('atrisk-count').innerText = mergedData.filter(d => d.Segment === 'At Risk').length.toLocaleString();
    }

    function renderCharts() {
        const segments = ['Champions', 'Loyal', 'Needs Attention', 'At Risk', 'Hibernating'];
        const segmentNames = ['VIP', 'Thân Thiết', 'Tiềm Năng', 'Nguy Cơ', 'Ngủ Đông'];
        const segmentColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
        
        const segmentCounts = segments.map(seg => mergedData.filter(d => d.Segment === seg).length);
        const monetaryBySegment = segments.map(seg => {
            const sum = mergedData.filter(d => d.Segment === seg).reduce((acc, curr) => acc + curr.monetary, 0);
            return (sum / 1000).toFixed(0); // Convert to Thousands for better display
        });

        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = '#6b7280';

        const ctxDoughnut = document.getElementById('rfmDoughnutChart').getContext('2d');
        new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: { labels: segmentNames, datasets: [{ data: segmentCounts, backgroundColor: segmentColors, borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'right' } } }
        });

        const ctxBar = document.getElementById('rfmBarChart').getContext('2d');
        new Chart(ctxBar, {
            type: 'bar',
            data: { labels: segmentNames, datasets: [{ data: monetaryBySegment, backgroundColor: segmentColors, borderRadius: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { border: { display: false } }, x: { grid: { display: false } } } }
        });
    }

    function renderTable() {
        const tbody = document.getElementById('customer-table-body');
        tbody.innerHTML = '';
        
        // 1. Filter by Segment
        let filteredData = mergedData;
        const segmentVal = filterSegment.value;
        if(segmentVal !== 'all') {
            filteredData = filteredData.filter(c => c.Segment === segmentVal);
        }

        // 2. Sort Data
        const sortVal = filterSort.value;
        filteredData.sort((a, b) => {
            if(sortVal === 'monetary_desc') return b.Monetary - a.Monetary;
            if(sortVal === 'frequency_desc') return b.frequency - a.frequency;
            if(sortVal === 'recency_asc') return a.recency - b.recency;
            // default: Sort by total RFM Score roughly
            const scoreA = parseInt(`${a.R_Score}${a.F_Score}${a.M_Score}`);
            const scoreB = parseInt(`${b.R_Score}${b.F_Score}${b.M_Score}`);
            return scoreB - scoreA;
        });
        
        const displayData = filteredData.slice(0, 50);
        document.getElementById('display-count').innerText = displayData.length;
        document.getElementById('total-count').innerText = filteredData.length;

        const badgeClassMap = { 'Champions': 'badge-champions', 'Loyal': 'badge-loyal', 'Needs Attention': 'badge-needs', 'At Risk': 'badge-atrisk', 'Hibernating': 'badge-hibernating' };
        const segmentNameMap = { 'Champions': 'VIP', 'Loyal': 'Thân Thiết', 'Needs Attention': 'Tiềm Năng', 'At Risk': 'Nguy Cơ', 'Hibernating': 'Ngủ Đông' };

        displayData.forEach(cust => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${cust.customer_id}</strong></td>
                <td>
                    <div class="customer-info">
                        <div class="customer-name">${cust.name}</div>
                        <div class="customer-id">${cust.phone || 'No phone'}</div>
                    </div>
                </td>
                <td><span class="badge ${badgeClassMap[cust.Segment]}">${segmentNameMap[cust.Segment]}</span></td>
                <td>R:${cust.R_Score} - F:${cust.F_Score} - M:${cust.M_Score}</td>
                <td>
                    <button class="action-btn" onclick="openEmailModal('${cust.customer_id}')">
                        <i class="fa-solid fa-paper-plane"></i> Gửi Mail
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // --- MODAL LOGIC ---
    window.openEmailModal = function(customerId) {
        currentSelectedCustomer = mergedData.find(c => c.customer_id === customerId);
        if(!currentSelectedCustomer) return;

        modalEmailTo.value = currentSelectedCustomer.email || 'uyen0916@gmail.com'; 

        let template = messageTemplates[currentSelectedCustomer.Segment] || messageTemplates['Champions'];
        template = template.replace('{name}', currentSelectedCustomer.name);
        modalEmailMessage.value = template;

        emailModal.classList.remove('hidden');
        emailModal.classList.add('show');
    };

    window.closeEmailModal = function() {
        emailModal.classList.remove('show');
        setTimeout(() => { emailModal.classList.add('hidden'); }, 300);
        currentSelectedCustomer = null;
    };

    window.confirmSendEmail = async function() {
        const url = webhookInput.value.trim();
        if(!url) { showToast("Vui lòng nhập Webhook URL của n8n!", true); return; }

        const toEmail = modalEmailTo.value.trim();
        const customMessage = modalEmailMessage.value.trim();
        if(!toEmail || !customMessage) {
            showToast("Vui lòng điền đủ email và nội dung", true);
            return;
        }

        const cust = currentSelectedCustomer;
        closeEmailModal();
        showToast(`Đang gửi Email tới ${cust.name}...`);
        
        let formattedMessage = generateEmailHTML(customMessage);

        const payload = {
            "customer_id": cust.customer_id,
            "name": cust.name,
            "new_segment": cust.Segment,
            "to_email": toEmail,
            "subject": subjectTemplates[cust.Segment] || "PawCare",
            "custom_message": formattedMessage,
            "trigger_event": "manual_trigger"
        };

        const success = await sendWebhookPayload(url, payload);
        if(success) {
            showToast(`Gửi Email thành công tới ${cust.name}!`);
        } else {
            showToast("Lỗi khi gửi qua Webhook. Kiểm tra API n8n.", true);
        }
    };

    // --- BULK MODAL LOGIC ---
    window.openBulkModal = function() {
        const currentFilter = document.getElementById('filter-segment').value;
        if(currentFilter === 'all') {
            showToast("Vui lòng chọn 1 phân khúc cụ thể (VD: At Risk) để gửi!", true);
            return;
        }
        bulkSegmentSelect.value = currentFilter;
        bulkModal.classList.remove('hidden');
        bulkModal.classList.add('show');
        updateBulkModalContent();
    };

    window.closeBulkModal = function() {
        bulkModal.classList.remove('show');
        setTimeout(() => { bulkModal.classList.add('hidden'); }, 300);
    };

    function updateBulkModalContent() {
        const seg = bulkSegmentSelect.value;
        const count = mergedData.filter(c => c.Segment === seg).length;
        bulkCount.innerText = count;
        // Don't autofill template if multiple segments are selected, but for bulk it's one segment
        bulkEmailMessage.value = messageTemplates[seg] || '';
    }

    bulkSegmentSelect.addEventListener('change', updateBulkModalContent);

    window.confirmBulkSend = async function() {
        const url = webhookInput.value.trim();
        if(!url) { showToast("Vui lòng nhập Webhook URL của n8n!", true); return; }
        
        const seg = bulkSegmentSelect.value;
        const targetCustomers = mergedData.filter(c => c.Segment === seg);
        const templateMessage = bulkEmailMessage.value.trim();

        if(targetCustomers.length === 0) {
            showToast(`Không có khách hàng nào trong nhóm ${seg}`, true);
            return;
        }
        if(!templateMessage) {
            showToast("Vui lòng nhập nội dung mẫu", true);
            return;
        }

        // Chọn ngẫu nhiên 1 khách hàng trong nhóm để gửi demo (tránh spam)
        const randomCustomer = targetCustomers[Math.floor(Math.random() * targetCustomers.length)];
        const demoCustomers = [randomCustomer];

        closeBulkModal();
        showToast(`Đang gửi 1 email demo cho nhóm ${seg}...`);

        let successCount = 0;
        let failCount = 0;

        for (let cust of demoCustomers) {
            // Ép gửi về email demo để không bị spam lung tung
            cust.email = 'quoclb23416@st.uel.edu.vn';
            cust.name = 'Quốc (Demo)';
            
            const customMessage = templateMessage.replace(/{name}/g, cust.name);
            let formattedMessage = generateEmailHTML(customMessage);

            const payload = {
                "customer_id": cust.customer_id,
                "name": cust.name,
                "new_segment": cust.Segment,
                "to_email": cust.email,
                "subject": subjectTemplates[cust.Segment] || "PawCare",
                "custom_message": formattedMessage,
                "trigger_event": "bulk_trigger"
            };

            const success = await sendWebhookPayload(url, payload);
            if(success) successCount++;
            else failCount++;
        }

        showToast(`Đã gửi thành công 1 email demo cho nhóm ${seg}!`);
    };

    // --- BIRTHDAY LOGIC ---
    window.openBirthdayModal = function() {
        const currentMonth = new Date().getMonth() + 1;
        birthdayMonthSelect.value = currentMonth;
        window.updateBirthdayCount();
        birthdayModal.classList.add('show');
        birthdayModal.classList.remove('hidden');
    };

    window.closeBirthdayModal = function() {
        birthdayModal.classList.remove('show');
        setTimeout(() => { birthdayModal.classList.add('hidden'); }, 300);
    };

    window.updateBirthdayCount = function() {
        const month = parseInt(birthdayMonthSelect.value);
        const count = mergedData.filter(c => c.birth_month === month).length;
        birthdayCount.innerText = count;
    };

    window.confirmBirthdaySend = async function() {
        const url = webhookInput.value.trim();
        if(!url) {
            showToast("Vui lòng nhập Webhook URL", true);
            return;
        }

        const month = parseInt(birthdayMonthSelect.value);
        const templateMessage = birthdayMessage.value.trim();
        const targetCustomers = mergedData.filter(c => c.birth_month === month);

        if(targetCustomers.length === 0) {
            showToast(`Không có khách hàng nào sinh nhật trong Tháng ${month}`, true);
            return;
        }
        if(!templateMessage) {
            showToast("Vui lòng nhập nội dung mẫu", true);
            return;
        }

        // Chọn ngẫu nhiên 1 khách hàng sinh nhật trong tháng để gửi demo
        const randomCustomer = targetCustomers[Math.floor(Math.random() * targetCustomers.length)];
        const demoCustomers = [randomCustomer];

        closeBirthdayModal();
        showToast(`Đang gửi 1 thiệp sinh nhật demo (Tháng ${month})...`);

        let successCount = 0;
        let failCount = 0;

        for (let cust of demoCustomers) {
            // Ép gửi về email demo
            cust.email = 'quoclb23416@st.uel.edu.vn';
            cust.name = 'Quốc (Demo)';
            
            const customMessage = templateMessage.replace(/{name}/g, cust.name);
            let formattedMessage = generateEmailHTML(customMessage);

            const payload = {
                "customer_id": cust.customer_id,
                "name": cust.name,
                "new_segment": cust.Segment,
                "to_email": cust.email,
                "subject": "Chúc mừng Sinh nhật từ PawCare! 🎂",
                "custom_message": formattedMessage,
                "trigger_event": "birthday_trigger"
            };

            const success = await sendWebhookPayload(url, payload);
            if(success) successCount++;
            else failCount++;
        }

        showToast(`Đã gửi thành công 1 thiệp sinh nhật demo cho Tháng ${month}!`);
    };

    // Events for filters
    filterSort.addEventListener('change', renderTable);
    filterSegment.addEventListener('change', renderTable);

    // Run
    initApp();
});
