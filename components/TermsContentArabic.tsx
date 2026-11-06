import React from 'react';
import {
  Linking,
  Pressable,
  type StyleProp,
  StyleSheet,
  type TextStyle,
  useColorScheme,
  View,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import type { ExternalLinkType } from '@/types';

import { ExternalLink } from './ExternalLink';
import { ThemedText } from './ThemedText';

/**
 * Discriminated block shapes used to lay out the Terms of Service.
 *
 * `heading` opens a numbered section, `paragraph` is a standalone claim, and
 * `list` renders a bulleted enumeration inside the section above it.
 */
type TermsBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'privacyLink' };

/** Opening metadata kept apart from the numbered sections. */
const LAST_UPDATED = 'آخر تحديث: 6 نوفمبر 2026';

/** Terms body in Arabic, mirroring the English document section by section. */
const TERMS_BLOCKS: TermsBlock[] = [
  { type: 'heading', text: '1. عن Quran.us.kg' },
  {
    type: 'paragraph',
    text: 'Quran.us.kg مشروع تقني مستقل يديره adelpro (Adel Benyahia)، ويقدّم أدوات وخدمات رقمية تهدف إلى تيسير الوصول إلى القرآن الكريم عبر التقنية.',
  },
  {
    type: 'paragraph',
    text: 'وقد تشمل هذه الخدمات مواقع إلكترونية ومحركات بحث وواجهات برمجة تطبيقات (APIs) وخوادم MCP وتطبيقات وتكاملات، إضافة إلى برمجيات وموارد أخرى تُنشر تحت نطاق Quran.us.kg.',
  },
  {
    type: 'paragraph',
    text: 'تسري هذه الشروط على جميع الخدمات المقدّمة عبر Quran.us.kg، ما لم تكن لخدمة معيّنة شروط إضافية تنص صراحةً على استثنائها من بعض هذه الشروط أو استكمالها بها.',
  },
  {
    type: 'paragraph',
    text: 'وباستخدامك خدماتنا أو دخولك إليها، فإنك توافق على هذه الشروط.',
  },

  { type: 'heading', text: '2. الاستخدام المقبول' },
  {
    type: 'paragraph',
    text: 'يجوز لك استخدام خدماتنا للأغراض الشخصية والتعليمية والبحثية والتطويرية وغيرها من الأغراض المشروعة.',
  },
  { type: 'paragraph', text: 'وتوافق على ألّا تقوم بما يلي:' },
  {
    type: 'list',
    items: [
      'استخدام خدماتنا في أنشطة غير قانونية.',
      'محاولة الوصول دون تصريح إلى أنظمتنا أو بنيتنا التحتية.',
      'تعطيل خدماتنا أو إثقالها أو التدخّل في توفّرها أو أمنها.',
      'إساءة استخدام واجهات API أو خوادم MCP أو غيرها من نقاط الوصول بما يضرّ بالمستخدمين الآخرين.',
      'التحايل على القيود التقنية المعقولة أو حدود الاستخدام.',
      'تحريف خدماتنا أو محتواها أو مخرجاتها أو تقديمها على غير حقيقتها.',
    ],
  },
  {
    type: 'paragraph',
    text: 'ونحتفظ بحق تقييد الوصول عند الحاجة، حمايةً لبنيتنا التحتية ومستخدمينا.',
  },

  { type: 'heading', text: '3. المحتوى القرآني ودقّته' },
  {
    type: 'paragraph',
    text: 'قد تقدّم خدماتنا النص القرآني والترجمات والكتابة الصوتية وموارد التلاوة ونتائج البحث والبيانات الوصفية وغيرها من المعلومات المتعلقة بالقرآن الكريم.',
  },
  {
    type: 'paragraph',
    text: 'نحرص على تقديم مراجع موثوقة ومعلومات دقيقة، غير أنّه قد تحدث أخطاء أو سهو أو اختلافات في التنسيق أو قيود.',
  },
  {
    type: 'paragraph',
    text: 'وينبغي للمستخدمين التحقّق من المراجع القرآنية المهمة بالرجوع إلى مصحف موثوق، واستشارة أهل العلم المؤهّلين في التفسير والأحكام.',
  },
  {
    type: 'paragraph',
    text: 'وأدواتنا الرقمية ليست بديلًا عن الإرشاد العلمي، ولا تصدر فتاوى مُلزِمة.',
  },
  {
    type: 'paragraph',
    text: 'وقد تكون للترجمات والتفسيرات وغيرها من المواد التكميلية مؤلّفوها ومصادرها وشروط ترخيصها الخاصة.',
  },

  { type: 'heading', text: '4. الملكية الفكرية والترخيص' },
  {
    type: 'paragraph',
    text: 'يشمل مشروع Quran.us.kg برمجيات ووثائق وواجهات ومواد أخرى قد تُوزَّع بموجب تراخيص مختلفة.',
  },
  {
    type: 'paragraph',
    text: 'وتبقى المكوّنات مفتوحة المصدر خاضعة لتراخيصها الخاصة، كما تبقى مجموعات البيانات والترجمات والتسجيلات الصوتية والموارد الأخرى العائدة لأطراف ثالثة خاضعة لحقوق أصحابها وشروطهم.',
  },
  {
    type: 'paragraph',
    text: 'ولا ينقل أي بند في هذه الشروط ملكية مواد الغير، ولا يدّعي ملكية القرآن الكريم نفسه.',
  },
  {
    type: 'paragraph',
    text: 'والمستخدمون مسؤولون عن احترام التراخيص المنطبقة ومتطلبات الإسناد عند إعادة استخدام المواد.',
  },

  { type: 'heading', text: '5. واجهات API وخوادم MCP والتكاملات' },
  {
    type: 'paragraph',
    text: 'قد تكون بعض الخدمات متاحة عبر واجهات API أو خوادم MCP أو مساعدي الذكاء الاصطناعي أو تطبيقات طرف ثالث.',
  },
  { type: 'paragraph', text: 'ويخضع الوصول إلى هذه الخدمات للشروط الآتية:' },
  {
    type: 'list',
    items: [
      'استخدام التكاملات بمسؤولية وفي حدود الاستخدام المعلنة.',
      'عدم استخدام الوصول الآلي بما يعطّل توفّر الخدمة.',
      'عدم افتراض أنّ ردود الذكاء الاصطناعي الصادرة عن أطراف ثالثة موثوقة أو خالية من الأخطاء.',
      'احترام شروط التطبيقات والمنصّات التي تصل عبرها إلى خدماتنا وسياساتها.',
    ],
  },
  {
    type: 'paragraph',
    text: 'وقد نغيّر سلوك واجهات API أو الأدوات المتاحة أو نقاط الوصول أو حدود الاستخدام مع تطوّر المشروع.',
  },

  { type: 'heading', text: '6. خدمات الأطراف الثالثة' },
  {
    type: 'paragraph',
    text: 'قد تشير خدماتنا إلى مواقع أو تطبيقات أو مجموعات بيانات أو بنًى تحتية أو برمجيات تابعة لأطراف ثالثة، أو تتكامل معها، أو تعتمد عليها.',
  },
  {
    type: 'paragraph',
    text: 'وتخضع خدمات الأطراف الثالثة لشروطها وسياسات الخصوصية الخاصة بها؛ ولا نتحكّم في محتواها أو توفّرها أو ممارساتها، ولا نتحمّل مسؤوليتها.',
  },

  { type: 'heading', text: '7. التوفّر والتعديلات' },
  {
    type: 'paragraph',
    text: 'نسعى إلى إبقاء خدماتنا متاحة وموثوقة، غير أنّه لا يمكن ضمان توفّرها دون انقطاع.',
  },
  {
    type: 'paragraph',
    text: 'ونحتفظ بحق تعديل أي خدمة أو ميزة أو تعليقها أو إيقافها أو تقييدها، مؤقتًا أو دائمًا، دون إشعار مسبق عند الضرورة.',
  },

  { type: 'heading', text: '8. الخصوصية' },
  {
    type: 'paragraph',
    text: 'يخضع استخدامك خدماتنا أيضًا لسياسة الخصوصية الخاصة بنا، التي تبيّن كيفية التعامل مع المعلومات.',
  },
  { type: 'privacyLink' },

  { type: 'heading', text: '9. إخلاء المسؤولية وحدودها' },
  {
    type: 'paragraph',
    text: 'تُقدَّم خدماتنا «كما هي» و«كما هي متاحة» في الحدود التي يجيزها القانون المعمول به.',
  },
  {
    type: 'paragraph',
    text: 'ولا نضمن أن تكون الخدمات متاحة دائمًا أو خالية من الأخطاء أو كاملة أو مناسبة لكل غرض.',
  },
  {
    type: 'paragraph',
    text: 'وفي الحدود التي يجيزها القانون المعمول به، لا يتحمّل adelpro والقائمون على المشروع مسؤولية أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية تنشأ عن استخدام خدماتنا أو تعذّر استخدامها.',
  },
  {
    type: 'paragraph',
    text: 'ولا يستثني أي بند في هذه الشروط مسؤولية لا يجوز استثناؤها قانونًا.',
  },

  { type: 'heading', text: '10. تعديل هذه الشروط' },
  { type: 'paragraph', text: 'قد نحدّث هذه الشروط مع تطوّر Quran.us.kg.' },
  {
    type: 'paragraph',
    text: 'وسيُنشر أي نسخة معدّلة في هذه الصفحة مع تحديث تاريخ المراجعة، ويُعدّ استمرارك في استخدام خدماتنا بعد سريان التعديلات قبولًا للشروط المعدّلة، في الحدود التي يجيزها القانون المعمول به.',
  },

  { type: 'heading', text: '11. التواصل' },
  {
    type: 'paragraph',
    text: 'للأسئلة أو الملاحظات أو الطلبات القانونية المتعلقة بهذه الشروط أو بخدماتنا، تواصل معنا عبر:',
  },
];

