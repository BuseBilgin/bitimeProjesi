// src/services/interactionChecker.js - GÜNCELLENMIŞ VERSİYON
// N+1 problemini çözen optimized etkileşim checker

const Medication = require('../models/Medication');
const openFDAService = require('./openfda');
const cacheService = require('./cacheService');

class InteractionChecker {
  constructor() {
    this.maxOpenFDAChecksPerRequest = 5; // Maksimum 5 OpenFDA çağrısı per request
  }

  /**
   * Ana etkileşim kontrol metodu - O(1) + Cache ile optimize edilmiş
   * @param {number} userId - Kullanıcı ID
   * @param {object} newMedication - Yeni eklenen ilaç
   * @returns {array} - Etkileşim listesi
   */
  async checkInteractions(userId, newMedication) {
    // 1. Kullanıcının mevcut ilaçlarını al
    const userMedications = await Medication.findByUserId(userId);
    const activeIngredients = new Map();
    const interactions = [];

    // 2. Hash Map oluştur - O(1) lookup için
    userMedications.forEach(med => {
      // Geçersiz etken maddeleri filtrele
      if (med.active_ingredient && 
          med.active_ingredient.trim().length > 0 &&
          med.active_ingredient.toLowerCase() !== 'active ingredient') {
        activeIngredients.set(med.active_ingredient.toLowerCase(), med);
      }
    });

    const newIngredient = newMedication.active_ingredient.toLowerCase();

    // ✅ ADIM 1: Duplicate kontrolü - O(1)
    if (activeIngredients.has(newIngredient)) {
      console.log(`⚠️ DUPLICATE: ${newIngredient}`);
      interactions.push({
        medication: activeIngredients.get(newIngredient),
        type: 'duplicate',
        description: `${newMedication.name} zaten alınan ilaçlarla aynı etken maddeyi içeriyor`,
        severity: 'high'
      });
      return interactions; // Duplicate varsa hemen dön, başka kontrol yapma
    }

    // ✅ ADIM 2: Bilinen etkileşimleri kontrol et (cache'ten, fast)
    for (const [ingredient, med] of activeIngredients) {
      const knownResult = openFDAService.checkKnownInteractions(ingredient, newIngredient);
      if (knownResult.hasInteraction) {
        console.log(`🔴 KNOWN INTERACTION: ${ingredient} + ${newIngredient}`);
        interactions.push({
          medication: med,
          type: 'interaction',
          description: knownResult.description,
          severity: knownResult.severity,
          source: 'Bilinen Etkileşimler Veritabanı'
        });
      }
    }

    // ✅ ADIM 3: OpenFDA veritabanı kontrolü (optional, yavaş)
    // Eğer ilaç sayısı çok fazla ise, OpenFDA'ya istek yapma (performans için)
    if (activeIngredients.size <= this.maxOpenFDAChecksPerRequest) {
      console.log(`🔍 OpenFDA checking ${activeIngredients.size} drugs...`);
      
      // Paralel olarak OpenFDA kontrolü yap (concurrency)
      const promises = [];
      
      for (const [ingredient, med] of activeIngredients) {
        promises.push(
          this.checkOpenFDAWithCacheAsync(ingredient, newIngredient)
            .then(result => {
              if (result.hasInteraction) {
                console.log(`🟠 OPENFDA INTERACTION: ${ingredient} + ${newIngredient}`);
                interactions.push({
                  medication: med,
                  type: 'interaction',
                  description: result.description,
                  severity: result.severity,
                  source: result.source
                });
              }
            })
            .catch(err => {
              console.warn(`⚠️ OpenFDA check başarısız (${ingredient}):`, err.message);
              // OpenFDA hatalı olursa devam et (graceful degradation)
            })
        );
      }

      // Tüm paralel çağrıları bekle
      await Promise.allSettled(promises);
    } else {
      console.log(`⏭️ OpenFDA kontrolü atlanıyor (${activeIngredients.size} > ${this.maxOpenFDAChecksPerRequest})`);
    }

    // ✅ ADIM 4: OpenFDA'dan ilaç doğrulaması
    console.log(`🔍 Validating drug: ${newMedication.name}`);
    const drugInfo = await openFDAService.getDrugInfo(newMedication.name);

    if (!drugInfo.found) {
      interactions.push({
        type: 'warning',
        description: `"${newMedication.name}" FDA veritabanında bulunamadı. Lütfen ilaç adını doğrulayınız.`,
        severity: 'medium'
      });
    } else {
      console.log(`✅ Drug validated: ${drugInfo.active_ingredients.join(', ')}`);
    }

    return interactions;
  }

