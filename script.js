// Scroll Progress Bar
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.appendChild(scrollProgress);

window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    scrollProgress.style.width = `${scrolled}%`;
});

// AOS (Animate On Scroll) başlatma
AOS.init({
    duration: 1000,
    once: true,
    mirror: true
});

document.addEventListener('DOMContentLoaded', () => {
    // Sepet işlemleri
    let sepetSayi = 0;
    let sepetUrunler = [];
    const sepetSayiElement = document.querySelector('.sepet-sayi');
    const sepeteEkleButtons = document.querySelectorAll('.sepete-ekle');
    const sepetModal = document.getElementById('sepetModal');
    const sepetKapatBtn = document.querySelector('.kapat-btn');
    const sepetButon = document.getElementById('sepetButon');

    // Debug için elementleri kontrol et
    console.log('Sepet Butonu:', sepetButon);
    console.log('Sepet Modal:', sepetModal);
    console.log('Sepet Kapatma Butonu:', sepetKapatBtn);

    // Sepet butonuna tıklama
    if (sepetButon) {
        sepetButon.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Sepet butonuna tıklandı');
            
            if (sepetModal) {
                sepetModal.style.display = 'block';
                setTimeout(() => {
                    sepetModal.classList.add('active');
                    const modalContent = sepetModal.querySelector('.sepet-modal-content');
                    if (modalContent) {
                        modalContent.style.opacity = '1';
                    }
                }, 10);
                guncelleSepetiGoster();
            }
        });
    }

    // Sepeti kapatma
    if (sepetKapatBtn) {
        sepetKapatBtn.addEventListener('click', () => {
            const modalContent = sepetModal.querySelector('.sepet-modal-content');
            if (modalContent) {
                modalContent.style.opacity = '0';
            }
            sepetModal.classList.remove('active');
            setTimeout(() => {
                sepetModal.style.display = 'none';
            }, 300);
        });
    }

    // Dışarı tıklayınca sepeti kapatma
    if (sepetModal) {
        sepetModal.addEventListener('click', (e) => {
            if (e.target === sepetModal) {
                sepetKapatBtn.click();
            }
        });
    }

    // Sepete ürün ekleme
    sepeteEkleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const urunKarti = button.closest('.urun-karti');
            const urun = {
                id: Date.now(),
                isim: urunKarti.querySelector('h3').textContent,
                fiyat: urunKarti.querySelector('.fiyat').textContent,
                resim: urunKarti.querySelector('img').src
            };
            
            sepetUrunler.push(urun);
            sepetSayi++;
            sepetSayiElement.textContent = sepetSayi;
            
            // Animasyonlu bildirim
            bildirimGoster(`${urun.isim} sepete eklendi!`);
            
            // Sepet ikonu animasyonu
            const sepetIconElement = sepetButon.querySelector('i');
            if (sepetIconElement) {
                sepetIconElement.style.animation = 'bounce 0.5s ease';
                setTimeout(() => {
                    sepetIconElement.style.animation = '';
                }, 500);
            }
            
            guncelleSepetiGoster();
        });
    });

    // Sepeti güncelleme ve gösterme
    function guncelleSepetiGoster() {
        const sepetContainer = document.querySelector('.sepet-urunler');
        const toplamElement = document.querySelector('.toplam-fiyat');
        const checkoutBtn = document.querySelector('.checkout-btn');
        
        if (!sepetContainer || !toplamElement) return;
        
        sepetContainer.innerHTML = '';
        let toplam = 0;
        let siparisMetni = 'Merhaba, aşağıdaki ürünleri sipariş etmek istiyorum:\n\n';
        
        sepetUrunler.forEach(urun => {
            const fiyat = parseFloat(urun.fiyat.replace('₺', ''));
            toplam += fiyat;
            
            // WhatsApp mesajı için sipariş metnine ürün ekle
            siparisMetni += `• ${urun.isim} - ${urun.fiyat}\n`;
            
            const urunElement = document.createElement('div');
            urunElement.className = 'sepet-urun';
            urunElement.innerHTML = `
                <img src="${urun.resim}" alt="${urun.isim}">
                <div class="sepet-urun-detay">
                    <h4>${urun.isim}</h4>
                    <span class="sepet-urun-fiyat">${urun.fiyat}</span>
                </div>
                <button class="sepet-urun-sil" data-id="${urun.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            sepetContainer.appendChild(urunElement);
            
            // Yeni eklenen ürüne animasyon ekle
            urunElement.style.animation = 'slideIn 0.3s ease forwards';
        });
        
        toplamElement.textContent = `₺${toplam.toFixed(2)}`;
        siparisMetni += `\nToplam Tutar: ₺${toplam.toFixed(2)}`;

        // Müşteri bilgileri için form
        const musteriBilgileri = document.createElement('div');
        musteriBilgileri.className = 'musteri-bilgileri';
        musteriBilgileri.innerHTML = `
            <div class="form-grup">
                <label for="musteriAd">Adınız:</label>
                <input type="text" id="musteriAd" placeholder="Adınız" required>
            </div>
            <div class="form-grup">
                <label for="musteriSoyad">Soyadınız:</label>
                <input type="text" id="musteriSoyad" placeholder="Soyadınız" required>
            </div>
        `;

        // Teslimat adresi için input ekle
        const adresInput = document.createElement('div');
        adresInput.className = 'adres-input';
        adresInput.innerHTML = `
            <label for="teslimatAdresi">Teslimat Adresi:</label>
            <textarea id="teslimatAdresi" placeholder="Lütfen teslimat adresinizi girin" required></textarea>
        `;

        // Ödeme seçenekleri için radio butonlar ekle
        const odemeSecenekleri = document.createElement('div');
        odemeSecenekleri.className = 'odeme-secenekleri';
        odemeSecenekleri.innerHTML = `
            <label class="odeme-baslik">Ödeme Şekli:</label>
            <div class="odeme-secenekleri-grup">
                <div class="odeme-secenek">
                    <input type="radio" id="havale" name="odemeSekli" value="Havale/EFT" required>
                    <label for="havale">
                        <i class="fas fa-university"></i>
                        Havale/EFT
                        <span class="iban">TR12 3456 7890 1234 5678 9012 34</span>
                    </label>
                </div>
                <div class="odeme-secenek">
                    <input type="radio" id="kapidaNakit" name="odemeSekli" value="Kapıda Nakit">
                    <label for="kapidaNakit">
                        <i class="fas fa-money-bill-wave"></i>
                        Kapıda Nakit
                    </label>
                </div>
                <div class="odeme-secenek">
                    <input type="radio" id="kapidaKart" name="odemeSekli" value="Kapıda Kart">
                    <label for="kapidaKart">
                        <i class="fas fa-credit-card"></i>
                        Kapıda Kart
                    </label>
                </div>
            </div>
        `;
        
        // Eğer müşteri bilgileri alanı yoksa ekle
        if (!document.querySelector('.musteri-bilgileri')) {
            sepetContainer.parentElement.insertBefore(musteriBilgileri, document.querySelector('.sepet-toplam'));
            sepetContainer.parentElement.insertBefore(adresInput, document.querySelector('.sepet-toplam'));
            sepetContainer.parentElement.insertBefore(odemeSecenekleri, document.querySelector('.sepet-toplam'));
        }

        // Checkout butonunu güncelle
        if (checkoutBtn) {
            checkoutBtn.innerHTML = `
                <i class="fab fa-whatsapp"></i>
                WhatsApp ile Sipariş Ver
            `;
            
            checkoutBtn.addEventListener('click', () => {
                const musteriAd = document.getElementById('musteriAd');
                const musteriSoyad = document.getElementById('musteriSoyad');
                const teslimatAdresi = document.getElementById('teslimatAdresi');
                const secilenOdeme = document.querySelector('input[name="odemeSekli"]:checked');
                
                if (!musteriAd || !musteriAd.value.trim()) {
                    bildirimGoster('Lütfen adınızı girin!');
                    return;
                }

                if (!musteriSoyad || !musteriSoyad.value.trim()) {
                    bildirimGoster('Lütfen soyadınızı girin!');
                    return;
                }

                if (!teslimatAdresi || !teslimatAdresi.value.trim()) {
                    bildirimGoster('Lütfen teslimat adresini girin!');
                    return;
                }

                if (!secilenOdeme) {
                    bildirimGoster('Lütfen bir ödeme şekli seçin!');
                    return;
                }

                if (sepetUrunler.length === 0) {
                    bildirimGoster('Sepetiniz boş!');
                    return;
                }
                
                // WhatsApp mesajına müşteri bilgilerini ekle
                siparisMetni = `Merhaba, ben ${musteriAd.value.trim()} ${musteriSoyad.value.trim()}\n\nAşağıdaki ürünleri sipariş etmek istiyorum:\n\n${siparisMetni.split('\n').slice(2).join('\n')}`;
                siparisMetni += `\n\nTeslimat Adresi:\n${teslimatAdresi.value.trim()}`;
                siparisMetni += `\n\nÖdeme Şekli: ${secilenOdeme.value}`;
                
                // Eğer havale seçildiyse IBAN'ı da ekle
                if (secilenOdeme.value === 'Havale/EFT') {
                    siparisMetni += '\nIBAN: TR12 3456 7890 1234 5678 9012 34';
                }
                
                // Telefon numarasını düzelt
                const telefonNumarasi = '90' + '123456789';
                
                // Mobil cihaz kontrolü
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                
                // Cihaz tipine göre WhatsApp URL'i oluştur
                const whatsappUrl = isMobile
                    ? `whatsapp://send?phone=${telefonNumarasi}&text=${encodeURIComponent(siparisMetni)}`
                    : `https://web.whatsapp.com/send?phone=${telefonNumarasi}&text=${encodeURIComponent(siparisMetni)}`;
                
                // Yeni sekmede WhatsApp'ı aç
                window.open(whatsappUrl, '_blank');

                // Mobil cihazlarda WhatsApp yüklü değilse Play Store/App Store'a yönlendir
                if (isMobile) {
                    setTimeout(() => {
                        // Eğer WhatsApp açılmadıysa
                        const appStoreUrl = /iPhone|iPad|iPod/i.test(navigator.userAgent)
                            ? 'https://apps.apple.com/app/whatsapp-messenger/id310633997'
                            : 'https://play.google.com/store/apps/details?id=com.whatsapp';
                            
                        window.location.href = appStoreUrl;
                    }, 2000); // 2 saniye bekle
                }
                
                // Sepeti temizle
                sepetUrunler = [];
                sepetSayi = 0;
                sepetSayiElement.textContent = '0';
                
                // Modalı kapat
                sepetKapatBtn.click();
                
                // Bildirim göster
                bildirimGoster('Siparişiniz WhatsApp üzerinden iletildi!');
            });
        }
        
        // Ürün silme butonlarını aktifleştir
        document.querySelectorAll('.sepet-urun-sil').forEach(btn => {
            btn.addEventListener('click', () => {
                const urunId = parseInt(btn.dataset.id);
                const silinecekUrun = btn.closest('.sepet-urun');
                
                // Silme animasyonu
                silinecekUrun.style.animation = 'slideOut 0.3s ease forwards';
                
                setTimeout(() => {
                    sepetUrunler = sepetUrunler.filter(urun => urun.id !== urunId);
                    sepetSayi--;
                    sepetSayiElement.textContent = sepetSayi;
                    guncelleSepetiGoster();
                    bildirimGoster('Ürün sepetten kaldırıldı!');
                }, 300);
            });
        });
    }

    // Yorum işlemleri
    const yorumForm = document.getElementById('yorumForm');
    const yildizSecici = document.querySelector('.yildiz-secici');
    const yildizlar = yildizSecici.querySelectorAll('i');
    const mevcutYorumlar = document.querySelector('.mevcut-yorumlar');
    let secilenPuan = 0;

    // Yıldız seçme işlemi
    yildizlar.forEach((yildiz, index) => {
        yildiz.addEventListener('mouseover', () => {
            // Hover efekti
            for (let i = 0; i <= index; i++) {
                yildizlar[i].classList.remove('far');
                yildizlar[i].classList.add('fas');
                yildizlar[i].style.color = '#ffd700';
            }
        });

        yildiz.addEventListener('mouseout', () => {
            // Seçili olmayan yıldızları resetle
            yildizlar.forEach((y, i) => {
                if (i >= secilenPuan) {
                    y.classList.remove('fas');
                    y.classList.add('far');
                    y.style.color = '#ddd';
                }
            });
        });

        yildiz.addEventListener('click', () => {
            secilenPuan = index + 1;
            // Tıklanan yıldıza kadar olan tüm yıldızları seç
            yildizlar.forEach((y, i) => {
                if (i < secilenPuan) {
                    y.classList.remove('far');
                    y.classList.add('fas');
                    y.style.color = '#ffd700';
                } else {
                    y.classList.remove('fas');
                    y.classList.add('far');
                    y.style.color = '#ddd';
                }
            });
        });
    });

    // Yorum gönderme işlemi
    yorumForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (secilenPuan === 0) {
            bildirimGoster('Lütfen bir puan seçin!');
            return;
        }

        const isim = document.getElementById('isim').value;
        const yorum = document.getElementById('yorum').value;

        // Yeni yorum kartı oluştur
        const yorumKarti = document.createElement('div');
        yorumKarti.className = 'yorum-karti';
        yorumKarti.setAttribute('data-aos', 'fade-up');
        yorumKarti.innerHTML = `
            <div class="yorum-baslik">
                <h3>${isim}</h3>
                <div class="yildizlar">
                    ${Array(5).fill().map((_, i) => `
                        <i class="fas fa-star" style="color: ${i < secilenPuan ? '#ffd700' : '#ddd'}"></i>
                    `).join('')}
                </div>
            </div>
            <p class="yorum-metni">${yorum}</p>
        `;

        // Yorumu en başa ekle
        mevcutYorumlar.insertBefore(yorumKarti, mevcutYorumlar.firstChild);

        // Formu temizle
        yorumForm.reset();
        secilenPuan = 0;
        yildizlar.forEach(y => {
            y.classList.remove('fas');
            y.classList.add('far');
            y.style.color = '#ddd';
        });

        // Bildirim göster
        bildirimGoster('Yorumunuz başarıyla eklendi!');
    });
});

