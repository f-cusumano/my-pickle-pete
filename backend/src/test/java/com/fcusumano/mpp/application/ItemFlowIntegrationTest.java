package com.fcusumano.mpp.application;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Flusso completo su H2 in memoria: censimento, avanzamento e set completi. */
@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:mpp-flow;DB_CLOSE_DELAY=-1", "mpp.frontend.dist-path=target/no-frontend"})
@AutoConfigureMockMvc
class ItemFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;


    @Test
    void censusProgressAndFullSet() throws Exception {
        final long hatId = create("""
                {"name": "Cappello da cowboy", "type": "ARMOR", "specification": "HAT", "armorSet": "COWBOY",
                 "bonuses": [{"rarity": "UNCOMMON", "stat": "CRIT_CHANCE", "unit": "PERCENT", "amount": 2},
                             {"rarity": "RARE", "stat": "LUCK", "unit": "PERCENT", "amount": 3}]}""");

        //Parte da Comune 1/10 con +4% Danno
        mockMvc.perform(get("/api/item").param("id", String.valueOf(hatId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rarity").value("COMMON"))
                .andExpect(jsonPath("$.level").value(1))
                .andExpect(jsonPath("$.maxLevel").value(10))
                .andExpect(jsonPath("$.baseStat").value("DAMAGE"))
                .andExpect(jsonPath("$.baseStatValue").value(4))
                .andExpect(jsonPath("$.bonuses[0].unlocked").value(false));

        mockMvc.perform(put("/api/item/rarity").param("id", String.valueOf(hatId)).param("rarity", "UNCOMMON"))
                .andExpect(jsonPath("$.rarity").value("UNCOMMON"))
                .andExpect(jsonPath("$.maxLevel").value(20))
                .andExpect(jsonPath("$.bonuses[0].unlocked").value(true));
        mockMvc.perform(put("/api/item/level").param("id", String.valueOf(hatId)).param("level", "15"))
                .andExpect(jsonPath("$.level").value(15))
                .andExpect(jsonPath("$.baseStatValue").value(60));
        mockMvc.perform(put("/api/item/level").param("id", String.valueOf(hatId)).param("level", "21"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("LEVEL_OUT_OF_RANGE"));

        //Set Cowboy con un solo pezzo: bonus non attivo, Danno attuale 60 e top 396 + 0
        mockMvc.perform(get("/api/armor-set/full-set/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(11)))
                .andExpect(jsonPath("$[8].armorSet").value("COWBOY"))
                .andExpect(jsonPath("$[8].bonusActive").value(false))
                .andExpect(jsonPath("$[8].bonusDescription").value("+30% velocità d'attacco sotto il 30% di HP"))
                .andExpect(jsonPath("$[8].pieces", hasSize(1)))
                .andExpect(jsonPath("$[8].stats[0].stat").value("DAMAGE"))
                .andExpect(jsonPath("$[8].stats[0].current").value(60))
                .andExpect(jsonPath("$[8].stats[0].top").value(396))
                .andExpect(jsonPath("$[8].stats[0].currentHighlight").value("BEST"))
                //Fortuna in percentuale: riga in più subito dopo la Fortuna a valore
                .andExpect(jsonPath("$[8].stats", hasSize(23)))
                .andExpect(jsonPath("$[8].stats[18].stat").value("LUCK"))
                .andExpect(jsonPath("$[8].stats[18].unit").value("PERCENT"))
                .andExpect(jsonPath("$[8].stats[18].top").value(3));

        //Rarità più alta: livello invariato; poi di nuovo Comune: livello al nuovo massimo
        mockMvc.perform(put("/api/item/rarity").param("id", String.valueOf(hatId)).param("rarity", "ARTIFACT"))
                .andExpect(jsonPath("$.rarity").value("ARTIFACT"))
                .andExpect(jsonPath("$.level").value(15))
                .andExpect(jsonPath("$.bonuses[1].unlocked").value(true));
        mockMvc.perform(put("/api/item/rarity").param("id", String.valueOf(hatId)).param("rarity", "COMMON"))
                .andExpect(jsonPath("$.rarity").value("COMMON"))
                .andExpect(jsonPath("$.level").value(10))
                .andExpect(jsonPath("$.bonuses[0].unlocked").value(false));
        mockMvc.perform(put("/api/item/rarity").param("id", String.valueOf(hatId)).param("rarity", "MYTHIC"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void censusRejectsDuplicatesAndInconsistentData() throws Exception {
        create("""
                {"name": "Stivali del bandito", "type": "ARMOR", "specification": "BOOTS", "armorSet": "BANDIT"}""");
        mockMvc.perform(post("/api/item").contentType(MediaType.APPLICATION_JSON).content("""
                        {"name": "stivali del bandito", "type": "ARMOR", "specification": "BACK", "armorSet": "BANDIT"}"""))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ITEM_NAME_ALREADY_EXISTS"));
        mockMvc.perform(post("/api/item").contentType(MediaType.APPLICATION_JSON).content("""
                        {"name": "Altri stivali", "type": "ARMOR", "specification": "BOOTS", "armorSet": "BANDIT"}"""))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ARMOR_SLOT_ALREADY_TAKEN"));
        mockMvc.perform(post("/api/item").contentType(MediaType.APPLICATION_JSON).content("""
                        {"name": "Barattolo", "type": "ABILITY", "specification": "HAT", "armorSet": "BANDIT"}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.messages", hasSize(2)));
    }

    @Test
    void deleteItem() throws Exception {
        final long id = create("""
                {"name": "Pistola ad acqua", "type": "WEAPON", "specification": "RANGED"}""");
        mockMvc.perform(delete("/api/item").param("id", String.valueOf(id))).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/item").param("id", String.valueOf(id)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ITEM_NOT_FOUND"));
    }

    @Test
    void constantsAndSetBonusCensus() throws Exception {
        mockMvc.perform(get("/api/constants/game"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stats", hasSize(22)))
                .andExpect(jsonPath("$.rarities[5].maxLevel").value(99))
                .andExpect(jsonPath("$.sortOrders[1].typeOrder[0]").value("WEAPON"));
        mockMvc.perform(put("/api/armor-set").param("armorSet", "VAMPIRE").contentType(MediaType.APPLICATION_JSON)
                                .content("{\"bonusDescription\": \"  Furto di vita extra  \"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bonusDescription").value("Furto di vita extra"));
        mockMvc.perform(get("/api/armor-set/list"))
                .andExpect(jsonPath("$[2].armorSet").value("VAMPIRE"))
                .andExpect(jsonPath("$[2].bonusDescription").value("Furto di vita extra"));
    }

    private long create(String json) throws Exception {
        final MvcResult result = mockMvc.perform(post("/api/item").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andReturn();
        final String body = result.getResponse().getContentAsString();
        return Long.parseLong(body.replaceAll("^\\{\"id\":(\\d+),.*$", "$1")); //L'id è il primo campo della risposta
    }
}
