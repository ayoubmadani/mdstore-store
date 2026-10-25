// نصوص الصفحات القانونية لـ mdstore.top (ميتا تفتح هذه الروابط عند مراجعة التطبيق).
// كل ما يُكتب هنا يجب أن يطابق ما تفعله المنصة فعلاً.

export type LegalLocale = 'ar' | 'fr' | 'en';
export type LegalDocKey = 'privacy' | 'terms' | 'deletion';

const EMAIL = 'ayoubmd197@gmail.com';

const privacy: Record<LegalLocale, string> = {
  ar: `# سياسة الخصوصية — MdStore

آخر تحديث: ٢٥ أكتوبر ٢٠٢٦

## ١. من نحن
MdStore منصة لإنشاء المتاجر الإلكترونية للتجار في الجزائر، متاحة على الموقع mdstore.top. نحن المسؤولون عن معالجة البيانات المذكورة في هذه السياسة، وفقا للقانون الجزائري رقم ١٨-٠٧ المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي.

## ٢. البيانات التي نجمعها
**بيانات التاجر:** الاسم، البريد الإلكتروني، رقم الهاتف، معلومات المتجر، وبيانات الاشتراك.

**بيانات زبائن المتاجر:** الاسم، رقم الهاتف، الولاية، البلدية، والعنوان، وذلك فقط لتنفيذ الطلبات وتوصيلها.

**النماذج غير المكتملة:** إذا كتب الزبون رقم هاتفه في نموذج الطلب ولم يُكمله، نحفظ ما كتبه (الاسم، الهاتف، الولاية، البلدية، العنوان، والمنتج) حتى يتمكن التاجر من التواصل معه. تُحذف هذه البيانات فور إكمال الطلب، أو تلقائيا بعد ثلاثين يوما.

**بيانات ميتا (فيسبوك):** عندما يربط التاجر حسابه في فيسبوك بمنصتنا، نحصل بموافقته على:
- قائمة حساباته الإعلانية وأسمائها.
- قائمة البكسلات المرتبطة بها، وإمكانية إنشاء بكسل جديد.
- أسماء الحملات الإعلانية وحالتها وميزانيتها.
- إحصائيات الحملات: المصاريف، مرات الظهور، والنقرات.
- رمز وصول يسمح لنا بتنفيذ هذه العمليات نيابة عنه.

## ٣. كيف نستعمل بيانات ميتا
نستعمل بيانات ميتا لغرض واحد: مساعدة التاجر على إدارة إعلاناته وقياس ربحه الحقيقي داخل لوحة تحكم MdStore. ويشمل ذلك:
- ربط منتجات المتجر بالحملات الإعلانية.
- حساب تكلفة الطلب المؤكد والموصل، والربح الصافي.
- إرسال أحداث الطلبات إلى بكسل التاجر عبر واجهة التحويلات.
- إيقاف حملة أو تعديل ميزانيتها، فقط عندما يطلب التاجر ذلك بنفسه.

لا نبيع بيانات ميتا، ولا نشاركها مع أي طرف آخر، ولا نستعملها لأي إعلان خاص بنا.

## ٤. بيانات الزبائن المرسلة إلى ميتا
عندما يفعّل التاجر واجهة التحويلات لبكسله، نرسل إلى ذلك البكسل ثلاثة أحداث: «بدء الطلب» حين يكتب الزبون رقم هاتفه في نموذج الطلب، و«طلب» عند تسجيل الطلب، و«شراء» عند تأكيده.

- **بيانات مشفرة بطريقة لا تسمح باسترجاعها (SHA-256):** رقم الهاتف، الاسم، الولاية، البلدية، ومعرّف الزبون.
- **بيانات تقنية غير مشفرة، كما تشترط ميتا:** عنوان IP، معرّف المتصفح، معرّفات ملفات تعريف الارتباط الخاصة بميتا، رابط الصفحة، وقيمة الطلب ومنتجاته.

الغرض الوحيد من ذلك قياس نتائج إعلانات التاجر. لا نرسل شيئا إلى بكسل تاجر لم يفعّل واجهة التحويلات.

## ٥. حماية البيانات
- رموز الوصول محفوظة مشفرة (AES-256) في قاعدة بيانات مؤمنة، ولا تُعرض أبدا بعد حفظها.
- الوصول إلى البيانات محصور في الأنظمة التي تحتاجها لتقديم الخدمة.
- كل الاتصالات تمر عبر بروتوكول مشفر.

## ٦. مدة الاحتفاظ
نحتفظ بالبيانات طيلة مدة استعمال الحساب. تُحذف النماذج غير المكتملة بعد ثلاثين يوما. عند إلغاء ربط فيسبوك أو إزالة رمز الوصول، نحذف الرمز فورا، ونحذف إحصائيات الحملات خلال ثلاثين يوما.

## ٧. حقوقك
يحق لك الاطلاع على بياناتك، وتصحيحها، وحذفها، والاعتراض على معالجتها. لطلب الحذف، اتبع التعليمات في الصفحة:
https://mdstore.top/data-deletion

## ٨. التواصل
البريد الإلكتروني: ${EMAIL}`,

  fr: `# Politique de confidentialité — MdStore

Dernière mise à jour : 25 octobre 2026

## 1. Qui sommes-nous
MdStore est une plateforme de création de boutiques en ligne pour les commerçants en Algérie, disponible sur mdstore.top. Nous sommes responsables du traitement des données décrites ici, conformément à la loi algérienne n° 18-07 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.

## 2. Données collectées
**Données du commerçant :** nom, e-mail, téléphone, informations de la boutique et de l'abonnement.

**Données des clients des boutiques :** nom, téléphone, wilaya, commune et adresse, uniquement pour traiter et livrer les commandes.

**Formulaires non terminés :** si un client saisit son téléphone dans le formulaire de commande sans le valider, nous enregistrons ce qu'il a saisi (nom, téléphone, wilaya, commune, adresse et produit) pour que le commerçant puisse le recontacter. Ces données sont supprimées dès que la commande est passée, ou automatiquement après trente jours.

**Données Meta (Facebook) :** lorsque le commerçant connecte son compte Facebook, nous obtenons, avec son accord :
- la liste de ses comptes publicitaires ;
- la liste des pixels associés, et la possibilité d'en créer un nouveau ;
- le nom, le statut et le budget de ses campagnes ;
- les statistiques des campagnes : dépenses, impressions et clics ;
- un jeton d'accès permettant d'effectuer ces opérations en son nom.

## 3. Utilisation des données Meta
Les données Meta servent uniquement à aider le commerçant à gérer ses publicités et à mesurer son bénéfice réel dans le tableau de bord MdStore :
- associer les produits aux campagnes ;
- calculer le coût par commande confirmée et livrée, et le bénéfice net ;
- envoyer les événements de commande au pixel du commerçant via l'API Conversions ;
- mettre en pause une campagne ou modifier son budget, uniquement à la demande du commerçant.

Nous ne vendons pas les données Meta, ne les partageons avec aucun tiers et ne les utilisons pour aucune publicité qui nous est propre.

## 4. Données clients envoyées à Meta
Lorsque le commerçant active l'API Conversions pour son pixel, nous envoyons à ce pixel trois événements : « début de commande » quand le client saisit son téléphone, « commande » à l'enregistrement de la commande, et « achat » à sa confirmation.

- **Données hachées de manière irréversible (SHA-256) :** téléphone, nom, wilaya, commune et identifiant client.
- **Données techniques non hachées, exigées par Meta :** adresse IP, identifiant du navigateur, identifiants des cookies Meta, adresse de la page, ainsi que la valeur et les produits de la commande.

Le seul but est de mesurer les résultats publicitaires du commerçant. Rien n'est envoyé au pixel d'un commerçant qui n'a pas activé l'API Conversions.

## 5. Sécurité
- Les jetons d'accès sont stockés chiffrés (AES-256) dans une base de données sécurisée et ne sont jamais réaffichés après leur enregistrement.
- L'accès aux données est limité aux systèmes nécessaires au service.
- Toutes les communications sont chiffrées.

## 6. Durée de conservation
Les données sont conservées pendant l'utilisation du compte. Les formulaires non terminés sont supprimés après trente jours. En cas de déconnexion de Facebook ou de retrait du jeton d'accès, le jeton est supprimé immédiatement et les statistiques des campagnes sous trente jours.

## 7. Vos droits
Vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition. Pour demander la suppression, suivez les instructions sur :
https://mdstore.top/data-deletion

## 8. Contact
E-mail : ${EMAIL}`,

  en: `# Privacy Policy — MdStore

Last updated: October 25, 2026

## 1. Who we are
MdStore is a platform for creating online stores for merchants in Algeria, available at mdstore.top. We are responsible for processing the data described in this policy, in accordance with Algerian Law No. 18-07 on the protection of natural persons in the processing of personal data.

## 2. Data we collect
**Merchant data:** name, email, phone number, store information and subscription data.

**Store customers' data:** name, phone number, wilaya, commune and address, only to process and deliver orders.

**Unfinished forms:** if a customer types their phone number in the order form without submitting it, we save what they typed (name, phone, wilaya, commune, address and product) so the merchant can contact them. This data is deleted as soon as the order is placed, or automatically after thirty days.

**Meta (Facebook) data:** when a merchant connects their Facebook account to our platform, with their consent we obtain:
- the list of their ad accounts and their names;
- the list of associated pixels, and the ability to create a new pixel;
- the names, status and budgets of their campaigns;
- campaign insights: spend, impressions and clicks;
- an access token that lets us perform these operations on their behalf.

## 3. How we use Meta data
We use Meta data for a single purpose: helping the merchant manage their ads and measure their real profit inside the MdStore dashboard. This includes:
- linking store products to ad campaigns;
- calculating the cost per confirmed and delivered order, and net profit;
- sending order events to the merchant's pixel through the Conversions API;
- pausing a campaign or changing its budget, only when the merchant asks for it.

We do not sell Meta data, do not share it with any third party, and do not use it for any advertising of our own.

## 4. Customer data sent to Meta
When a merchant enables the Conversions API for their pixel, we send three events to that pixel: "initiate checkout" when the customer types their phone number in the order form, "lead" when the order is placed, and "purchase" when it is confirmed.

- **Irreversibly hashed data (SHA-256):** phone number, name, wilaya, commune and customer identifier.
- **Unhashed technical data, as required by Meta:** IP address, browser user agent, Meta cookie identifiers, page URL, and the order value and products.

The only purpose is to measure the merchant's advertising results. Nothing is sent to the pixel of a merchant who has not enabled the Conversions API.

## 5. Data protection
- Access tokens are stored encrypted (AES-256) in a secured database and are never shown again after being saved.
- Access to data is limited to the systems that need it to provide the service.
- All communications use an encrypted protocol.

## 6. Retention
We keep data for as long as the account is used. Unfinished forms are deleted after thirty days. When Facebook is disconnected or the access token is removed, we delete the token immediately and campaign insights within thirty days.

## 7. Your rights
You have the right to access, correct and delete your data, and to object to its processing. To request deletion, follow the instructions at:
https://mdstore.top/data-deletion

## 8. Contact
Email: ${EMAIL}`,
};