/** One labelled contact line, with the value either linked or plain. */
type ContactRowProps = {
  label: string;
  value: string;
  linkColor: string;
  onPress?: () => void;
  href?: ExternalLinkType;
};

function ContactRow({
  label,
  value,
  linkColor,
  onPress,
  href,
}: ContactRowProps) {
  const isLink = Boolean(href || onPress);
  const valueStyle: StyleProp<TextStyle> = [
    styles.contactValue,
    styles.arabicText,
    isLink ? { color: linkColor } : undefined,
    isLink ? styles.link : undefined,
  ];

  return (
    <View style={styles.contactRow}>
      <ThemedText
        type="defaultSemiBold"
        style={[styles.contactLabel, styles.arabicText]}
      >
        {label}
      </ThemedText>
      {href ? (
        <ExternalLink href={href} style={styles.contactLink}>
          <ThemedText style={valueStyle}>{value}</ThemedText>
        </ExternalLink>
      ) : onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="link"
          accessibilityLabel={`${label}: ${value}`}
          hitSlop={8}
        >
          {({ pressed }) => (
            <ThemedText style={[valueStyle, pressed && styles.linkPressed]}>
              {value}
            </ThemedText>
          )}
        </Pressable>
      ) : (
        <ThemedText style={valueStyle}>{value}</ThemedText>
      )}
    </View>
  );
}

