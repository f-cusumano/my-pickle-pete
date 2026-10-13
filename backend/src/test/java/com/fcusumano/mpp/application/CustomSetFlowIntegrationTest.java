package com.fcusumano.mpp.application;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import static com.fcusumano.mpp.TestItems.allBonusesJson;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Flusso completo dei set custom su H2 in memoria: salvataggio, valutazione, proposte e pulizia alla cancellazione degli item. */
@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:mpp-custom-set;DB_CLOSE_DELAY=-1", "mpp.frontend.dist-path=target/no-frontend"})
@AutoConfigureMockMvc
class CustomSetFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;


    @Test
    void saveEvaluateBestAndCleanUp() throws Exception {
        final long hat = createItem("Elmo del mago", "HAT", "WIZARD", "{\"rarity\": \"UNCOMMON\", \"stat\": \"LUCK\", \"unit\": \"FLAT\", \"amount\": 5}");
        final long glasses = createItem("Occhiali del mago", "GLASSES", "WIZARD", null);
        final long chest = createItem("Tunica del mago", "CHEST", "WIZARD", null);
        final long back = createItem("Mantello del mago", "BACK", "WIZARD", null);
        final long otherHat = createItem("Cappello del giullare", "HAT", "JESTER", "{\"rarity\": \"UNCOMMON\", \"stat\": \"LUCK\", \"unit\": \"FLAT\", \"amount\": 2}");
        final long sword = createWeapon();

        //Valutazione di un set non salvato: 4 pezzi del mago attivano il bonus
        postJson("/api/custom-set/evaluate", "{\"itemIds\": [%d, %d, %d, %d]}".formatted(back, hat, chest, glasses))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").doesNotExist())
                .andExpect(jsonPath("$.bonusArmorSet").value("WIZARD"))
                .andExpect(jsonPath("$.pieces[0].specification").value("HAT"))
                .andExpect(jsonPath("$.pieces[3].specification").value("BACK"))
                .andExpect(jsonPath("$.levelStats.damageNow").value(8)) //Cappello e occhiali 1/10: 4 + 4
                .andExpect(jsonPath("$.levelStats.damageTop").value(792))
                .andExpect(jsonPath("$.levelStats.hpNow").value(8))
                .andExpect(jsonPath("$.stats[0].stat").value("DAMAGE"))
                .andExpect(jsonPath("$.stats[0].current").value(0)); //Il Danno del livello sta fuori dalla tabella

        final long setId = createSet("{\"name\": \"Fortuna\", \"itemIds\": [%d, %d]}".formatted(otherHat, glasses));
        mockMvc.perform(get("/api/custom-set").param("id", String.valueOf(setId)))
                .andExpect(jsonPath("$.name").value("Fortuna"))
                .andExpect(jsonPath("$.bonusArmorSet").doesNotExist())
                .andExpect(jsonPath("$.pieces", hasSize(2)));

        //Nome già usato, armi e slot doppi non ammessi
        postJson("/api/custom-set", "{\"name\": \"fortuna\", \"itemIds\": []}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CUSTOM_SET_NAME_ALREADY_EXISTS"));
        postJson("/api/custom-set", "{\"name\": \"Con arma\", \"itemIds\": [%d]}".formatted(sword))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("CUSTOM_SET_INVALID_PIECES"));
        postJson("/api/custom-set", "{\"name\": \"Due cappelli\", \"itemIds\": [%d, %d]}".formatted(hat, otherHat))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("CUSTOM_SET_INVALID_PIECES"));

        //Best potential per Fortuna: l'elmo del mago (5) batte il cappello del giullare (2)
        postJson("/api/custom-set/calculate-best-potential", "{\"primary\": {\"stat\": \"LUCK\", \"unit\": \"FLAT\"}}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].pieces[0].id").value(hat))
                .andExpect(jsonPath("$[0].bonusArmorSet").value("WIZARD"))
                .andExpect(jsonPath("$[1].pieces[0].id").value(otherHat));
        //Best now: tutti gli item sono Comuni, nessun potenziamento sbloccato
        postJson("/api/custom-set/calculate-best-now", "{\"primary\": {\"stat\": \"LUCK\", \"unit\": \"FLAT\"}, \"secondary\": {\"stat\": \"MAX_HP\", \"unit\": \"FLAT\"}}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stats[17].stat").value("LUCK"))
                .andExpect(jsonPath("$[0].stats[17].current").value(0));
        postJson("/api/custom-set/calculate-best-now", "{\"secondary\": {\"stat\": \"LUCK\", \"unit\": \"FLAT\"}}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

        //Sovrascrittura con un altro nome e altri pezzi
        mockMvc.perform(put("/api/custom-set").param("id", String.valueOf(setId)).contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\": \"Mago\", \"itemIds\": [%d, %d, %d, %d]}".formatted(hat, glasses, chest, back)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Mago"))
                .andExpect(jsonPath("$.bonusArmorSet").value("WIZARD"))
                .andExpect(jsonPath("$.bonusDescription").value("1% di probabilità di ottenere +10 danno elementale per 5 s quando attacchi"));

        //Cancellando un item lo si toglie dai set custom
        mockMvc.perform(delete("/api/item").param("id", String.valueOf(back))).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/custom-set/list"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].pieces", hasSize(3)))
                .andExpect(jsonPath("$[0].bonusArmorSet").doesNotExist());

        mockMvc.perform(delete("/api/custom-set").param("id", String.valueOf(setId))).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/custom-set").param("id", String.valueOf(setId)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("CUSTOM_SET_NOT_FOUND"));
    }

    @Test
    void weaponInCustomSet() throws Exception {
        final long hat = createItem("Elmo vichingo", "HAT", "VIKING", "{\"rarity\": \"UNCOMMON\", \"stat\": \"MELEE_DAMAGE\", \"unit\": \"FLAT\", \"amount\": 2}");
        final long pistol = id(postJson("/api/item", """
                {"name": "Pistola ad acqua", "type": "WEAPON", "specification": "RANGED", "bonuses": %s}"""
                                                .formatted(allBonusesJson("{\"rarity\": \"UNCOMMON\", \"stat\": \"LUCK\", \"unit\": \"FLAT\", \"amount\": 3}",
                                                                          "{\"rarity\": \"RARE\", \"stat\": \"DAMAGE\", \"unit\": \"PERCENT\", \"amount\": 10, \"own\": true}")))
                                       .andExpect(status().isCreated())
                                       .andExpect(jsonPath("$.bonuses[1].own").value(true))
                                       .andReturn());
        //Solo le armi hanno potenziamenti propri
        postJson("/api/item", """
                {"name": "Occhiali vichinghi", "type": "ARMOR", "specification": "GLASSES", "armorSet": "VIKING", "bonuses": %s}"""
                .formatted(allBonusesJson("{\"rarity\": \"RARE\", \"stat\": \"DAMAGE\", \"unit\": \"PERCENT\", \"amount\": 10, \"own\": true}")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

        //Arma valutata a parte, riga propria in fondo; il Danno del livello (4 dell'elmo + 4 dell'arma) sta fuori dalla tabella;
        //le armi consigliate seguono solo il set
        postJson("/api/custom-set/evaluate", "{\"itemIds\": [%d], \"weaponId\": %d}".formatted(hat, pistol))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weapon.id").value(pistol))
                .andExpect(jsonPath("$.levelStats.damageNow").value(8))
                .andExpect(jsonPath("$.levelStats.damageTop").value(792))
                .andExpect(jsonPath("$.levelStats.hpNow").value(0))
                .andExpect(jsonPath("$.stats[0].stat").value("DAMAGE"))
                .andExpect(jsonPath("$.stats[0].current").value(0))
                .andExpect(jsonPath("$.stats[0].weaponCurrent").doesNotExist())
                .andExpect(jsonPath("$.stats[1].weaponCurrent").doesNotExist())
                .andExpect(jsonPath("$.stats[22].own").value(true))
                .andExpect(jsonPath("$.stats[22].top").value(10))
                .andExpect(jsonPath("$.weaponAdvice.recommendedNow", hasSize(0))) //Elmo Comune: tutti i tipi a 0
                .andExpect(jsonPath("$.weaponAdvice.recommendedTop[0]").value("MELEE"))
                .andExpect(jsonPath("$.weaponAdvice.discouragedTop", hasSize(3)));
        postJson("/api/custom-set/evaluate", "{\"itemIds\": [], \"weaponId\": %d}".formatted(hat))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("CUSTOM_SET_INVALID_WEAPON"));

        final long setId = createSet("{\"name\": \"Vichingo armato\", \"itemIds\": [%d], \"weaponId\": %d}".formatted(hat, pistol));
        mockMvc.perform(get("/api/custom-set").param("id", String.valueOf(setId)))
                .andExpect(jsonPath("$.weapon.name").value("Pistola ad acqua"));

        //Cambiando categoria resta un'arma; cambiando tipologia esce dal set
        mockMvc.perform(put("/api/item").param("id", String.valueOf(pistol)).contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\": \"Pistola ad acqua\", \"type\": \"WEAPON\", \"specification\": \"ELEMENTAL\", \"bonuses\": %s}"
                                                 .formatted(allBonusesJson())))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/custom-set").param("id", String.valueOf(setId))).andExpect(jsonPath("$.weapon.id").value(pistol));
        mockMvc.perform(put("/api/item").param("id", String.valueOf(pistol)).contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\": \"Pistola ad acqua\", \"type\": \"ABILITY\", \"bonuses\": %s}".formatted(allBonusesJson())))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/custom-set").param("id", String.valueOf(setId)))
                .andExpect(jsonPath("$.weapon").doesNotExist())
                .andExpect(jsonPath("$.pieces", hasSize(1)));
    }

    private long createItem(String name, String slot, String armorSet, String bonus) throws Exception {
        return id(postJson("/api/item", """
                {"name": "%s", "type": "ARMOR", "specification": "%s", "armorSet": "%s", "bonuses": %s}"""
                .formatted(name, slot, armorSet, bonus == null ? allBonusesJson() : allBonusesJson(bonus))).andExpect(status().isCreated()).andReturn());
    }

    private long createWeapon() throws Exception {
        return id(postJson("/api/item", "{\"name\": \"Spada\", \"type\": \"WEAPON\", \"specification\": \"MELEE\", \"bonuses\": %s}"
                                   .formatted(allBonusesJson()))
                          .andExpect(status().isCreated()).andReturn());
    }

    private long createSet(String json) throws Exception {
        return id(postJson("/api/custom-set", json).andExpect(status().isCreated()).andReturn());
    }

    private ResultActions postJson(String path, String json) throws Exception {
        return mockMvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private static long id(MvcResult result) throws Exception {
        return Long.parseLong(result.getResponse().getContentAsString().replaceAll("^\\{\"id\":(\\d+),.*$", "$1")); //L'id è il primo campo
    }
}
