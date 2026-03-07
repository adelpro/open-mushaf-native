import { Seo, TutorialGuide } from '@/components';

export default function TutorialScreen() {
  return (
    <>
      <Seo
        title="تعليمي - المصحف المفتوح"
        description="دليل تعليمي لاستخدام تطبيق المصحف"
      />
      <TutorialGuide />
    </>
  );
}
