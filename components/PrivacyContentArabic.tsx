import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { ExternalLink } from './ExternalLink';

export default function PrivacyContentArabicNew() {
  return (
    <ThemedView style={[styles.container]}>
      <ThemedText style={[styles.title, styles.arabicText]}>
        سياسة خصوصية Open Mushaf
      </ThemedText>
      <ThemedText style={[styles.content, styles.arabicText]}>
        تاريخ السريان: 26 سبتمبر 2024
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.arabicText]}>
        خصوصيتك مهمة بالنسبة لنا
      </ThemedText>
      <ThemedText style={[styles.content, styles.arabicText]}>
        في Open Mushaf، نأخذ خصوصيتك على محمل الجد. تشرح هذه السياسة نهجنا في
        الخصوصية وجمع البيانات في التطبيق.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.arabicText]}>
        ما المعلومات التي نجمعها؟
      </ThemedText>
      <ThemedText style={[styles.content, styles.arabicText]}>
        لا تجمع أي معلومات شخصية أو أي بيانات أخرى من المستخدمين. يعمل التطبيق
        بالكامل في وضع عدم الاتصال، ولا يتم نقل أي بيانات من جهازك.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.arabicText]}>
        لماذا لا نجمع البيانات؟
      </ThemedText>
      <ThemedText style={[styles.content, styles.arabicText]}>
        هدفنا الرئيسي هو توفير تجربة سلسة وغير متصلة بالإنترنت للمستخدمين. نظرًا
        لأن التطبيق يعمل في وضع عدم الاتصال، فلا حاجة لجمع أي بيانات لأغراض
        التحليلات أو مراقبة الأداء أو أي غرض آخر.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.arabicText]}>
        نحن نحترم خصوصية أطفالك
      </ThemedText>
      <ThemedText style={[styles.content, styles.arabicText]}>
        تم تصميم Open Mushaf للأطفال الذين تتراوح أعمارهم بين 6 سنوات وما فوق
        والذين يمكنهم قراءة العربية. نحن ملتزمون بحماية خصوصية الأطفال. نظرًا
        لأن تطبيقنا لا يجمع أي بيانات، فإن معلومات الأطفال آمنة تمامًا.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.arabicText]}>
        الحفاظ على أمان بياناتك
      </ThemedText>
      <ThemedText style={[styles.content, styles.arabicText]}>
        نظرًا لأننا لا نجمع أي بيانات، فلا توجد معلومات شخصية لحمايتها. ومع ذلك،
        نواصل إعطاء الأولوية لأمان التطبيق لضمان تجربة مستخدم آمنة من خلال
        مراقبة التطبيق بانتظام للكشف عن أي ثغرات محتملة.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.arabicText]}>
        نحن لا نشارك بياناتك
      </ThemedText>
      <ThemedText style={[styles.content, styles.arabicText]}>
        نظرًا لأن Open Mushaf لا تجمع أي بيانات، فلا يوجد شيء لمشاركته مع أطراف
        ثالثة. خصوصيتك محمية بالكامل.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.arabicText]}>
        حقوق خصوصيتك
      </ThemedText>
      <ThemedText style={[styles.content, styles.arabicText]}>
        نظرًا لأنه لا يتم جمع أي بيانات شخصية، فلا حاجة لطلبات حذف البيانات أو
        إدارة المعلومات الشخصية داخل التطبيق.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.arabicText]}>
        خدمات الطرف الثالث
      </ThemedText>
      <ThemedText style={[styles.content, styles.arabicText]}>
        لا يستخدم Open Mushaf أي خدمات طرف ثالث للتحليلات أو التتبع أو جمع
        البيانات. يعمل التطبيق بالكامل على جهازك دون إرسال أي معلومات خارجيًا.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.arabicText]}>
        تحديثات هذه السياسة
      </ThemedText>
      <ThemedText style={[styles.content, styles.arabicText]}>
        قد نقوم بتحديث هذه السياسة بشكل دوري. إذا تم إجراء تغييرات كبيرة، سنقوم
        بإبلاغ المستخدمين داخل التطبيق. استمرار استخدام التطبيق يعني قبولك
        للسياسة المحدثة.
      </ThemedText>

      <ThemedText style={[styles.subtitle, styles.arabicText]}>
        اتصل بنا
      </ThemedText>
      <ThemedText style={[styles.content, styles.arabicText]}>
        إذا كانت لديك أي أسئلة حول هذه السياسة، فلا تتردد في الاتصال بنا على:
      </ThemedText>
      <ThemedText style={[styles.content, styles.arabicText]}>
        البريد الإلكتروني: adelpro@gmail.com
      </ThemedText>

      <ExternalLink
        href={'https://adelpro.github.io/open-mushaf/privacy-policy-ar.html'}
        style={[styles.linkContainer]}
      >
        <ThemedText style={[styles.link, styles.arabicText]}>
          سياسة الخصوصية (الرابط)
        </ThemedText>
      </ExternalLink>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  arabicText: {
    flexDirection: 'row',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingVertical: 20,
    fontFamily: 'Tajawal_700Bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    paddingVertical: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 10,
  },

  link: {
    color: '#1E90FF',
    textDecorationLine: 'underline',
  },
  linkContainer: {
    marginTop: 40,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
  },
});
