import { Heart, MapPin, Quote, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giới thiệu | Giảng Dạy Số",
  description: "Giới thiệu về nền tảng tài liệu giáo dục Giảng Dạy Số",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* TASK 1: HERO SECTION */}
      <section className="w-full bg-[#f8fbff]">
        {/* Desktop Layout - Image drives the height */}
        <div className="relative hidden md:block w-full max-w-[1920px] mx-auto overflow-hidden">
          {/* Banner image dictates container height automatically */}
          <img src="/images/about/hero-illustration.png" alt="Giảng Dạy Số Workspace" className="w-full h-auto object-cover object-right" />
          {/* Overlay text absolute on top */}
          <div className="absolute inset-0 max-w-7xl mx-auto px-8 flex items-center">
            {/* Adjusted width to balance single-line text and image overlap */}
            <div className="w-full md:w-[50%] lg:w-[48%] flex flex-col items-start pr-4 lg:pr-8">
              <div className="inline-flex items-center gap-1.5 text-yellow-500 bg-yellow-100/50 rounded-full px-3 py-1 text-[11px] font-bold mb-4 border border-yellow-200/50 uppercase backdrop-blur-sm">
                <MapPin className="w-3.5 h-3.5" />
                GIỚI THIỆU
              </div>
              <h1 className="text-2xl md:text-[32px] font-extrabold text-slate-900 leading-[1.2] mb-4 tracking-tight">
                Giới thiệu về <span className="text-yellow-500">Giảng Dạy Số</span>
              </h1>
              <p className="text-slate-700 text-[13px] leading-relaxed mb-6 bg-white/40 md:bg-transparent p-4 rounded-xl md:p-0 backdrop-blur-md md:backdrop-blur-none text-justify pr-0 lg:pr-20 xl:pr-28">
                Chào mừng Thầy/Cô đến với <span className="font-bold">Giảng Dạy Số</span> - không gian tri thức được xây dựng từ chính sự thấu hiểu và lòng trắc ẩn dành cho những người lái đò thầm lặng.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-slate-700 bg-white/40 md:bg-transparent p-2 rounded-lg md:p-0 backdrop-blur-md md:backdrop-blur-none">Một nền tảng được tạo ra để tiết kiệm thời gian soạn giảng cho Thầy/Cô.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Text on top, image below */}
        <div className="md:hidden w-full flex flex-col items-center pt-8 px-4 overflow-hidden">
          <div className="w-full flex flex-col items-start mb-6">
            <div className="inline-flex items-center gap-1.5 text-yellow-500 bg-yellow-100/50 rounded-full px-3 py-1 text-[11px] font-bold mb-4 border border-yellow-200/50 uppercase">
              <MapPin className="w-3.5 h-3.5" />
              GIỚI THIỆU
            </div>
            <h1 className="text-2xl md:text-[32px] font-extrabold text-slate-900 leading-[1.2] mb-4 tracking-tight">
              Giới thiệu về <span className="text-yellow-500">Giảng Dạy Số</span>
            </h1>
            <p className="text-slate-700 text-[13px] leading-relaxed mb-6 text-justify">
              Chào mừng Thầy/Cô đến với <span className="font-bold">Giảng Dạy Số</span> - không gian tri thức được xây dựng từ chính sự thấu hiểu và lòng trắc ẩn dành cho những người lái đò thầm lặng.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 shadow-sm">
                <Heart className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
              </div>
              <span className="text-[12px] font-bold text-slate-700">Một nền tảng được tạo ra để tiết kiệm thời gian soạn giảng cho Thầy/Cô.</span>
            </div>
          </div>
          <img src="/images/about/hero-illustration.png" alt="Giảng Dạy Số Workspace" className="w-full max-w-[500px] h-auto object-contain" />
        </div>
      </section>

      {/* TASK 2: ORIGIN & VISION */}
      <section className="w-full bg-white pt-2 md:pt-4 pb-10 md:pb-6 px-4 md:px-8 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[50%_1fr] gap-8 lg:gap-8 items-start">
          {/* Left Column */}
          <div className="pr-0 lg:pr-2 flex items-start gap-4">
            <div className="w-12 h-12 bg-[#fff8e6] text-[#f59e0b] rounded-full flex items-center justify-center shadow-sm shrink-0 mt-[-4px]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[16px] font-extrabold text-[#1e3a8a] mb-4 tracking-tight">Vì sao Giảng Dạy Số ra đời?</h2>
              <div className="space-y-4 text-[13px] text-slate-600 leading-relaxed text-justify pr-4 lg:pr-2">
                <p>
                  Là những người làm giáo dục và gắn bó với bục giảng, chúng tôi hiểu sâu sắc rằng nghề giáo chưa bao giờ là một con đường dễ dàng. Phía sau tiết học thăng hoa trên lớp là những đêm thức trắng để gõ từng dòng giáo án, là sự trăn trở trước những đợt đổi mới chương trình liên tục, và là áp lực vô hình khi phải cân bằng giữa chuyên môn, hồ sơ sổ sách và cuộc sống cá nhân.
                </p>
                <p>
                  Chúng ta luôn mong muốn mang đến những bài giảng chất lượng nhất, nhưng quỹ thời gian 24 giờ mỗi ngày dường như không bao giờ là đủ.
                </p>
                <p className="text-orange-500 font-bold">
                  Chính từ những trăn trở đó, nền tảng tài liệu này đã được ấp ủ và ra đời!
                </p>
              </div>
            </div>
          </div>
          {/* Right Column */}
          <div className="relative bg-white rounded-3xl p-5 lg:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-300 border border-blue-50 mt-4 lg:mt-0 flex flex-col items-start overflow-hidden group">
            {/* Background Paper plane image */}
            <div className="absolute top-0 right-0 md:-top-2 md:-right-2 w-48 md:w-64 z-0 opacity-80 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500 pointer-events-none">
              <img src="/images/about/paper-plane.png" alt="Paper Plane" className="w-full h-auto object-contain" />
            </div>

            <Quote className="absolute top-5 left-5 lg:top-6 lg:left-6 w-10 h-10 text-yellow-400 opacity-40 rotate-180 z-0" />
            <div className="relative z-10 w-full">
              <p className="text-[16px] font-bold text-[#1e3a8a] italic mb-4 leading-snug pr-16 ml-12 lg:ml-14 mt-1">
                Chúng tôi không chỉ xây dựng <br className="hidden sm:block" /> một trang web lưu trữ đơn thuần.
              </p>
              <div className="space-y-4 text-[13px] text-slate-600 leading-relaxed">
                <p>
                  Sứ mệnh của <span className="font-bold">Giảng Dạy Số</span> là trở thành một "trợ lý học thuật" đắc lực, một kho tàng tài liệu toàn diện trải dài xuyên suốt 12 khối lớp, giúp Thầy/Cô tối ưu hóa thời gian chuẩn bị bài để có thể thực sự tận hưởng niềm vui của việc giảng dạy.
                </p>
                <p>
                  Thay vì phải lặn lội tìm kiếm, chắt lọc và định dạng lại từ hàng chục nguồn thông tin rải rác trên Internet, Thầy/Cô giờ đây có thể tìm thấy mọi thứ mình cần tại một nơi duy nhất!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TASK 3: CORE VALUES */}
      <section className="w-full bg-[#fffbf0] py-4 md:py-5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-3 md:mb-4">
            <div className="h-[1px] w-12 md:w-24 bg-yellow-300"></div>
            <div className="w-2 h-2 rotate-45 bg-yellow-400"></div>
            <h2 className="text-[16px] font-bold text-[#1e3a8a] text-center px-4 tracking-tight">
              Giá trị cốt lõi mà Giảng Dạy Số cam kết mang lại
            </h2>
            <div className="w-2 h-2 rotate-45 bg-yellow-400"></div>
            <div className="h-[1px] w-12 md:w-24 bg-yellow-300"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-2.5 lg:p-3 border border-yellow-400 flex gap-3 items-center min-w-0">
              <img src="/images/about/icon-quality.png" alt="Chất lượng" className="w-12 h-12 md:w-16 md:h-16 shrink-0 object-contain ml-[-4px]" />
              <div className="flex flex-col min-w-0">
                <h3 className="font-bold text-[13px] text-slate-800 mb-1.5 leading-snug">
                  Tài liệu chất lượng cao
                  <span className="inline-block bg-green-100/80 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ml-2 align-middle -mt-0.5">ĐÃ KIỂM DUYỆT</span>
                </h3>
                <p className="text-slate-500 text-[10px] leading-[1.6]">
                  Toàn bộ hệ thống tài liệu, từ giáo án, đề thi đến bài giảng điện tử đều được đội ngũ chuyên môn kiểm duyệt kỹ lưỡng, đảm bảo bám sát định hướng và cấu trúc của chương trình giáo dục hiện hành.
                </p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-2.5 lg:p-3 border border-yellow-400 flex gap-3 items-center min-w-0">
              <img src="/images/about/icon-flexible.png" alt="Linh hoạt" className="w-12 h-12 md:w-16 md:h-16 shrink-0 object-contain ml-[-4px]" />
              <div className="flex flex-col min-w-0">
                <h3 className="font-bold text-[13px] text-slate-800 mb-1.5 leading-snug">
                  Tính tiện lợi, linh hoạt
                  <span className="inline-block bg-green-100/80 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ml-2 align-middle -mt-0.5">DỄ CHỈNH SỬA</span>
                </h3>
                <p className="text-slate-500 text-[10px] leading-[1.6]">
                  Chúng tôi hiểu mỗi lớp học, mỗi học sinh đều có một đặc thù riêng. Vì vậy, các tài liệu được cung cấp dưới định dạng chuẩn (Word, PowerPoint) giúp Thầy/Cô dễ dàng chỉnh sửa, cá nhân hoá.
                </p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-2.5 lg:p-3 border border-yellow-400 flex gap-3 items-center min-w-0">
              <img src="/images/about/icon-speed.png" alt="Tốc độ" className="w-12 h-12 md:w-16 md:h-16 shrink-0 object-contain ml-[-4px]" />
              <div className="flex flex-col min-w-0">
                <h3 className="font-bold text-[13px] text-slate-800 mb-1.5 leading-snug">
                  Trải nghiệm tức thì
                  <span className="inline-block bg-green-100/80 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ml-2 align-middle -mt-0.5">THANH TOÁN TỰ ĐỘNG</span>
                </h3>
                <p className="text-slate-500 text-[10px] leading-[1.6]">
                  Với luồng thanh toán hiện đại và tự động hoá, Thầy/Cô có thể sở hữu ngay bộ tài liệu mình cần chỉ sau vài phút thao tác, bất kể ngày hay đêm. Không thủ tục rườm rà, không chờ đợi xác nhận!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TASK 4: MISSION & THANK YOU BANNER */}
      <section className="w-full bg-gradient-to-b from-blue-50/40 to-white pb-20 pt-0">

        {/* Mission Full-Width Wrapper */}
        <div className="relative w-full overflow-hidden mb-2 py-6 md:py-12">
          <div className="absolute inset-0 w-full h-full hidden md:block">
            <img src="/images/about/mission-illustration.png" alt="Mission" className="w-full h-full object-cover lg:object-contain object-left" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-8 flex items-center justify-end">
            <div className="hidden md:block w-[55%] lg:w-[52%] lg:pr-10">
              <h2 className="text-[16px] font-extrabold text-[#1e3a8a] mb-4 tracking-tight">Sứ mệnh của chúng tôi</h2>
              <div className="space-y-4 text-[13px] text-slate-700 leading-[1.7] text-justify">
                <p>
                  <span className="font-bold">Giảng Dạy Số</span> giúp giảm bớt gánh nặng soạn bài để Thầy/Cô có thêm thời gian dành cho điều quan trọng hơn: truyền cảm hứng trên bục giảng. Chúng tôi tin rằng khi thời gian soạn bài được giảm bớt, sự sáng tạo trong những tiết dạy sẽ ngày càng được tỏa sáng.
                </p>
              </div>
            </div>

            {/* Mobile view */}
            <div className="md:hidden w-full flex flex-col">
              <img src="/images/about/mission-illustration.png" alt="Mission" className="w-full h-auto mb-6 relative z-10" />
              <div className="relative z-10 px-2">
                <h2 className="text-[16px] font-extrabold text-[#1e3a8a] mb-4 tracking-tight">Sứ mệnh của chúng tôi</h2>
                <div className="space-y-4 text-[13px] text-slate-700 leading-[1.7] text-justify">
                  <p>
                    <span className="font-bold">Giảng Dạy Số</span> mong muốn giảm bớt gánh nặng soạn bài, để Thầy/Cô có thêm thời gian dành cho điều quan trọng hơn: truyền cảm hứng trên bục giảng. Chúng tôi tin rằng khi thời gian soạn giảng được giảm bớt, sự sáng tạo trên bục giảng sẽ ngày càng được tỏa sáng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">

          {/* Thank You Banner */}
          <div className="bg-[#fffdf8] rounded-2xl p-3 md:py-4 md:px-5 border border-yellow-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-200 via-orange-300 to-yellow-200"></div>
            <div className="text-left space-y-2">
              <p className="text-[16px] text-slate-800 font-bold">
                Xin cảm ơn Thầy/Cô đã tin tưởng lựa chọn chúng tôi làm người bạn đồng hành. Chúc Thầy/Cô luôn dồi dào sức khỏe, giữ mãi ngọn lửa nhiệt huyết và gặt hái được nhiều thành công trên sự nghiệp trồng người cao quý!
              </p>
              <div className="text-[16px] text-slate-800 font-bold leading-relaxed pt-2">
                <p>Trân trọng,</p>
                <p className="text-orange-500">Đội ngũ phát triển Giảng Dạy Số.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
