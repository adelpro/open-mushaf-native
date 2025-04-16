export const SLIDES = [
  {
    title: 'مرحبا!',
    description: 'مرحبا بك في تطبيق المصحف',
    image: require('@/assets/images/icon-large.png'),
  },
  {
    title: 'المصحف',
    description: `يمكنك التنقل بين الصفحات عن طريق السحب نحو اليمين أو نحو اليسار`,
    image: require('@/assets/tutorial/mushaf.png'),
  },
  {
    title: 'القائمة العلوية',
    description: [
      {
        text: 'تعرض القائمة العلوية معلومات الصفحة الحالية مثل اسم السورة، رقم الجزء، وموضع الثمن في الجزء.',
        align: 'center',
      },
      {
        text: 'يمكنك تتبع تقدم وردك اليومي من خلال مؤشر التقدم الدائري.',
        align: 'start',
      },
      {
        text: 'أيقونة التنقل: تتيح لك الانتقال السريع إلى صفحة أو آية معينة.',
        align: 'start',
      },
      {
        text: 'أيقونة البحث: تتيح لك البحث في نص القرآن الكريم.',
        align: 'start',
      },
      {
        text: 'أيقونة ملء الشاشة: تقوم بإظهار أو إخفاء القائمة السفلية لعرض الصفحة بشكل كامل.',
        align: 'start',
      },
    ],
    image: require('@/assets/tutorial/top-menu.png'),
  },
  {
    title: 'قائمة التفسير',
    description: `يمكنك إظهار قائمة التفسير بالضغط مطولا على صفحة المصحف، تحتوي القائمة على خيارات عديدة للتفسير `,
    image: require('@/assets/tutorial/tafseer.png'),
  },
  {
    title: 'صفحة البحث',
    description: [
      {
        text: 'يمكنك الوصول إلى صفحة البحث من القائمة العلوية في المصحف، وتتيح لك البحث في نص القرآن الكريم.',
        align: 'center',
      },
      {
        text: 'البحث البسيط: يعرض نتائج مطابقة للنص المدخل مباشرة.',
        align: 'start',
      },
      {
        text: 'خاصية البحث المتقدم: يمكن تفعيلها بالضغط على أيقونة البحث، وتوفر خيارات بحث أكثر دقة.',
        align: 'start',
      },
    ],
    image: require('@/assets/tutorial/search.png'),
  },
  {
    title: 'صفحة التنقل',
    description:
      'يمكنك الوصول إلى صفحة التنقل من القائمة العلوية في المصحف، وتتيح لك التنقل بسلاسة في المصحف الكريم.',
    image: require('@/assets/tutorial/navigation.png'),
  },
];
