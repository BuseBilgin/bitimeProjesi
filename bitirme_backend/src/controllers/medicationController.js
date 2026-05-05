const Medication = require('../models/Medication');
const interactionChecker = require('../services/interactionChecker');
const openFDAService = require('../services/openfda');

class MedicationController {
  async addMedication(req, res) {
    try {
      const userId = req.user.id;
      const medicationData = req.body;

      // Önce OpenFDA'dan ilaç bilgilerini al ve active_ingredient'i set et
      const drugInfo = await openFDAService.getDrugInfo(medicationData.name);
      if (drugInfo.found && drugInfo.active_ingredients && drugInfo.active_ingredients.length > 0) {
        // OpenFDA'dan gelen ilk etken maddeyi kullan
        medicationData.active_ingredient = drugInfo.active_ingredients[0];
      } else if (medicationData.active_ingredient) {
        // Eğer istek gövdesinde active_ingredient varsa onu kullan
        medicationData.active_ingredient = medicationData.active_ingredient.toLowerCase();
      } else {
        // Fallback: ilaç adını etken madde olarak kullan
        medicationData.active_ingredient = medicationData.name.toLowerCase();
      }

      // Etkileşim kontrolü
      const interactions = await interactionChecker.checkInteractions(userId, medicationData);

      // Alerji kontrolü
      const allergyAlerts = await interactionChecker.checkAllergies(userId, medicationData);

      // Tüm alert'leri birleştir
      const allAlerts = [...interactions, ...allergyAlerts];

      // Eğer uyarılar varsa logla
      if (allAlerts.length > 0) {
        console.log('Alerts detected while adding medication:', allAlerts);
      }

      const medicationId = await Medication.create({
        ...medicationData,
        user_id: userId,
        start_date: new Date().toISOString().split('T')[0], // Bugünün tarihi
        end_date: null
      });

      res.status(201).json({
        message: 'Medication added successfully',
        medicationId,
        alerts: allAlerts,
        note: allAlerts.length > 0
          ? 'Medication added with alerts. Please verify drug information.'
          : 'No alerts. Medication added successfully.'
      });
    } catch (error) {
      console.error('Add medication error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getMedications(req, res) {
    try {
      const userId = req.user.id;
      const medications = await Medication.findByUserId(userId);
      res.json(medications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateMedication(req, res) {
    try {
      const { id } = req.params;
      const medicationData = req.body;
      await Medication.update(id, medicationData);
      res.json({ message: 'Medication updated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteMedication(req, res) {
    try {
      const { id } = req.params;
      await Medication.delete(id);
      res.json({ message: 'Medication deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async searchDrugs(req, res) {
    try {
      const { query } = req.query;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }

      console.log(`[Medication Search] Searching for: ${query}`);

      // OpenFDA'da ilaç ara
      const drugInfo = await openFDAService.getDrugInfo(query);
      
      if (drugInfo.found && drugInfo.data) {
        // Brand name, generic name veya active ingredients bulundu
        const brandName = drugInfo.data.openfda?.brand_name?.[0] || query;
        const genericName = drugInfo.data.openfda?.generic_name?.[0] || null;
        const activeIngredients = drugInfo.active_ingredients || [];

        return res.json({
          found: true,
          data: {
            name: brandName,
            generic_name: genericName,
            active_ingredients: activeIngredients,
            source: 'openfda'
          }
        });
      }

      // OpenFDA'da bulunamadıysa, sadece kullanıcının sorgusu döndür
      console.log(`[Medication Search] No data found in OpenFDA for: ${query}`);
      res.json({
        found: false,
        data: {
          name: query,
          source: 'user_input'
        }
      });
    } catch (error) {
      console.error('Drug search error:', error);
      // Hata olsa bile kullanıcının yazdığı ismi döndür
      const { query } = req.query;
      res.json({
        found: false,
        data: {
          name: query || 'Unknown',
          source: 'user_input'
        }
      });
    }
  }

  // Yaygın ilaçları getir
  async getCommonDrugs(req, res) {
    try {
      const commonDrugs = [
        // Ağrı ve ateş
        { name: 'Parol', activeIngredient: 'parasetamol', category: 'Ağrı/Ateş' },
        { name: 'Aspirin', activeIngredient: 'asetilsalisilik asit', category: 'Ağrı/Ateş' },
        { name: 'Ibuprofen', activeIngredient: 'ibuprofen', category: 'Ağrı/Ateş' },
        { name: 'Voltaren', activeIngredient: 'diklofenaç', category: 'Ağrı/Ateş' },
        
        // Mide ve sindirim
        { name: 'Metpamid', activeIngredient: 'metoklopramid', category: 'Mide' },
        { name: 'Nexium', activeIngredient: 'esomeprazol', category: 'Mide' },
        { name: 'Pantozol', activeIngredient: 'pantoprazol', category: 'Mide' },
        { name: 'Gaviscon', activeIngredient: 'alüminyum hidroksit', category: 'Mide' },
        { name: 'Pepto-Bismol', activeIngredient: 'bismut subsalisilat', category: 'Mide' },
        
        // Antibiyotikler
        { name: 'Augmentin', activeIngredient: 'amoksisilin-klavulanik asit', category: 'Antibiyotik' },
        { name: 'Amoksisilin', activeIngredient: 'amoksisilin', category: 'Antibiyotik' },
        { name: 'Azitromisin', activeIngredient: 'azitromisin', category: 'Antibiyotik' },
        { name: 'Cipro', activeIngredient: 'siprofloksasin', category: 'Antibiyotik' },
        
        // Grip ve soğuk algınlığı
        { name: 'Sudafed', activeIngredient: 'pseudoefedrin', category: 'Grip/Soğuk' },
        { name: 'Vicks', activeIngredient: 'parasetamol', category: 'Grip/Soğuk' },
        { name: 'Flutirol', activeIngredient: 'pasetamol', category: 'Grip/Soğuk' },
        
        // Alerjiler
        { name: 'Tavegil', activeIngredient: 'klematistin fumarat', category: 'Alerji' },
        { name: 'Aerius', activeIngredient: 'desloratadin', category: 'Alerji' },
        { name: 'Allergodil', activeIngredient: 'azelastin', category: 'Alerji' },
        
        // Kalp ve tansiyon
        { name: 'Cordarone', activeIngredient: 'amiodaron', category: 'Kalp' },
        { name: 'Lisinopril', activeIngredient: 'lisinopril', category: 'Tansiyon' },
        { name: 'Valsartan', activeIngredient: 'valsartan', category: 'Tansiyon' },
        { name: 'Amlodipine', activeIngredient: 'amlodipine', category: 'Tansiyon' },
        { name: 'Metoprolol', activeIngredient: 'metoprolol', category: 'Kalp' },
        
        // Diyabet
        { name: 'Metformin', activeIngredient: 'metformin', category: 'Diyabet' },
        { name: 'Glibenklamid', activeIngredient: 'glibenklamid', category: 'Diyabet' },
        
        // Vitaminler ve Minerallar
        { name: 'B12', activeIngredient: 'siyanokobaliamin', category: 'Vitamin' },
        { name: 'D vitamini', activeIngredient: 'kolekalsifer', category: 'Vitamin' },
        { name: 'Magnesyum', activeIngredient: 'magnesyum', category: 'Mineral' },
        { name: 'Multivitamin', activeIngredient: 'karışık vitaminler', category: 'Vitamin' },
        
        // Uyku ve anksiyete
        { name: 'Lexotanil', activeIngredient: 'bromazepam', category: 'Anksiyete' },
        { name: 'Stilnox', activeIngredient: 'zolpidem', category: 'Uyku' },
        
        // Diğer
        { name: 'Heparin', activeIngredient: 'heparin', category: 'Kan' },
        { name: 'Warfarin', activeIngredient: 'warfarin', category: 'Kan' },
        { name: 'Captopril', activeIngredient: 'captopril', category: 'Tansiyon' },
      ];

      res.json({
        commonDrugs,
        total: commonDrugs.length
      });
    } catch (error) {
      console.error('Get common drugs error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // OpenFDA'dan tüm ilaçları al
  async getAllDrugs(req, res) {
    try {
      const drugs = await openFDAService.getAllDrugsFromAPI();
      res.json({
        drugs,
        total: drugs.length,
        source: 'OpenFDA Database'
      });
    } catch (error) {
      console.error('Get all drugs error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Tüm ilaçlar arasındaki etkileşimleri getir
  async getDrugInteractions(req, res) {
    try {
      const userId = req.user.id;
      const medications = await Medication.findByUserId(userId);

      if (!medications || medications.length === 0) {
        return res.json({
          medications: [],
          interactions: [],
          message: 'No medications found'
        });
      }

      const interactions = [];

      // Tüm ilaç çiftleri arasında etkileşim kontrol et
      for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
          const med1 = medications[i];
          const med2 = medications[j];

          // OpenFDA etkileşim kontrolü
          const openFDAResult = await openFDAService.checkInteraction(
            med1.active_ingredient.toLowerCase(),
            med2.active_ingredient.toLowerCase()
          );

          if (openFDAResult.hasInteraction) {
            interactions.push({
              medication1: {
                id: med1.id,
                name: med1.name,
                active_ingredient: med1.active_ingredient,
                dosage: med1.dosage,
                frequency: med1.frequency
              },
              medication2: {
                id: med2.id,
                name: med2.name,
                active_ingredient: med2.active_ingredient,
                dosage: med2.dosage,
                frequency: med2.frequency
              },
              type: 'interaction',
              description: openFDAResult.description,
              severity: openFDAResult.severity,
              source: openFDAResult.source
            });
          }

          // Bilinen etkileşimler kontrolü
          const knownResult = openFDAService.checkKnownInteractions(
            med1.active_ingredient.toLowerCase(),
            med2.active_ingredient.toLowerCase()
          );

          if (knownResult.hasInteraction) {
            interactions.push({
              medication1: {
                id: med1.id,
                name: med1.name,
                active_ingredient: med1.active_ingredient,
                dosage: med1.dosage,
                frequency: med1.frequency
              },
              medication2: {
                id: med2.id,
                name: med2.name,
                active_ingredient: med2.active_ingredient,
                dosage: med2.dosage,
                frequency: med2.frequency
              },
              type: 'interaction',
              description: knownResult.description,
              severity: knownResult.severity,
              source: knownResult.source
            });
          }
        }
      }

      res.json({
        medications,
        interactions,
        totalMedications: medications.length,
        totalInteractions: interactions.length,
        message: interactions.length === 0 
          ? 'No interactions found between medications'
          : `Found ${interactions.length} interaction(s) between medications`
      });
    } catch (error) {
      console.error('Get drug interactions error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MedicationController();