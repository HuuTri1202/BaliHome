/* =============================================================================
 * Nội dung trang pháp lý. BẢN NHÁP theo mẫu phổ biến: công ty cần đọc lại / nhờ tư vấn pháp lý trước khi
 * coi là chính thức. Sửa chữ trực tiếp ở đây; mỗi mục là { heading, paragraphs?: string[], items?: string[] }.
 * ========================================================================== */
export const COMPANY_NAME = 'Công ty TNHH Thương mại Dịch vụ Bali Home';
export const LAST_UPDATED = '12/11/2026';

export const LEGAL_PAGES = {
  privacy: {
    path: '/chinh-sach-bao-mat',
    title: 'Chính sách quyền riêng tư',
    intro: `${COMPANY_NAME} ("Bali Home", "chúng tôi") tôn trọng quyền riêng tư của bạn. Chính sách này giải thích chúng tôi thu thập dữ liệu gì khi bạn dùng website, dùng để làm gì và bạn có những quyền gì, phù hợp với Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.`,
    sections: [
      {
        heading: '1. Dữ liệu chúng tôi thu thập',
        items: [
          'Thông tin bạn cung cấp: họ tên, email, số điện thoại, tên công ty, nội dung yêu cầu tư vấn, ngân sách, thời hạn và tệp bạn đính kèm.',
          'Tin nhắn bạn trao đổi với Bali Home trong mục Yêu cầu của tôi.',
          'Khi đăng nhập bằng Google hoặc Facebook: tên, địa chỉ email và mã định danh tài khoản do Google/Facebook cung cấp. Chúng tôi không nhận mật khẩu, danh sách bạn bè hay bài đăng của bạn.',
          'Dữ liệu kỹ thuật để giữ an toàn tài khoản: địa chỉ IP, loại trình duyệt và thời điểm đăng nhập của từng phiên.',
        ],
      },
      {
        heading: '2. Mục đích sử dụng',
        items: [
          'Tạo và quản lý tài khoản, cho phép bạn theo dõi yêu cầu và nhắn tin với đội ngũ Bali Home.',
          'Liên hệ tư vấn, báo giá và thực hiện dịch vụ bạn yêu cầu.',
          'Bảo vệ tài khoản: phát hiện đăng nhập bất thường, chống spam và lạm dụng.',
          'Chúng tôi không bán dữ liệu cá nhân và không dùng dữ liệu của bạn cho quảng cáo của bên thứ ba.',
        ],
      },
      {
        heading: '3. Cookie và lưu trữ trên trình duyệt',
        paragraphs: [
          'Website dùng 2 cookie bắt buộc để giữ phiên đăng nhập (bh_at, bh_rt). Cookie được đánh dấu httpOnly nên mã JavaScript trên trang không đọc được. Lựa chọn giao diện sáng/tối được lưu trong bộ nhớ trình duyệt của bạn. Chúng tôi không dùng cookie quảng cáo.',
        ],
      },
      {
        heading: '4. Bên cung cấp dịch vụ xử lý dữ liệu',
        paragraphs: ['Để vận hành website, dữ liệu được lưu trữ hoặc truyền qua các nhà cung cấp hạ tầng sau, chỉ trong phạm vi cần thiết:'],
        items: [
          'Cloudflare (phân phối website), Render (máy chủ ứng dụng), Neon (cơ sở dữ liệu), Cloudinary (lưu tệp đính kèm).',
          'Google và Meta (Facebook) khi bạn chọn đăng nhập bằng tài khoản của họ.',
        ],
      },
      {
        heading: '5. Thời gian lưu trữ',
        paragraphs: [
          'Dữ liệu tài khoản và yêu cầu được lưu trong thời gian bạn còn sử dụng dịch vụ. Phiên đăng nhập hết hạn sau tối đa 30 ngày. Khi bạn yêu cầu xoá tài khoản, chúng tôi xoá dữ liệu trong vòng 30 ngày, trừ thông tin pháp luật yêu cầu phải lưu (ví dụ chứng từ kế toán).',
        ],
      },
      {
        heading: '6. Quyền của bạn',
        items: [
          'Xem và sửa họ tên, số điện thoại trong mục Hồ sơ.',
          'Đổi mật khẩu, đăng xuất khỏi mọi thiết bị trong mục Bảo mật.',
          'Yêu cầu cung cấp bản sao, hạn chế xử lý hoặc xoá dữ liệu: xem trang Xoá dữ liệu người dùng.',
          'Rút lại quyền đã cấp cho Bali Home trong phần cài đặt ứng dụng của Google hoặc Facebook bất kỳ lúc nào.',
        ],
      },
      {
        heading: '7. Liên hệ',
        paragraphs: ['Mọi câu hỏi về quyền riêng tư, vui lòng liên hệ Bali Home qua các kênh ở cuối trang này.'],
      },
    ],
  },

  terms: {
    path: '/dieu-khoan-su-dung',
    title: 'Điều khoản sử dụng',
    intro: `Khi tạo tài khoản hoặc gửi yêu cầu trên website của ${COMPANY_NAME}, bạn đồng ý với các điều khoản dưới đây.`,
    sections: [
      {
        heading: '1. Tài khoản',
        items: [
          'Bạn cung cấp thông tin chính xác và tự bảo mật mật khẩu của mình.',
          'Bạn chịu trách nhiệm về hoạt động diễn ra trong tài khoản. Nếu nghi ngờ bị truy cập trái phép, hãy đổi mật khẩu ngay và báo cho Bali Home.',
        ],
      },
      {
        heading: '2. Yêu cầu tư vấn và báo giá',
        items: [
          'Yêu cầu gửi qua website chưa phải hợp đồng. Phạm vi, giá và thời hạn chỉ có hiệu lực khi hai bên thống nhất bằng báo giá hoặc hợp đồng riêng.',
          'Tệp bạn đính kèm phải thuộc quyền sử dụng của bạn và không vi phạm pháp luật.',
        ],
      },
      {
        heading: '3. Hành vi không được phép',
        items: [
          'Gửi spam, nội dung vi phạm pháp luật, xúc phạm hoặc mã độc.',
          'Cố truy cập trái phép vào hệ thống hoặc tài khoản của người khác.',
        ],
      },
      {
        heading: '4. Thay đổi điều khoản',
        paragraphs: ['Bali Home có thể cập nhật điều khoản này. Ngày cập nhật được ghi ở đầu trang; thay đổi quan trọng sẽ được thông báo trên website.'],
      },
    ],
  },

  dataDeletion: {
    path: '/xoa-du-lieu',
    title: 'Xoá dữ liệu người dùng',
    intro: 'Bạn có thể yêu cầu Bali Home xoá tài khoản và toàn bộ dữ liệu cá nhân liên quan bất kỳ lúc nào.',
    sections: [
      {
        heading: 'Cách gửi yêu cầu xoá',
        items: [
          'Nhắn Zalo hoặc gọi hotline của Bali Home (ở cuối trang), nêu email đăng ký và ghi rõ "Yêu cầu xoá tài khoản".',
          'Để bảo vệ bạn, chúng tôi xác minh bạn là chủ tài khoản (ví dụ gửi xác nhận tới email đăng ký) trước khi xoá.',
          'Dữ liệu được xoá trong vòng 30 ngày kể từ khi xác minh; chúng tôi báo lại cho bạn khi hoàn tất.',
        ],
      },
      {
        heading: 'Nếu bạn đăng nhập bằng Facebook hoặc Google',
        items: [
          'Facebook: vào Cài đặt → Ứng dụng và trang web → chọn Bali Home → Gỡ. Việc này ngừng chia sẻ dữ liệu mới từ Facebook cho Bali Home.',
          'Google: vào myaccount.google.com → Bảo mật → Kết nối với ứng dụng bên thứ ba → Bali Home → Xoá quyền truy cập.',
          'Gỡ ứng dụng không tự xoá tài khoản Bali Home; hãy gửi yêu cầu xoá như trên nếu bạn muốn xoá hẳn dữ liệu.',
        ],
      },
      {
        heading: 'Dữ liệu được xoá',
        paragraphs: ['Thông tin tài khoản, phiên đăng nhập, liên kết Google/Facebook, yêu cầu tư vấn, tin nhắn và tệp đính kèm. Riêng chứng từ mà pháp luật yêu cầu lưu giữ sẽ được giữ đúng thời hạn luật định.'],
      },
    ],
  },
};
