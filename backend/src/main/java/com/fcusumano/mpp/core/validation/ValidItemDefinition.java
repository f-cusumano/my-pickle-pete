package com.fcusumano.mpp.core.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Coerenza tra tipologia, specifica, set e potenziamenti di un item censito (R23). */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ItemDefinitionValidator.class)
public @interface ValidItemDefinition {

    String message() default "Item definition is not consistent.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
