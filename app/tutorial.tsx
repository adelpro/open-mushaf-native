import SEO from '@/components/seo';
import TutorialGuide from '@/components/TutorialGuide';

export default function TutorialScreen() {
  return (
    <>
      <SEO
        title="تعليمي - المصحف المفتوح"
        description="دليل تعليمي لاستخدام تطبيق المصحف"
      />
      <TutorialGuide />
    </>
  );
}
