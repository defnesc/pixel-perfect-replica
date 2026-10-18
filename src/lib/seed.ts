import classic from "@/assets/p-classic.jpg";
import single from "@/assets/p-single.jpg";
import frame from "@/assets/p-frame.jpg";
import full from "@/assets/intro.jpg";
import type { SheetData } from "./sheet";

/** Fallback data used until VITE_PRICE_SHEET_ID points at the real Price Sheet. */
export const SEED: SheetData = {
  products: [
    { product_id: "classic-6", product_name_en: "Classic Six", product_name_tr: "Klasik Altılı", description_en: "Six polished upper caps. The 333 signature.", description_tr: "Altı parlak üst kaplama. 333 imzası.", image_urls: [classic, full], teeth_count: 6, active: true, sort_order: 1 },
    { product_id: "star-single", product_name_en: "Star Single", product_name_tr: "Yıldızlı Tekli", description_en: "One cap with a star cut-out.", description_tr: "Yıldız kesimli tek diş kaplama.", image_urls: [single], teeth_count: 1, active: true, sort_order: 2 },
    { product_id: "open-frame", product_name_en: "Open Frame", product_name_tr: "Açık Çerçeve", description_en: "Open-face frames that show your teeth.", description_tr: "Dişlerinizi gösteren açık çerçeveler.", image_urls: [frame], teeth_count: "any", active: true, sort_order: 3 },
    { product_id: "full-set", product_name_en: "Full Set", product_name_tr: "Tam Set", description_en: "Solid caps, top and bottom.", description_tr: "Alt ve üst, tam kaplama.", image_urls: [full, classic], teeth_count: "any", active: true, sort_order: 4 },
  ],
  prices: [
    { product_id: "classic-6", metal_type: "Silver", price: 24000, currency: "TRY", pricing_mode: "per_set" },
    { product_id: "classic-6", metal_type: "14K Gold", price: 2280, currency: "USD", pricing_mode: "per_set" },
    { product_id: "star-single", metal_type: "Silver", price: 6500, currency: "TRY", pricing_mode: "per_set" },
    { product_id: "star-single", metal_type: "14K Gold", price: 380, currency: "USD", pricing_mode: "per_set" },
    { product_id: "open-frame", metal_type: "Silver", price: 3500, currency: "TRY", pricing_mode: "per_tooth" },
    { product_id: "open-frame", metal_type: "14K Gold", price: 300, currency: "USD", pricing_mode: "per_tooth" },
    { product_id: "full-set", metal_type: "Silver", price: 3800, currency: "TRY", pricing_mode: "per_tooth" },
    { product_id: "full-set", metal_type: "14K Gold", price: 380, currency: "USD", pricing_mode: "per_tooth" },
  ],
  customBase: [
    { metal_type: "Silver", first_tooth_price: 6500, extra_tooth_price: 2000, currency: "TRY", note_en: "Every silver piece is gold covered.", note_tr: "Tüm gümüş parçalarımız altın kaplamadır." },
    { metal_type: "14K Gold", first_tooth_price: 380, extra_tooth_price: 380, currency: "USD", note_en: "", note_tr: "" },
    { metal_type: "18K Gold", first_tooth_price: null, extra_tooth_price: null, currency: "USD", note_en: "", note_tr: "" },
  ],
  faq: [
    ["Where is your clinic / shop?", "Kliniğiniz / mağazanız nerede?", "Bomonti, Istanbul. We will share the location details when we receive your order.", "Bomonti, İstanbul. Siparişinizi aldığımızda konum bilgilerini paylaşıyoruz."],
    ["How are grillz worn? Are they permanent?", "Grillz nasıl takılıyor? Kalıcı mı?", "You put them on in seconds, just like earrings. Push them onto your teeth and they stay in place. Whenever you like, take them off and put them back in their case. They are custom-made from a digital scan of your mouth, they are not glued to your teeth, and they are not a dental treatment.", "Küpe gibi, saniyeler içinde dişinize giyilir. Dişinize ittirdiğinizde yerinde kalır; dilediğiniz zaman çıkarıp kutusuna geri koyarsınız. Ağzınızın dijital taramasına göre size özel üretilir, dişlerinize yapıştırılmaz ve diş tedavisi değildir."],
    ["How is the impression taken?", "Ölçü nasıl alınıyor?", "With a digital intraoral scan that takes only about 10 minutes, with no putty or moulds. In Istanbul, you get it at our clinic. Outside Istanbul, any dental clinic near you can do the scan. Ask for an .STL file and email it to us.", "Yaklaşık 10 dakika süren ağız içi dijital tarama ile; macun veya kalıp kullanılmaz. İstanbul'daysanız kliniğimizde, İstanbul dışındaysanız size yakın herhangi bir diş kliniğinde tarama yaptırabilirsiniz. Klinikten .STL dosyası isteyip bize e-postayla göndermeniz yeterli."],
    ["What is an .STL file?", ".STL dosyası nedir?", "It's the 3D file a dental clinic's intraoral scanner creates. Ask the clinic to give you your scan as an .STL file. An X-ray is not a scan and can't be used.", "Diş kliniğindeki ağız içi tarayıcının oluşturduğu 3D dosyadır. Klinikten taramanızı .STL dosyası olarak vermesini isteyin. Röntgen, tarama yerine geçmez."],
    ["How long does it take?", "Ne kadar sürüyor?", "It takes 2–3 weeks to produce your piece and for you to receive it.", "Parçanızın üretilmesi ve size ulaşması 2–3 hafta sürer."],
    ["What materials do you use?", "Hangi malzemeleri kullanıyorsunuz?", "Silver, 14K gold and 18K gold. Every silver piece is gold covered. You can choose yellow, white or rose. The color doesn't change the price; only the material does.", "Gümüş, 14 ayar altın ve 18 ayar altın. Tüm gümüş parçalarımız altın kaplamadır. Sarı, beyaz veya rose renk seçebilirsiniz. Renk fiyatı değiştirmez, fiyatı yalnızca malzeme belirler."],
    ["Is the price on the website final?", "Sitedeki fiyat kesin mi?", "No, it's an estimate. The final price is set after your scan and the final design approval. Coloured or precious stones are priced separately. Shipping is not included.", "Hayır, tahminidir. Kesin fiyat ölçü alımı ve tasarımın son onayından sonra belirlenir. Renkli veya değerli taşlar ayrıca fiyatlandırılır. Kargo fiyata dahil değildir."],
    ["How do I pay?", "Nasıl ödeme yapabilirim?", "Right now we only accept payments in cash and in advance.", "Şu an yalnızca nakit ve peşin ödeme kabul ediyoruz."],
    ["Do you ship?", "Kargo yapıyor musunuz?", "Yes, within Türkiye and internationally. Shipping is not included in the price. You can also pick up your piece from our clinic in Istanbul.", "Evet, Türkiye içine ve yurt dışına gönderim yapıyoruz. Kargo ücreti fiyata dahil değildir. Dilerseniz parçanızı İstanbul'daki kliniğimizden de teslim alabilirsiniz."],
    ["Can I eat with grillz?", "Grillz ile yemek yiyebilir miyim?", "**No. Never eat or sleep with your grillz in.** Taking them out when drinking acidic or staining drinks (cola, coffee, wine, juice etc.) also keeps them shiny for much longer.", "**Hayır. Grillz takılıyken kesinlikle yemek yemeyin ve uyumayın.** Asitli veya lekeleyici içecekler (kola, kahve, şarap, meyve suyu vb.) içerken de çıkarmanız, parlaklığını çok daha uzun süre korur."],
    ["Is it bad for my mouth or jaw?", "Ağız veya çene sağlığı için sakıncası var mı?", "Because grillz sit over your teeth, they change how your jaw normally closes. We don't recommend wearing them for more than 4 hours in a row per day. If you have any tooth or gum problems, check with your dentist first.", "Grillz dişlerinizin üzerine giyildiği için normal çene kapanışınızı etkiler. Bu nedenle günde 4 saatten fazla aralıksız kullanmanızı önermiyoruz. Diş veya diş eti sağlığınızla ilgili bir sorununuz varsa önce diş hekiminize danışın."],
    ["I have a retainer wire behind my teeth. Is that a problem?", "Dişlerimin arkasında tel (retainer) var, sorun olur mu?", "No, that's not a problem. Just mention it at your scan and we'll design your grillz around it.", "Hayır, sorun olmaz. Ölçü alırken telinizden bahsetmeniz yeterli; grillz'inizi buna göre tasarlarız."],
    ["Should I get grillz before or after braces?", "Diş teli taktırmadan önce mi, sonra mı grillz yaptırmalıyım?", "After your treatment. Braces change how your teeth are aligned, so grillz made before braces won't fit afterwards.", "Tedaviniz bittikten sonra. Diş teli dişlerinizin dizilimini değiştirdiği için, telden önce yapılan grillz tedavi sonrasında dişlerinize oturmaz."],
    ["How long do grillz last?", "Grillz'in kullanım ömrü ne kadar?", "They last a lifetime as long as the shape and alignment of your teeth don't change. Over the years they may dull a little; a small polishing cloth brings back the original shine. If you like, we can renew the plating and polish for a small fee.", "Dişlerinizin şekli ve dizilimi değişmediği sürece ömürlüktür. Yıllar içinde bir miktar matlaşabilir; küçük bir cila beziyle ilk günkü parlaklığına kavuşturabilirsiniz. Dilerseniz kaplama ve cilasını küçük bir ücret karşılığında bizde yenileyebiliriz."],
    ["How do I clean them?", "Nasıl temizlerim?", "After each use, rinse with lukewarm water, brush gently, dry, and store in the case. We give full care instructions on delivery.", "Her kullanımdan sonra ılık su ve yumuşak bir fırçayla temizleyip kurulayın, kutusunda saklayın. Detaylı bakım bilgisini teslimatta veriyoruz."],
    ["Do you make grillz for people under 18?", "18 yaşından küçüklere yapılıyor mu?", "No. We only make grillz for people aged 18 and over.", "Hayır. Yalnızca 18 yaş ve üzerindeki kişilere grillz yapıyoruz."],
    ["Why is there an 18+ age limit?", "Neden 18 yaş sınırı var?", "An order is a sales contract and processing personal data needs valid consent, so we only serve people aged 18 and over.", "Sipariş bir satış sözleşmesidir ve kişisel verilerin işlenmesi için geçerli açık rıza gerekir; bu nedenle yalnızca 18 yaş ve üzerindeki kişilere hizmet veriyoruz."],
    ["What happens to my personal data?", "Kişisel verilerim ne oluyor?", "We use your order details and contact information only to prepare and deliver your order. They are kept in our order records and are never sold or shared for marketing. Details are in our Privacy Notice (KVKK).", "Sipariş bilgilerinizi ve iletişim bilgilerinizi yalnızca siparişinizi hazırlamak ve teslim etmek için kullanırız. Bu bilgiler sipariş kayıtlarımızda saklanır, satılmaz ve pazarlama amacıyla paylaşılmaz. Ayrıntılar KVKK Aydınlatma Metni'nde."],
  ].map(([question_en = "", question_tr = "", answer_en = "", answer_tr = ""], i) => ({ question_en, question_tr, answer_en, answer_tr, sort_order: i + 1 })),
  settings: {
    whatsapp_number: "905000000000",
    scan_email: "scan@333grillz.com",
    metal_colors: ["Yellow", "White", "Rose"],
    currency_symbol: "₺",
    usd_try: 41,
  },
};