/**
 * Arabic text of the Quran.us.kg Terms of Service, laid out right to left to
 * match the rest of the application.
 *
 * @returns The terms body, including the privacy link and contact block.
 */
export function TermsContentArabic() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const linkColor = palette.tint;

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.title, styles.arabicText]}>
        شروط الاستخدام
      </ThemedText>
      <ThemedText
        style={[styles.updated, styles.arabicText, { color: palette.icon }]}
      >
        {LAST_UPDATED}
      </ThemedText>

      {TERMS_BLOCKS.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === 'heading') {
          return (
            <ThemedText key={key} style={[styles.heading, styles.arabicText]}>
              {block.text}
            </ThemedText>
          );
        }

        if (block.type === 'list') {
          return (
            <View key={key} style={styles.list}>
              {block.items.map((item) => (
                <View key={item} style={styles.listItem}>
                  <View
                    style={[styles.bullet, { backgroundColor: palette.icon }]}
                  />
                  <ThemedText style={[styles.listText, styles.arabicText]}>
                    {item}
                  </ThemedText>
                </View>
              ))}
            </View>
          );
        }

        if (block.type === 'privacyLink') {
          return (
            <ExternalLink
              key={key}
              href="https://quran.us.kg/privacy"
              style={styles.standaloneLink}
            >
              <ThemedText
                style={[styles.link, styles.arabicText, { color: linkColor }]}
              >
                اقرأ سياسة الخصوصية
              </ThemedText>
            </ExternalLink>
          );
        }

        return (
          <ThemedText key={key} style={[styles.paragraph, styles.arabicText]}>
            {block.text}
          </ThemedText>
        );
      })}

      <ContactRow
        label="الناشر"
        value="adelpro (Adel Benyahia)"
        linkColor={linkColor}
      />
      <ContactRow
        label="البريد الإلكتروني"
        value="adelpro@gmail.com"
        linkColor={linkColor}
        onPress={() => {
          void Linking.openURL('mailto:adelpro@gmail.com');
        }}
      />
      <ContactRow
        label="الموقع الإلكتروني"
        value="https://quran.us.kg"
        linkColor={linkColor}
        href="https://quran.us.kg"
      />
      <ContactRow
        label="صفحة التواصل"
        value="https://quran.us.kg/contact"
        linkColor={linkColor}
        href="https://quran.us.kg/contact"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    direction: 'rtl',
    width: '100%',
  },
  arabicText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  title: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 32,
    lineHeight: 32,
  },
  updated: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  heading: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 20,
    lineHeight: 25,
    marginTop: 32,
    marginBottom: 10,
  },
  paragraph: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  list: {
    marginBottom: 12,
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    gap: 10,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 10,
  },
  listText: {
    flex: 1,
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    textDecorationLine: 'underline',
  },
  linkPressed: {
    opacity: 0.6,
  },
  standaloneLink: {
    marginTop: 4,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  contactRow: {
    marginBottom: 10,
    gap: 2,
  },
  contactLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  contactValue: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  contactLink: {
    alignSelf: 'flex-start',
  },
});
