export type DummyProduct = {
  id: string;
  name: string;
  category: string | null;
  grade?: number | null;
  price: number;
  image_url: string | null;
  preview_url?: string | null;
  view_count?: number | null;
  download_count?: number | null;
  description?: string | null;
  is_dynamic?: boolean;
  access_link?: string;
};

export const dummyProducts: DummyProduct[] = [
  {
    id: "dummy-1",
    name: "Bộ đề ôn tập Toán lớp 6 theo từng chuyên đề",
    category: "Toán",
    grade: 6,
    price: 79000,
    image_url: "https://placehold.co/800x600/e2e8f0/334155?text=Toan+6",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-01/view",
    view_count: 1240,
    download_count: 342,
    description:
      "Tài liệu gồm các đề ôn tập được chia theo từng chuyên đề bám sát chương trình Toán lớp 6.\n\nNội dung chính:\n- Số học: phân số, phép tính, tính chất cơ bản\n- Đại lượng và đo đại lượng\n- Hình học: điểm, đường thẳng, tia, đoạn thẳng; góc cơ bản\n- Thu thập và xử lý dữ liệu\n\nGợi ý sử dụng:\n- Dùng cho ôn tập trên lớp hoặc giao bài về nhà\n- Có thể chia thành nhiều buổi kiểm tra 15 phút/tiết ôn tập.\n\nPhần cuối có ma trận nội dung và đáp án gợi ý để giáo viên dễ đối chiếu.",
    is_dynamic: true,
    access_link: "https://drive.google.com/drive/folders/1-demo-season-pass-01",
  },
  {
    id: "dummy-2",
    name: "Tài liệu Toán lớp 12: Hàm số và ứng dụng",
    category: "Toán",
    grade: 12,
    price: 99000,
    image_url: "https://placehold.co/800x600/dbeafe/1e3a8a?text=Toan+12",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-02/view",
    view_count: 3920,
    download_count: 1118,
    description:
      "Hướng dẫn hệ thống kiến thức trọng tâm Toán lớp 12 phần Hàm số, gồm lý thuyết chọn lọc và bài tập ứng dụng.\n\nCác chuyên đề:\n- Khảo sát hàm số bậc hai, bậc ba đơn giản\n- Tính đơn điệu, cực trị và ứng dụng\n- Đồ thị và bài toán thực tiễn\n- Bài tập trắc nghiệm theo mức độ\n\nTài liệu giúp học sinh:\n- Nắm phương pháp giải nhanh\n- Rèn kỹ năng phân tích đề và biến đổi biểu thức\n- Luyện tập dạng ra đề thường gặp trong kiểm tra/thi.\n\nĐặc biệt có phần tổng hợp công thức + checklist kỹ năng để tự ôn theo tuần.",
  },
  {
    id: "dummy-3",
    name: "Ngữ văn lớp 8: Văn bản nhật dụng",
    category: "Văn",
    grade: 8,
    price: 69000,
    image_url: "https://placehold.co/800x600/dbeafe/1e3a8a?text=Ngu+Van",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-03/view",
    view_count: 1585,
    download_count: 476,
    description:
      "Tài liệu Ngữ văn lớp 8 tổng hợp hệ thống bài học về Văn bản nhật dụng.\n\nGồm:\n- Phần tóm tắt nội dung từng văn bản\n- Dàn ý chi tiết cho bài viết theo dạng nghị luận\n- Gợi ý trả lời câu hỏi đọc hiểu (theo từng cấp độ)\n- Bộ câu hỏi luyện tập củng cố\n\nGiáo viên có thể dùng:\n- Làm tư liệu soạn giảng\n- Tổ chức hoạt động nhóm và thảo luận trên lớp\n- Giao bài về nhà theo tiến độ học.\n\nKèm bài tập mở rộng để tăng hứng thú và phát triển năng lực cảm thụ văn học.",
  },
  {
    id: "dummy-4",
    name: "Ngữ văn lớp 12: Nghị luận xã hội và văn học",
    category: "Văn",
    grade: 12,
    price: 86000,
    image_url: "https://placehold.co/800x600/ede9fe/4c1d95?text=Van+12",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-04/view",
    view_count: 3012,
    download_count: 932,
    description:
      "Tài liệu bám sát dạng đề nghị luận xã hội và nghị luận văn học thường gặp.\n\nNội dung:\n- Hướng dẫn cấu trúc bài viết (mở bài – thân bài – kết bài)\n- Quy trình lập luận: giải thích – phân tích – chứng minh – bình luận\n- Bộ dàn ý mẫu theo chủ đề\n- Tuyển tập câu hỏi vận dụng và gợi ý trả lời\n\nDành cho học sinh:\n- Luyện viết theo thời gian quy định\n- Nâng chất lượng lập luận và dẫn chứng\n- Hình thành kỹ năng nhận diện đề, chọn luận điểm và triển khai mạch lạc.\n\nTài liệu có phần bảng tiêu chí đánh giá để tự chấm và cải thiện bài viết.",
  },
  {
    id: "dummy-5",
    name: "Tổng hợp 500 câu trắc nghiệm Tiếng Anh lớp 10",
    category: "Tiếng Anh",
    grade: 10,
    price: 89000,
    image_url: "https://placehold.co/800x600/e0f2fe/0f172a?text=English",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-05/view",
    view_count: 4480,
    download_count: 1256,
    description:
      "Bộ câu hỏi trắc nghiệm chọn lọc nhằm ôn tập Tiếng Anh lớp 10 theo từng kỹ năng và mảng kiến thức.\n\nBộ gồm:\n- Ngữ pháp trọng tâm: thì, câu bị động, mệnh đề quan hệ, mạo từ\n- Từ vựng theo chủ đề\n- Reading hiểu nhanh: dạng câu hỏi thường gặp\n- Cụm bài mini-test theo mức độ\n\nCách dùng gợi ý:\n- Luyện theo bộ 30–50 câu/phiên để đảm bảo tập trung\n- Tự chấm đáp án và ghi chú lỗi sai\n- Ôn lại từ những phần còn yếu trước mỗi bài kiểm tra.\n\nCó đáp án và giải thích ngắn để học sinh dễ hiểu và tự sửa lỗi.",
  },
  {
    id: "dummy-6",
    name: "Tiếng Anh lớp 7: Ngữ pháp và bài tập tự luyện",
    category: "Tiếng Anh",
    grade: 7,
    price: 65000,
    image_url: "https://placehold.co/800x600/cffafe/155e75?text=English+7",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-06/view",
    view_count: 980,
    download_count: 267,
    description:
      "Tài liệu tự luyện Tiếng Anh lớp 7 với trọng tâm ngữ pháp dễ hiểu – bài tập từ cơ bản đến nâng cao.\n\nGồm:\n- Tóm tắt kiến thức theo dạng bảng\n- Bài tập trắc nghiệm + tự luận\n- Bài tập theo tình huống (communication)\n- Phần sửa lỗi phổ biến của học sinh\n\nPhù hợp:\n- Ôn tập học kỳ\n- Bồi dưỡng học sinh khá – giỏi\n- Phụ huynh hỗ trợ con tự học.\n\nTài liệu trình bày rõ ràng giúp học sinh theo dõi tiến bộ theo từng chủ đề.",
  },
  {
    id: "dummy-7",
    name: "Vật lý lớp 11: Điện học có giải chi tiết",
    category: "Khoa Hoc Tu Nhien",
    grade: 11,
    price: 85000,
    image_url: "https://placehold.co/800x600/ecfccb/365314?text=Vat+Ly",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-07/view",
    view_count: 2650,
    download_count: 688,
    description:
      "Tài liệu Vật lý lớp 11 phần Điện học tổng hợp công thức và bài tập kèm hướng dẫn giải chi tiết.\n\nNội dung chính:\n- Dòng điện – hiệu điện thế\n- Định luật Ôm\n- Ghép điện trở và mạch điện đơn giản\n- Công suất điện và ứng dụng\n\nĐiểm nổi bật:\n- Mỗi dạng bài có ví dụ mẫu\n- Giải thích từng bước để học sinh nắm chắc cách làm\n- Có phần câu hỏi kiểm tra mức độ hiểu bài sau mỗi cụm.\n\nTài liệu phù hợp cho luyện tập trước các bài kiểm tra 1 tiết/ học kỳ.",
  },
  {
    id: "dummy-8",
    name: "Hóa học lớp 9: Chu đề phân ừng – phản ứng hóa học",
    category: "Khoa Hoc Tu Nhien",
    grade: 9,
    price: 73000,
    image_url: "https://placehold.co/800x600/fef9c3/854d0e?text=Hoa+9",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-08/view",
    view_count: 1710,
    download_count: 491,
    description:
      "Tài liệu Hóa học lớp 9 theo dạng chủ đề giúp học sinh hệ thống kiến thức và luyện bài tập có chọn lọc.\n\nGồm:\n- Tóm tắt lý thuyết theo sơ đồ tư duy\n- Bài tập vận dụng phân loại\n- Dạng bài tính theo phương trình hóa học\n- Câu hỏi trắc nghiệm kiểm tra nhanh\n\nHướng dẫn:\n- Đọc mục tiêu bài học trước khi làm bài\n- Luyện theo thứ tự: dễ -> trung bình -> khó\n- Sau mỗi phần có câu hỏi tự đánh giá.\n\nKèm đáp án và hướng dẫn giải để giáo viên và học sinh đối chiếu nhanh.",
  },
  {
    id: "dummy-9",
    name: "Sinh học lớp 10: Sơ đồ tư duy và bài tập tự luyện",
    category: "Khoa Hoc Tu Nhien",
    grade: 10,
    price: 64000,
    image_url: "https://placehold.co/800x600/dcfce7/14532d?text=Sinh+Hoc",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-09/view",
    view_count: 2290,
    download_count: 573,
    description:
      "Tài liệu Sinh học lớp 10 kết hợp sơ đồ tư duy và hệ thống bài tập tự luyện.\n\nNội dung:\n- Sơ đồ hóa kiến thức theo từng chương\n- Bài tập trắc nghiệm kiểm tra nhanh\n- Bài tập tự luận giúp rèn kỹ năng diễn giải\n- Gợi ý phương pháp ghi nhớ và ôn tập theo tuần\n\nLợi ích:\n- Giúp học sinh nhớ lâu và hiểu bản chất\n- Luyện tư duy theo sơ đồ thay vì học thuộc máy móc\n- Có thể sử dụng như tài liệu ôn trước kiểm tra.\n\nCó phần ghi chú để giáo viên tùy chỉnh theo tiến độ lớp.",
  },
  {
    id: "dummy-10",
    name: "Lịch sử Việt Nam lớp 6: Bài học cơ bản",
    category: "Lich Su",
    grade: 6,
    price: 59000,
    image_url: "https://placehold.co/800x600/fef3c7/78350f?text=Lich+Su",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-10/view",
    view_count: 860,
    download_count: 233,
    description:
      "Tài liệu Lịch sử Việt Nam lớp 6 chọn lọc nội dung trọng tâm và hướng dẫn học theo từng bài.\n\nGồm:\n- Tóm tắt bài học\n- Câu hỏi đọc hiểu – tìm ý\n- Dàn ý gợi ý cho hoạt động viết đoạn văn\n- Bộ câu hỏi luyện tập theo dạng kiểm tra trên lớp\n\nPhù hợp cho:\n- Ôn tập cuối tuần\n- Chuẩn bị cho bài kiểm tra định kỳ\n- Hoạt động trải nghiệm, thuyết trình nhóm.\n\nTài liệu được trình bày dễ đọc, có khoảng trống để học sinh ghi chú.",
  },
  {
    id: "dummy-11",
    name: "Lịch sử Việt Nam lớp 11: Giai đoạn hiện đại",
    category: "Lich Su",
    grade: 11,
    price: 76000,
    image_url: "https://placehold.co/800x600/fef3c7/78350f?text=Su+11",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-11/view",
    view_count: 2140,
    download_count: 620,
    description:
      "Tài liệu Lịch sử Việt Nam lớp 11 giúp hệ thống kiến thức giai đoạn hiện đại theo mạch thời gian.\n\nNội dung:\n- Tổng hợp sự kiện trọng điểm\n- Nhấn mạnh nguyên nhân – diễn biến – kết quả\n- Gợi ý câu hỏi thảo luận\n- Bài tập luyện dạng đề tự luận\n\nGiáo viên có thể dùng:\n- Làm tài liệu soạn giảng\n- Tổ chức học sinh làm dự án nhỏ\n- Giao bài tập phân hóa theo mức độ.\n\nKèm đáp án/ gợi ý trả lời để kiểm tra nhanh và đánh giá tiến bộ học sinh.",
  },
  {
    id: "dummy-12",
    name: "Địa lý lớp 9: Kỹ năng về biểu đồ",
    category: "Dia Ly",
    grade: 9,
    price: 67000,
    image_url: "https://placehold.co/800x600/fae8ff/701a75?text=Dia+Ly+9",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-12/view",
    view_count: 1320,
    download_count: 389,
    description:
      "Tài liệu Địa lý lớp 9 tập trung vào kỹ năng đọc – vẽ – nhận xét biểu đồ.\n\nGồm:\n- Hướng dẫn chọn loại biểu đồ phù hợp\n- Quy trình vẽ từng bước\n- Mẫu nhận xét theo cấu trúc\n- Bài tập luyện theo bộ câu hỏi thường gặp\n\nĐặc biệt có phần checklist để học sinh tự soát lỗi khi vẽ.\n\nTài liệu phù hợp ôn thi và luyện năng lực biểu đồ trong kiểm tra.",
  },
  {
    id: "dummy-13",
    name: "Địa lý lớp 12: Atlat và xử lý số liệu",
    category: "Dia Ly",
    grade: 12,
    price: 72000,
    image_url: "https://placehold.co/800x600/fae8ff/701a75?text=Dia+Ly+12",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-13/view",
    view_count: 2870,
    download_count: 801,
    description:
      "Tài liệu Địa lý lớp 12 giúp học sinh khai thác Atlat và xử lý số liệu để viết nhận xét có luận cứ.\n\nNội dung:\n- Hướng dẫn sử dụng Atlat\n- Quy trình khai thác bản đồ chuyên đề\n- Cách đọc bảng số liệu và rút ra nhận xét\n- Bài tập thực hành theo từng dạng\n\nGợi ý dùng:\n- Luyện theo nhóm dữ liệu (xu hướng – so sánh – kết luận)\n- Ôn tập trước các kỳ kiểm tra.\n\nCó phần ví dụ mẫu để học sinh học theo và tự áp dụng.",
  },
  {
    id: "dummy-14",
    name: "Giáo án KHTN lớp 8: Theo từng chủ đề",
    category: "Giao An",
    grade: 8,
    price: 119000,
    image_url: "https://placehold.co/800x600/fee2e2/7f1d1d?text=Giao+An+8",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-14/view",
    view_count: 1950,
    download_count: 542,
    description:
      "Bộ giáo án KHTN lớp 8 được thiết kế theo từng chủ đề, đảm bảo cấu trúc và tiến trình dạy học rõ ràng.\n\nMỗi bài gồm:\n- Mục tiêu cần đạt\n- Thiết bị/học liệu sử dụng\n- Hoạt động khởi động – hình thành kiến thức – luyện tập – vận dụng\n- Gợi ý đánh giá và bài tập bổ sung\n\nPhù hợp cho:\n- Giáo viên chuẩn bị bài nhanh\n- Dạy học theo định hướng phát triển năng lực\n\nTài liệu trình bày dễ chỉnh sửa, giúp thầy cô tùy biến cho phù hợp lớp học.",
  },
  {
    id: "dummy-15",
    name: "Giáo án PowerPoint Toán lớp 10: Trọn bộ theo tuần",
    category: "Giao An",
    grade: 10,
    price: 129000,
    image_url: "https://placehold.co/800x600/fee2e2/7f1d1d?text=Giao+An+10",
    preview_url: "https://drive.google.com/file/d/1-demo-preview-15/view",
    view_count: 3340,
    download_count: 974,
    description:
      "Trọn bộ giáo án PowerPoint theo tuần dành cho Toán lớp 10.\n\nNội dung:\n- Slide tóm tắt lý thuyết\n- Bài tập ví dụ minh họa từng dạng\n- Phiếu luyện tập ngắn cuối tiết\n- Hướng dẫn hoạt động nhóm\n\nGiúp giáo viên:\n- Dạy nhanh, rõ ràng, đồng bộ nội dung\n- Tăng trực quan cho học sinh\n- Tiết kiệm thời gian soạn bài\n\nTài liệu có thể tùy chỉnh bố cục và đổi nội dung minh họa phù hợp với từng lớp.",
  },
];