// Kategori filtreleme
const kategoriButtons = document.querySelectorAll('.kategori-btn');
const urunKartlari = document.querySelectorAll('.urun-karti');

// Sayfa yüklendiğinde tüm ürünleri göster
urunKartlari.forEach(kart => {
    kart.classList.add('active');
});

kategoriButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Aktif buton stilini güncelle
        kategoriButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const secilenKategori = button.getAttribute('data-kategori');
        
        // Ürünleri filtrele
        urunKartlari.forEach(kart => {
            const kartKategori = kart.getAttribute('data-kategori');
            kart.classList.remove('active');
            
            if (secilenKategori === 'hepsi' || secilenKategori === kartKategori) {
                setTimeout(() => {
                    kart.classList.add('active');
                }, 10);
            }
        });
    });
});

// Bildirim gösterme fonksiyonu
function bildirimGoster(mesaj) {
    const eskiBildirim = document.querySelector('.bildirim');
    if (eskiBildirim) {
        eskiBildirim.remove();
    }
    
    const bildirim = document.createElement('div');
    bildirim.className = 'bildirim';
    bildirim.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #ff6b6b;
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        animation: slideIn 0.5s ease-out;
        z-index: 1000;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    `;
    
    bildirim.textContent = mesaj;
    document.body.appendChild(bildirim);
    
    setTimeout(() => {
        bildirim.style.animation = 'slideOut 0.5s ease-out';
        setTimeout(() => {
            bildirim.remove();
        }, 500);
    }, 3000);
}

// Smooth scroll için
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form gönderimi
const contactForm = document.querySelector('.iletisim-formu');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form verilerini al
        const formData = new FormData(this);
        const formValues = Object.fromEntries(formData.entries());
        
        // Başarılı gönderim bildirimi
        bildirimGoster('Mesajınız başarıyla gönderildi!');
        
        // Formu temizle
        this.reset();
    });
}

// Sayfa yüklendiğinde animasyon
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Bildirim animasyonları için CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