const terms: Record<LegalLocale, string> = {
  ar: `# شروط الاستخدام — MdStore

آخر تحديث: ٢٥ أكتوبر ٢٠٢٦

## ١. القبول
باستعمالك منصة MdStore على الموقع mdstore.top، فإنك توافق على هذه الشروط. إن لم توافق عليها، فلا تستعمل المنصة.

## ٢. الخدمة
توفر MdStore للتجار أدوات لإنشاء متجر إلكتروني، وإدارة المنتجات والطلبات والتوصيل، وربط حساباتهم الإعلانية في ميتا لقياس النتائج وإدارة الحملات.

## ٣. حساب التاجر
- يجب أن تكون المعلومات التي تقدمها صحيحة.
- أنت مسؤول عن سرية كلمة السر وعن كل نشاط يتم عبر حسابك.
- يجب أن يكون عمرك ١٨ سنة على الأقل.

## ٤. المحتوى والمنتجات
- أنت المسؤول الوحيد عن المنتجات التي تعرضها، وعن صحة أوصافها وأسعارها.
- يُمنع عرض أي منتج مخالف للقانون الجزائري أو لسياسات ميتا الإعلانية.
- يحق لنا إيقاف أي متجر يخالف هذه الشروط.

## ٥. ربط حساب ميتا
- الربط اختياري، ويتم بموافقتك الصريحة.
- تحتفظ بملكية حساباتك الإعلانية وبكسلاتك وحملاتك.
- لا تنفذ MdStore أي تعديل على حملاتك إلا بطلب منك.
- يمكنك إلغاء الربط في أي وقت من لوحة التحكم، أو من إعدادات فيسبوك.
- يجب أن يحترم استعمالك لهذه الميزة شروط ميتا وسياساتها الإعلانية.

## ٦. الاشتراك والدفع
تخضع الاشتراكات للأسعار المعروضة على الموقع وقت الاشتراك. يمكنك إلغاء الاشتراك في أي وقت، ويبقى ساريا حتى نهاية الفترة المدفوعة.

## ٧. حدود المسؤولية
- تُقدَّم الأرقام والإحصائيات للمساعدة على اتخاذ القرار، ولا نضمن دقتها التامة، لأنها تعتمد على بيانات ميتا وشركات التوصيل.
- لا نتحمل مسؤولية قرارات الإنفاق الإعلاني التي يتخذها التاجر.
- لا نتحمل مسؤولية انقطاع الخدمات الخارجية، مثل ميتا أو شركات التوصيل.

## ٨. التعديل
قد نعدّل هذه الشروط، وسنُعلمك بأي تغيير جوهري عبر البريد أو لوحة التحكم.

## ٩. القانون المطبق
تخضع هذه الشروط للقانون الجزائري.

## ١٠. التواصل
البريد الإلكتروني: ${EMAIL}`,

  fr: `# Conditions d'utilisation — MdStore

Dernière mise à jour : 25 octobre 2026

## 1. Acceptation
En utilisant MdStore sur mdstore.top, vous acceptez ces conditions. Si vous ne les acceptez pas, n'utilisez pas la plateforme.

## 2. Service
MdStore fournit aux commerçants des outils pour créer une boutique en ligne, gérer produits, commandes et livraisons, et connecter leurs comptes publicitaires Meta pour mesurer les résultats et gérer leurs campagnes.

## 3. Compte commerçant
- Les informations fournies doivent être exactes.
- Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité sur votre compte.
- Vous devez avoir au moins 18 ans.

## 4. Contenu et produits
- Vous êtes seul responsable des produits proposés, de leurs descriptions et de leurs prix.
- Tout produit contraire à la loi algérienne ou aux politiques publicitaires de Meta est interdit.
- Nous pouvons suspendre toute boutique qui enfreint ces conditions.

## 5. Connexion du compte Meta
- La connexion est facultative et se fait avec votre accord explicite.
- Vous restez propriétaire de vos comptes publicitaires, pixels et campagnes.
- MdStore ne modifie vos campagnes qu'à votre demande.
- Vous pouvez déconnecter votre compte à tout moment depuis le tableau de bord ou les paramètres Facebook.
- Votre utilisation doit respecter les conditions et politiques publicitaires de Meta.

## 6. Abonnement et paiement
Les abonnements sont soumis aux tarifs affichés au moment de la souscription. Vous pouvez annuler à tout moment ; l'abonnement reste actif jusqu'à la fin de la période payée.

## 7. Limitation de responsabilité
- Les chiffres et statistiques sont fournis à titre d'aide à la décision ; leur exactitude n'est pas garantie, car ils dépendent des données de Meta et des sociétés de livraison.
- Nous ne sommes pas responsables des décisions de dépenses publicitaires du commerçant.
- Nous ne sommes pas responsables des interruptions des services tiers, comme Meta ou les sociétés de livraison.

## 8. Modifications
Nous pouvons modifier ces conditions et vous informerons de tout changement important par e-mail ou dans le tableau de bord.

## 9. Droit applicable
Ces conditions sont régies par le droit algérien.

## 10. Contact
E-mail : ${EMAIL}`,

  en: `# Terms of Use — MdStore

Last updated: October 25, 2026

## 1. Acceptance
By using the MdStore platform at mdstore.top, you agree to these terms. If you do not agree, do not use the platform.

## 2. Service
MdStore provides merchants with tools to create an online store, manage products, orders and delivery, and connect their Meta ad accounts to measure results and manage campaigns.

## 3. Merchant account
- The information you provide must be accurate.
- You are responsible for keeping your password confidential and for all activity on your account.
- You must be at least 18 years old.

## 4. Content and products
- You are solely responsible for the products you list, and for the accuracy of their descriptions and prices.
- Listing any product that violates Algerian law or Meta's advertising policies is prohibited.
- We may suspend any store that violates these terms.

## 5. Connecting your Meta account
- Connecting is optional and requires your explicit consent.
- You keep ownership of your ad accounts, pixels and campaigns.
- MdStore makes no change to your campaigns unless you ask for it.
- You can disconnect at any time from the dashboard or from your Facebook settings.
- Your use of this feature must comply with Meta's terms and advertising policies.

## 6. Subscription and payment
Subscriptions are subject to the prices shown on the site at the time of subscribing. You can cancel at any time; the subscription remains active until the end of the paid period.

## 7. Limitation of liability
- Figures and statistics are provided to help decision-making; we do not guarantee their complete accuracy, as they depend on data from Meta and delivery companies.
- We are not responsible for the advertising spend decisions made by the merchant.
- We are not responsible for outages of third-party services, such as Meta or delivery companies.

## 8. Changes
We may change these terms, and we will notify you of any material change by email or in the dashboard.

## 9. Governing law
These terms are governed by Algerian law.

## 10. Contact
Email: ${EMAIL}`,
};