  /**
   * OpenFDA etkileşim kontrolü - Cache ile
   * @private
   * @param {string} drug1 - İlk ilaç
   * @param {string} drug2 - İkinci ilaç
   * @returns {object} - Etkileşim sonucu
   */
  async checkOpenFDAWithCacheAsync(drug1, drug2) {
    // Cache'de var mı kontrol et
    const cached = cacheService.getInteractionCached(drug1, drug2);
    if (cached !== null) {
      console.log(`💾 Cache HIT: ${drug1} + ${drug2}`);
      return cached;
    }

    console.log(`🌐 OpenFDA API: ${drug1} + ${drug2}`);
    
    try {
      // OpenFDA'ya istek yap
      const result = await openFDAService.checkInteraction(drug1, drug2);
      
      // Sonucu cache'le
      cacheService.setInteractionCached(drug1, drug2, result);
      
      return result;
    } catch (error) {
      console.error(`❌ OpenFDA error: ${error.message}`);
      
      // Fallback: güvenli sonuç dön (interaction var mı bilinemedi)
      return {
        hasInteraction: false,
        severity: 'unknown',
        description: 'OpenFDA erişim hatası. Etkileşim kontrolü yapılamadı.',
        source: 'OpenFDA (Error)'
      };
    }
  }

  /**
   * Kullanıcının alerjilerini kontrol et
   * @param {number} userId - Kullanıcı ID
   * @param {object} newMedication - Yeni ilaç
   * @returns {array} - Alerji uyarıları
   */
  async checkAllergies(userId, newMedication) {
    try {
      const User = require('../models/User');
      const user = await User.findById(userId);

      if (!user || !user.allergies) {
        return [];
      }

      const allergies = Array.isArray(user.allergies)
        ? user.allergies
        : JSON.parse(user.allergies || '[]');

      const newIngredient = newMedication.active_ingredient.toLowerCase();
      const newMedicationName = newMedication.name.toLowerCase();
      const allergyAlerts = [];

      for (const allergy of allergies) {
        const allergyLower = String(allergy).toLowerCase();

        // Etken madde içinde alerji var mı?
        if (newIngredient.includes(allergyLower) || 
            allergyLower.includes(newIngredient)) {
          allergyAlerts.push({
            type: 'allergy',
            description: `⚠️ Uyarı: Hasta ${allergy}'e alerjik. ${newMedication.name} uygun olmayabilir.`,
            severity: 'high',
            allergen: allergy,
            source: 'Ingredient'
          });
        }

        // İlaç adında alerji var mı?
        if (newMedicationName.includes(allergyLower)) {
          allergyAlerts.push({
            type: 'allergy',
            description: `⚠️ Uyarı: Hasta ${allergy}'e alerjik. ${newMedication.name} ismi içeriyor.`,
            severity: 'high',
            allergen: allergy,
            source: 'Name'
          });
        }
      }

      // Duplicates temizle
      const uniqueAlerts = [];
      const seen = new Set();
      for (const alert of allergyAlerts) {
        const key = `${alert.allergen}:${alert.source}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueAlerts.push(alert);
        }
      }

      return uniqueAlerts;
    } catch (error) {
      console.error('❌ Alerji kontrol hatası:', error);
      return [];
    }
  }

  /**
   * Cache istatistikleri
   */
  getCacheStats() {
    return cacheService.getStats();
  }
}

module.exports = new InteractionChecker();