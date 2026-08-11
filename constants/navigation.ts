export type NavigationLink = {
  key: string;
  label: string;
  href: string;
};

export type NavigationDropdown = {
  key: string;
  label: string;
  items: NavigationLink[];
};

export type NavigationMegaMenuColumn = {
  key: string;
  heading: string;
  items: NavigationLink[];
};

export type NavigationMegaMenu = {
  key: string;
  label: string;
  columns: [NavigationMegaMenuColumn, NavigationMegaMenuColumn];
};

export type HeaderNavigationModel = {
  primary: Array<NavigationLink | NavigationDropdown | NavigationMegaMenu>;
};

export const headerNavigationFallback: HeaderNavigationModel = {
  primary: [
    {
      key: 'tai-lieu-theo-mon',
      label: 'TÀI LIỆU THEO MÔN',
      columns: [
        {
          key: 'khoa-hoc-tu-nhien',
          heading: 'KHOA HỌC TỰ NHIÊN',
          items: [
            { key: 'tai-lieu-toan-hoc', label: 'Tài liệu Toán học', href: '/danh-muc/tai-lieu-toan-hoc' },
            { key: 'tai-lieu-vat-ly', label: 'Tài liệu Vật lý', href: '/danh-muc/tai-lieu-vat-ly' },
            { key: 'tai-lieu-hoa-hoc', label: 'Tài liệu Hóa học', href: '/danh-muc/tai-lieu-hoa-hoc' },
            { key: 'tai-lieu-sinh-hoc', label: 'Tài liệu Sinh học', href: '/danh-muc/tai-lieu-sinh-hoc' },
            { key: 'tai-lieu-khtn', label: 'Tài liệu KHTN', href: '/danh-muc/tai-lieu-khtn' },
          ],
        },
        {
          key: 'khoa-hoc-xa-hoi',
          heading: 'KHOA HỌC XÃ HỘI',
          items: [
            { key: 'tai-lieu-tieng-anh', label: 'Tài liệu Tiếng Anh', href: '/danh-muc/tai-lieu-tieng-anh' },
            { key: 'tai-lieu-ngu-van', label: 'Tài liệu Ngữ văn', href: '/danh-muc/tai-lieu-ngu-van' },
            { key: 'tai-lieu-lich-su', label: 'Tài liệu Lịch sử', href: '/danh-muc/tai-lieu-lich-su' },
            { key: 'tai-lieu-dia-ly', label: 'Tài liệu Địa lý', href: '/danh-muc/tai-lieu-dia-ly' },
            { key: 'tai-lieu-gdktpl', label: 'Tài liệu GD KT&PL', href: '/danh-muc/tai-lieu-gdktpl' },
          ],
        },
      ],
    },
    {
      key: 'de-thi-thu-tn-thptqg',
      label: 'ĐỀ THI THỬ TN THPTQG',
      items: [
        { key: 'toan-hoc', label: 'Toán Học', href: '/danh-muc/toan-hoc' },
        { key: 'vat-ly', label: 'Vật Lý', href: '/danh-muc/vat-ly' },
        { key: 'hoa-hoc', label: 'Hóa Học', href: '/danh-muc/hoa-hoc' },
        { key: 'sinh-hoc', label: 'Sinh Học', href: '/danh-muc/sinh-hoc' },
        { key: 'tieng-anh', label: 'Tiếng Anh', href: '/danh-muc/tieng-anh' },
        { key: 'ngu-van', label: 'Ngữ Văn', href: '/danh-muc/ngu-van' },
        { key: 'lich-su', label: 'Lịch Sử', href: '/danh-muc/lich-su' },
        { key: 'dia-ly', label: 'Địa Lý', href: '/danh-muc/dia-ly' },
        { key: 'gdktpl', label: 'GD Kinh tế & Pháp luật', href: '/danh-muc/gdktpl' },
      ],
    },
    {
      key: 'danh-gia-nang-luc-tu-duy',
      label: 'ĐÁNH GIÁ NĂNG LỰC & TƯ DUY',
      items: [
        { key: 'dgnl-dhqg-ha-noi', label: 'ĐGNL ĐHQG Hà Nội HSA', href: '/danh-muc/dgnl-dhqg-ha-noi' },
        { key: 'dgnl-dhqg-tphcm', label: 'ĐGNL ĐHQG TP.HCM V-ACT', href: '/danh-muc/dgnl-dhqg-tphcm' },
        { key: 'dgtd-dhbk-ha-noi', label: 'ĐGTD ĐH Bách khoa Hà Nội TSA', href: '/danh-muc/dgtd-dhbk-ha-noi' },
        { key: 'dgnl-dhsp-ha-noi', label: 'ĐGNL ĐH Sư phạm Hà Nội SPT', href: '/danh-muc/dgnl-dhsp-ha-noi' },
      ],
    },
    { key: 'de-luyen-thi-vao-10', label: 'ĐỀ LUYỆN THI VÀO 10', href: '/de-luyen-thi-vao-10' },
    { key: 'giao-an-cv5512-sgk-moi', label: 'GIÁO ÁN CV5512 SGK MỚI', href: '/giao-an-cv5512-sgk-moi' },
    { key: 'huong-dan-mua', label: 'HƯỚNG DẪN MUA', href: '/huong-dan-mua' },
    { key: 'gioi-thieu', label: 'GIỚI THIỆU', href: '/gioi-thieu' },
  ],
};
