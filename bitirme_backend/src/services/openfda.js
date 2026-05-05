const axios = require('axios');
require('dotenv').config();

class OpenFDAService {
  constructor() {
    this.baseURL = process.env.OPENFDA_API_URL;
  }

  normalizeDrugName(drugName) {
    if (!drugName) return '';
    return drugName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, ' ') // Sadece alfanumerik ve boşluk tut
      .replace(/\s+/g, ' ')
      .trim();
  }

  buildSearchQueries(drugName) {
    const normalized = this.normalizeDrugName(drugName);
    const variants = [normalized];

    // Eğer birden fazla kelime varsa, sadece ilk kelimeyle de sorgula
    const firstWord = normalized.split(' ')[0];
    if (firstWord && firstWord !== normalized) {
      variants.push(firstWord);
    }

    // Potansiyel eşlemeler: brand/generic/substance/active_ingredient
    const fields = ['brand_name', 'generic_name', 'substance_name', 'openfda.substance_name', 'active_ingredient'];

    // Build query list
    return variants.flatMap(v => fields.map(field => `${field}:"${v}"`));
  }

  // İlaç bilgilerini OpenFDA'dan al
  async getDrugInfo(drugName) {
    const queries = this.buildSearchQueries(drugName);

    for (const query of queries) {
      try {
        const response = await axios.get(`${this.baseURL}/label.json`, {
          params: {
            search: query,
            limit: 3
          }
        });

        if (response.data.results && response.data.results.length > 0) {
          return {
            found: true,
            data: response.data.results[0],
            active_ingredients: this.extractActiveIngredients(response.data.results[0])
          };
        }
      } catch (error) {
        // Erişim reddi / limit / diğer hatalarda bir sonraki sorguya geç
        console.warn('OpenFDA Drug Info query failed:', query, error.message);
      }
    }

    return { found: false };
  }

  // Etken maddeleri çıkar
  extractActiveIngredients(drugData) {
    const ingredients = [];

    if (drugData.active_ingredient) {
      // Active ingredient'leri parse et
      const activeIngredients = Array.isArray(drugData.active_ingredient)
        ? drugData.active_ingredient
        : [drugData.active_ingredient];

      activeIngredients.forEach(ingredient => {
        // "Active ingredient (in each tablet) Aspirin 81 mg (NSAID)" formatını parse et
        // Önce "Active ingredient" kısmını çıkart
        let cleaned = ingredient.replace(/^Active\s+ingredient\s*\([^)]*\)\s*/i, '').trim();
        
        // Eğer hala boşsa, orijinal metni kullan
        if (!cleaned) {
          cleaned = ingredient.trim();
        }
        
        // Dosaj bilgisini (mg, g, vb) ve parantez içini çıkart
        const match = cleaned.match(/^([a-zA-Z\s]+?)(?:\s+USP)?(?:\s*,?\s*\d+\s*(?:mg|g|mcg|iu|unit|%))?/i);
        if (match && match[1]) {
          const ingredientName = match[1].trim().toLowerCase();
          if (ingredientName && ingredientName.length > 2) {
            ingredients.push(ingredientName);
          }
        } else if (cleaned.length > 2) {
          // Fallback: temiz metni kullan
          const fallback = cleaned.split(/[\(\[\{]/)[0].trim().toLowerCase();
          if (fallback && fallback.length > 2) {
            ingredients.push(fallback);
          }
        }
      });
    }

    return ingredients;
  }

  // İki ilaç arasındaki etkileşimi kontrol et
  async checkInteraction(drug1, drug2) {
    try {
      // OpenFDA Adverse Events API'sini kullanarak etkileşim ara
      const drug1Norm = this.normalizeDrugName(drug1);
      const drug2Norm = this.normalizeDrugName(drug2);
      const response = await axios.get(`${this.baseURL}/event.json`, {
        params: {
          search: `patient.drug.medicinalproduct:"${drug1Norm}" AND patient.drug.medicinalproduct:"${drug2Norm}"`,
          count: 'seriousnesscongenitalanomali',
          limit: 1
        }
      });

      // Eğer sonuç varsa potansiyel etkileşim var
      if (response.data.results && response.data.results.length > 0) {
        return {
          hasInteraction: true,
          severity: 'moderate',
          description: `Potential interaction between ${drug1} and ${drug2} detected in adverse events data`,
          source: 'OpenFDA Adverse Events'
        };
      }

      return { hasInteraction: false };
    } catch (error) {
      console.error('OpenFDA Interaction check error:', error.message);
      return { hasInteraction: false };
    }
  }

  // Bilinen kritik etkileşimleri kontrol et (fallback)
  checkKnownInteractions(drug1, drug2) {
    const knownInteractions = {
      'warfarin': {
        'aspirin': { severity: 'high', description: 'Increased risk of bleeding' },
        'ibuprofen': { severity: 'high', description: 'Increased risk of bleeding' },
        'amiodarone': { severity: 'high', description: 'Increased warfarin effect' }
      },
      'digoxin': {
        'quinidine': { severity: 'high', description: 'Increased digoxin levels' },
        'verapamil': { severity: 'moderate', description: 'Increased digoxin levels' }
      },
      'lithium': {
        'furosemide': { severity: 'high', description: 'Increased lithium toxicity' },
        'nsaids': { severity: 'moderate', description: 'Increased lithium levels' }
      }
    };

    const drug1Lower = drug1.toLowerCase();
    const drug2Lower = drug2.toLowerCase();

    // drug1'in etkileşimlerinde drug2 var mı kontrol et
    if (knownInteractions[drug1Lower] && knownInteractions[drug1Lower][drug2Lower]) {
      return {
        hasInteraction: true,
        ...knownInteractions[drug1Lower][drug2Lower],
        source: 'Known Interactions Database'
      };
    }

    // drug2'nin etkileşimlerinde drug1 var mı kontrol et
    if (knownInteractions[drug2Lower] && knownInteractions[drug2Lower][drug1Lower]) {
      return {
        hasInteraction: true,
        ...knownInteractions[drug2Lower][drug1Lower],
        source: 'Known Interactions Database'
      };
    }

    return { hasInteraction: false };
  }

  // Tüm ilaçları OpenFDA'dan getir (1000+ ilaç)
  async getAllDrugsFromAPI() {
    try {
      console.log('🔍 Fetching all drugs from OpenFDA...');
      const drugs = [];
      const limit = 100; // Her sayfa 100 ilaç
      const maxPages = 10; // Maksimum 10 sayfa = 1000 ilaç
      
      for (let page = 0; page < maxPages; page++) {
        const skip = page * limit;
        
        try {
          const response = await axios.get(`${this.baseURL}/label.json`, {
            params: {
              limit: limit,
              skip: skip
            },
            timeout: 10000
          });

          if (!response.data.results || response.data.results.length === 0) {
            console.log(`✅ No more drugs found at page ${page}`);
            break;
          }

          console.log(`📄 Processing page ${page + 1}: Found ${response.data.results.length} drugs`);
          
          response.data.results.forEach(result => {
            try {
              const brandNames = result.openfda?.brand_name || [];
              const genericNames = result.openfda?.generic_name || [];
              const manufacturer = result.openfda?.manufacturer_name?.[0] || 'Unknown';
              const activeIngredients = this.extractActiveIngredients(result);

              // Brand name ile kayıt oluştur
              if (brandNames.length > 0) {
                brandNames.forEach((brand) => {
                  if (!drugs.find(d => d.name.toLowerCase() === brand.toLowerCase())) {
                    drugs.push({
                      name: brand,
                      genericName: genericNames[0] || '',
                      activeIngredients: activeIngredients,
                      manufacturer: manufacturer
                    });
                  }
                });
              }

              // Generic name ile de kayıt oluştur (sadece brand yoksa)
              if (genericNames.length > 0 && brandNames.length === 0) {
                genericNames.forEach((generic) => {
                  if (!drugs.find(d => d.name.toLowerCase() === generic.toLowerCase())) {
                    drugs.push({
                      name: generic,
                      genericName: generic,
                      activeIngredients: activeIngredients,
                      manufacturer: manufacturer
                    });
                  }
                });
              }
            } catch (error) {
              // Devam et, bir ilaç parse başarısız olursa diğerlerine geç
            }
          });
        } catch (pageError) {
          console.warn(`⚠️ Error fetching page ${page}:`, pageError.message);
          if (page === 0) {
            // İlk sayfada hata varsa bırak
            throw pageError;
          }
          // Sonraki sayfada hata varsa devam et
          break;
        }
      }

      console.log(`✅ Processed ${drugs.length} unique drugs from OpenFDA`);
      return drugs;
    } catch (error) {
      console.error('❌ Error fetching from OpenFDA:', error.message);
      return [];
    }
  }
}

module.exports = new OpenFDAService();