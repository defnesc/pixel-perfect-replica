# Sepet ve sipariş akışı

## Yapılacaklar
- Mevcut tasarımı koruyarak üst menüye ürün sayısını gösteren sepet simgesi ve EN/TR sepet sayfası ekle.
- Klasik ve özel tasarım ürünlerinde **Sepete ekle** ve **WhatsApp'tan sipariş ver** seçenekleri sun. İlk seçenek kısa bildirim gösterir; ikincisi ürünü ekleyip sepeti açar. Ek parçalar kendi ürün ve seçenekleriyle ayrı satır olur.
- Sepette fotoğraf, renk, seçenekler, diş sayısı, 1–10 adet kontrolü, kaldırma ve fiyat göster. Sepeti cihazda sakla; saklama engellenirse sayfa çalışmaya devam etsin.
- En pahalı klasik parçayı tam fiyatlı tut; diğer klasik parçaların her birine kendi ürününün %20/%30 indirimini uygula. Özel tasarımları indirimsiz, ayrı tahmini toplamda göster. Ek parça kartları da aynı hesaplamayı kullansın.
- Klasik kaplama, Çerçeve ve Diş arası sayfalarında renk seçiminin ardından 1–8 diş/diş arası seçimi ekle. Bar bir kez, taşlar diş başına hesaplanır; aynı ürünün ek parça kartını gizle. Diş konumu seçici ekleme.
- Sepette tarama, teslimat, nakit-peşin ödeme, 18+ ve KVKK onaylarını istenen sırada sor. Eksik cevap varsa ilerlemeyi durdurup ilk eksik soruya kaydır ve vurgula.
- **Sipariş oluştur** sonrası tam ekran özet, sipariş numarası ve tarama/teslimat seçimine uygun numaralı sonraki adımları göster. STL e-posta bağlantısının konusu sipariş numarasını içersin; son adım yeşil olsun.
- WhatsApp'a tüm sepeti, uygulanan fiyatları, cevapları, toplamları ve kontrol bağlantısını tek mesajda gönder. Mevcut ManyChat tetikleyici metnini koru; CRM'e tarama, teslimat ve fiyat katsayısını da gönder.
- Menüye eklenmeyen, arama motorlarına kapalı sipariş kontrol sayfasında güncel listeyi sipariş anındaki katsayıyla yeniden hesapla. Eşleşen toplam yeşil, farklı toplam ve bulunamayan ürün kırmızı gösterilsin.

## Teknik yaklaşım
- Mevcut `usePrices()` ve `sheetQuery` fiyat kaynağı olarak kalır. Ortak, saf bir hesaplama modülü ürün sayfası, sepet, ek parçalar, WhatsApp ve kontrol sayfasında kullanılır.
- Sepet yerel saklama kullanır; yeni sunucu veya ödeme sistemi eklenmez. Veri okuma/yazma hataları yakalanır ve saklanan/verilen sipariş verileri doğrulanır.
- Dil düzeni korunur: `/$lang/cart` ve `/$lang/check?o=...`; belgede istenen `/check?o=...` adresi dil sayfasına yönlendiren bir giriş olarak çalışır ve sipariş parametresini korur.
- Kontrol bağlantısı URL-güvenli biçimde sipariş tarihini, ürün/seçenek/renk/adet/diş bilgilerini, cevapları, görülen toplamları ve fiyat katsayısını taşır. Bu bağlantı fiyat karşılaştırmasıdır; ödeme veya sipariş doğruluğuna dair güvenli bir belge değildir.
- Türkçe/İngilizce metinler mevcut çeviri dosyalarında tutulur; yeni içerik sayfaları kendi başlık ve açıklamalarına sahip olur.

## Doğrulama
- Somut fiyat testleri: 4.990 TL −%30 = 3.490 TL; 7.490 TL −%20 = 5.990 TL; Çerçeve ×4 = 15.460 TL; barlı ×4 = 16.960 TL.
- Adet/diş sınırları, barın tek sefer hesaplanması, taşların diş başına hesaplanması, en pahalı parça, özel tasarımın indirimsiz toplamı, eksik cevaplar ve bozuk kontrol bağlantıları test edilir.
- Telefonda ve bilgisayarda üründen sepete, sorulardan özete, WhatsApp mesajından kontrol bağlantısına kadar gerçek akış doğrulanır.