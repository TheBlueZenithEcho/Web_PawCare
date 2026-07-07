const fs = require('fs');

const sqlContent = fs.readFileSync('d:/WEB_Staff-develop/schema_and_seed.sql', 'utf8');

const mdContent = `
Đây là tập lệnh SQL đầy đủ bao gồm DDL (tạo 29 bảng theo thiết kế ERD của bạn) và DML (seed toàn bộ dữ liệu mẫu hiện có).

## Hướng dẫn sử dụng
1. Mở **Supabase SQL Editor**: [https://supabase.com/dashboard/project/fkizlhcipjikyajibtzx/sql/new](https://supabase.com/dashboard/project/fkizlhcipjikyajibtzx/sql/new)
2. Copy toàn bộ đoạn mã SQL bên dưới và Paste vào khung Editor.
3. Nhấn nút **Run** để khởi tạo DB và chèn dữ liệu.

\`\`\`sql
${sqlContent}
\`\`\`
`;

fs.writeFileSync('C:/Users/ASUS/.gemini/antigravity-ide/brain/dd35a8d1-c36c-4ced-901d-f2efe7f0c99b/supabase_seed.md', mdContent, 'utf8');
console.log('Artifact updated.');
