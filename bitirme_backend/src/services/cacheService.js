// src/services/cacheService.js
// Disk-based caching - OpenFDA API sonuçlarını ve etkileşimleri cache'le

const fs = require('fs/promises');
const path = require('path');

class CacheService {
  constructor() {
    this.interactionCache = new Map();
    this.drugInfoCache = new Map();
    this.cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 gün
    this.cachePath = path.join(__dirname, '../../data/cache');
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    await this.loadCaches();
    this.initialized = true;
  }

  async loadCaches() {
    try {
      // İnteraksiyon cache'i yükle
      const interactionCachePath = path.join(this.cachePath, 'interactions.json');
      const interactionData = await fs.readFile(interactionCachePath, 'utf8');
      const parsed = JSON.parse(interactionData);

      for (const [key, value] of Object.entries(parsed)) {
        if (Date.now() - value.timestamp < this.cacheExpiry) {
          this.interactionCache.set(key, value.data);
        }
      }
      console.log(`✅ Yüklenen cached interactions: ${this.interactionCache.size}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('⚠️ Cache dosyası bulunamadı, temiz başlıyoruz');
      } else {
        console.error('❌ Cache yükleme hatası:', error.message);
      }
    }

    try {
      // Drug info cache'i yükle
      const drugCachePath = path.join(this.cachePath, 'drugs.json');
      const drugData = await fs.readFile(drugCachePath, 'utf8');
      const parsed = JSON.parse(drugData);

      for (const [key, value] of Object.entries(parsed)) {
        if (Date.now() - value.timestamp < this.cacheExpiry) {
          this.drugInfoCache.set(key, value.data);
        }
      }
      console.log(`✅ Yüklenen cached drugs: ${this.drugInfoCache.size}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('❌ Drug cache yükleme hatası:', error.message);
      }
    }
  }

  async saveCaches() {
    try {
      await fs.mkdir(this.cachePath, { recursive: true });

      // İnteraksiyon cache'i kaydet
      const interactionData = {};
      for (const [key, value] of this.interactionCache) {
        interactionData[key] = {
          data: value,
          timestamp: Date.now()
        };
      }

      await fs.writeFile(
        path.join(this.cachePath, 'interactions.json'),
        JSON.stringify(interactionData, null, 2)
      );

      // Drug cache'i kaydet
      const drugData = {};
      for (const [key, value] of this.drugInfoCache) {
        drugData[key] = {
          data: value,
          timestamp: Date.now()
        };
      }

      await fs.writeFile(
        path.join(this.cachePath, 'drugs.json'),
        JSON.stringify(drugData, null, 2)
      );
    } catch (error) {
      console.error('❌ Cache kayıt hatası:', error);
    }
  }

  /**
   * İnteraksiyon cache key oluştur
   * @param {string} drug1 - İlk ilaç (etken madde)
   * @param {string} drug2 - İkinci ilaç (etken madde)
   * @returns {string} - Cache key
   */
  getInteractionCacheKey(drug1, drug2) {
    const sorted = [
      String(drug1).toLowerCase().trim(),
      String(drug2).toLowerCase().trim()
    ].sort();
    return `interaction:${sorted.join('||')}`;
  }

  /**
   * Drug info cache key oluştur
   * @param {string} drugName - İlaç adı
   * @returns {string} - Cache key
   */
  getDrugCacheKey(drugName) {
    return `drug:${String(drugName).toLowerCase().trim()}`;
  }

  /**
   * Cache'den ilaç etkileşimi al
   * @param {string} drug1
   * @param {string} drug2
   * @returns {object|null} - Cache data veya null
   */
  getInteractionCached(drug1, drug2) {
    const key = this.getInteractionCacheKey(drug1, drug2);
    return this.interactionCache.get(key) || null;
  }

  /**
   * Cache'e ilaç etkileşimi kaydet
   * @param {string} drug1
   * @param {string} drug2
   * @param {object} data - Etkileşim verisi
   */
  setInteractionCached(drug1, drug2, data) {
    const key = this.getInteractionCacheKey(drug1, drug2);
    this.interactionCache.set(key, data);

    // Async save (fire-and-forget) - performans için
    this.saveCaches().catch(err => {
      console.error('❌ Async cache save başarısız:', err);
    });
  }

  /**
   * Cache'den ilaç bilgisi al
   * @param {string} drugName
   * @returns {object|null} - Cache data veya null
   */
  getDrugInfoCached(drugName) {
    const key = this.getDrugCacheKey(drugName);
    return this.drugInfoCache.get(key) || null;
  }

  /**
   * Cache'e ilaç bilgisi kaydet
   * @param {string} drugName
   * @param {object} data - İlaç verisi
   */
  setDrugInfoCached(drugName, data) {
    const key = this.getDrugCacheKey(drugName);
    this.drugInfoCache.set(key, data);

    // Async save (fire-and-forget)
    this.saveCaches().catch(err => {
      console.error('❌ Async cache save başarısız:', err);
    });
  }

  /**
   * Cache istatistikleri
   */
  getStats() {
    return {
      interactionsCached: this.interactionCache.size,
      drugsCached: this.drugInfoCache.size,
      totalCached: this.interactionCache.size + this.drugInfoCache.size
    };
  }

  /**
   * Tüm cache'i temizle
   */
  async clearAll() {
    this.interactionCache.clear();
    this.drugInfoCache.clear();
    await this.saveCaches();
    console.log('✅ Tüm cache temizlendi');
  }
}

module.exports = new CacheService();