const deletion: Record<LegalLocale, string> = {
  ar: `# حذف البيانات — MdStore

## الطريقة الأولى: من لوحة تحكم MdStore
١. سجّل الدخول إلى لوحة التحكم.
٢. افتح صفحة البكسل، ثم عدّل بكسل فيسبوك، واضغط على «إزالة التوكن». وإن كنت قد ربطت حساب فيسبوك: افتح الإعدادات، ثم قسم ربط فيسبوك، واضغط على إلغاء الربط.

يُحذف رمز الوصول فورا، وتُحذف إحصائيات الحملات المرتبطة خلال ثلاثين يوما.

## الطريقة الثانية: من فيسبوك
١. افتح فيسبوك، ثم الإعدادات والخصوصية، ثم الإعدادات.
٢. ادخل إلى قسم التطبيقات ومواقع الويب.
٣. اختر MdStore، ثم اضغط على إزالة.

## الطريقة الثالثة: حذف الحساب بالكامل
أرسل رسالة إلى البريد ${EMAIL} من البريد المسجل في حسابك، بعنوان "طلب حذف البيانات". نؤكد استلام الطلب خلال ٤٨ ساعة، ونحذف كل بيانات الحساب والمتجر خلال ثلاثين يوما، باستثناء ما يفرض القانون الاحتفاظ به، مثل الفواتير.

## زبائن المتاجر
إذا كنت زبونا في متجر يعمل على MdStore وتريد حذف بياناتك، فراسل البريد ${EMAIL} مع رقم هاتفك واسم المتجر، وسنحذف بياناتك خلال ثلاثين يوما.`,

  fr: `# Suppression des données — MdStore

## Méthode 1 : depuis le tableau de bord MdStore
1. Connectez-vous au tableau de bord.
2. Ouvrez la page Pixels, modifiez le pixel Facebook et cliquez sur « Retirer le jeton ». Si vous avez connecté votre compte Facebook : ouvrez Paramètres, puis la section Connexion Facebook, et cliquez sur Déconnecter.

Le jeton d'accès est supprimé immédiatement, et les statistiques des campagnes associées sous trente jours.

## Méthode 2 : depuis Facebook
1. Ouvrez Facebook, puis Paramètres et confidentialité, puis Paramètres.
2. Allez dans Applications et sites web.
3. Sélectionnez MdStore, puis cliquez sur Supprimer.

## Méthode 3 : suppression complète du compte
Envoyez un e-mail à ${EMAIL} depuis l'adresse associée à votre compte, avec l'objet « Demande de suppression des données ». Nous confirmons la réception sous 48 heures et supprimons toutes les données du compte et de la boutique sous trente jours, sauf celles que la loi impose de conserver, comme les factures.

## Clients des boutiques
Si vous êtes client d'une boutique fonctionnant sur MdStore et souhaitez supprimer vos données, écrivez à ${EMAIL} en indiquant votre numéro de téléphone et le nom de la boutique ; nous supprimerons vos données sous trente jours.`,

  en: `# Data Deletion — MdStore

## Option 1: from the MdStore dashboard
1. Sign in to the dashboard.
2. Open the Pixels page, edit the Facebook pixel and click "Remove token". If you connected your Facebook account: open Settings, then the Facebook connection section, and click Disconnect.

The access token is deleted immediately, and the related campaign insights within thirty days.

## Option 2: from Facebook
1. Open Facebook, then Settings & privacy, then Settings.
2. Go to Apps and websites.
3. Select MdStore, then click Remove.

## Option 3: delete the whole account
Send an email to ${EMAIL} from the address registered on your account, with the subject "Data deletion request". We confirm receipt within 48 hours and delete all account and store data within thirty days, except what the law requires us to keep, such as invoices.

## Store customers
If you are a customer of a store running on MdStore and want your data deleted, email ${EMAIL} with your phone number and the store name; we will delete your data within thirty days.`,
};

export const LEGAL: Record<LegalDocKey, Record<LegalLocale, string>> = { privacy, terms, deletion };
