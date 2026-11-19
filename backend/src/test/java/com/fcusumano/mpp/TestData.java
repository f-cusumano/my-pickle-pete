package com.fcusumano.mpp;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static com.fcusumano.mpp.TestItems.allBonusesJson;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Un po' di tutto attraverso le API (da usare con {@link TestUsers#censusByAdminOthersByOwner}): due armature e un'arma
 * censite, l'effetto di un set, i progressi dell'utente personale su un pezzo e un suo Custom Set.
 */
public final class TestData {

    public static final String CUSTOM_SET_NAME = "Fortuna";


    private TestData() {}


    /** Id del cappello, l'item con i progressi (Epico 25). */
    public static long populate(MockMvc mockMvc) throws Exception {
        final long hat = create(mockMvc, """
                {"name": "Cappello da cowboy", "type": "ARMOR", "specification": "HAT", "armorSet": "COWBOY", "bonuses": %s}"""
                .formatted(allBonusesJson("{\"rarity\": \"UNCOMMON\", \"stat\": \"LUCK\", \"unit\": \"FLAT\", \"amount\": 2}")));
        final long glasses = create(mockMvc, """
                {"name": "Occhiali da cowboy", "type": "ARMOR", "specification": "GLASSES", "armorSet": "COWBOY", "bonuses": %s}"""
                .formatted(allBonusesJson()));
        create(mockMvc, """
                {"name": "Fucile a pompa", "type": "WEAPON", "specification": "RANGED", "bonuses": %s}"""
                .formatted(allBonusesJson("{\"rarity\": \"LEGENDARY\", \"stat\": \"PIERCE\", \"unit\": \"FLAT\", \"amount\": 1, \"own\": true}")));
        mockMvc.perform(put("/api/armor-set").param("armorSet", "COWBOY").contentType(MediaType.APPLICATION_JSON)
                                .content("{\"bonusDescription\": \"Più veloce sotto il 30% di HP\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/item/rarity").param("id", String.valueOf(hat)).param("rarity", "EPIC")).andExpect(status().isOk());
        mockMvc.perform(put("/api/item/level").param("id", String.valueOf(hat)).param("level", "25")).andExpect(status().isOk());
        mockMvc.perform(post("/api/custom-set").contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\": \"%s\", \"itemIds\": [%d, %d]}".formatted(CUSTOM_SET_NAME, hat, glasses)))
                .andExpect(status().isCreated());
        return hat;
    }

    private static long create(MockMvc mockMvc, String json) throws Exception {
        final MvcResult result = mockMvc.perform(post("/api/item").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andReturn();
        return Long.parseLong(result.getResponse().getContentAsString().replaceAll("^\\{\"id\":(\\d+),.*$", "$1")); //L'id è il primo campo
    }
}
