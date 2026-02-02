import { describe, expect, it } from "vitest";

describe("AviationStack API Key Validation", () => {
  it("should have a valid AVIATIONSTACK_API_KEY", async () => {
    const apiKey = process.env.AVIATIONSTACK_API_KEY;
    
    // API anahtarının tanımlı olduğunu kontrol et
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    
    // API'ye basit bir istek gönder
    const response = await fetch(
      `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&limit=1`
    );
    
    const data = await response.json();
    
    // API yanıtının hata içermediğini kontrol et
    if (data.error) {
      console.error("API Error:", data.error);
      throw new Error(`AviationStack API hatası: ${data.error.message || data.error.info || "Bilinmeyen hata"}`);
    }
    
    // Başarılı yanıt kontrolü
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);
  });
});
