package com.fcusumano.mpp.core.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.List;

/** Un messaggio per ogni regola violata, così il censimento mostra tutti gli errori insieme. */
public class ItemDefinitionValidator implements ConstraintValidator<ValidItemDefinition, ItemDefinitionProvider> {

    @Override
    public boolean isValid(ItemDefinitionProvider provider, ConstraintValidatorContext context) {
        if (provider == null) return true;
        final List<String> violations = ItemDefinitionRules.violations(provider.toDefinition());
        if (violations.isEmpty()) return true;
        context.disableDefaultConstraintViolation();
        violations.forEach(violation -> context.buildConstraintViolationWithTemplate(escape(violation)).addConstraintViolation());
        return false;
    }

    /** I messaggi contengono valori dell'utente: vanno protetti dall'interpolazione EL. */
    private static String escape(String message) {
        return message.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}").replace("$", "\\$");
    }
}
