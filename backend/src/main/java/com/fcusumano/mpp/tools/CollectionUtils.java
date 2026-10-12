package com.fcusumano.mpp.tools;

import java.util.Collection;
import java.util.Objects;

/** Utility generiche su {@link Collection}. */
public final class CollectionUtils {

    private CollectionUtils() {}

    public static boolean isEmpty(Collection<?> collection) {
        return collection == null || collection.isEmpty();
    }

    public static boolean isNotEmpty(Collection<?> collection) {
        return !isEmpty(collection);
    }

    /** Stessi elementi, indipendentemente da ordine e molteplicità. */
    public static <T> boolean identical(Collection<T> c1, Collection<T> c2) {
        if (c1 == null || c2 == null) return c1 == c2;
        return c1.containsAll(c2) && c2.containsAll(c1);
    }

    /** {@code true} se le due collezioni hanno almeno un elemento in comune. */
    public static <T> boolean atLeastOneInCommon(Collection<T> first, Collection<T> second) {
        if (isEmpty(first) || isEmpty(second)) return false;
        return first.stream().anyMatch(second::contains);
    }

    /**
     * Copia della collezione senza elementi null, dello stesso tipo concreto dell'originale
     * (richiede un costruttore pubblico senza argomenti, come ArrayList, HashSet, LinkedList...).
     */
    @SuppressWarnings("unchecked")
    public static <T, C extends Collection<T>> C removeNullElements(C collection) {
        if (collection == null) return null;
        try {
            final C copy = (C) collection.getClass().getDeclaredConstructor().newInstance();
            collection.stream().filter(Objects::nonNull).forEach(copy::add);
            return copy;
        } catch (ReflectiveOperationException e) {
            throw new IllegalArgumentException("Cannot create new instance of collection type: " + collection.getClass(), e);
        }
    }

    /** Come {@link #removeNullElements(Collection)}, ma restituisce null se il risultato è vuoto. */
    public static <T, C extends Collection<T>> C removeNullElementsAndNullIfEmpty(C collection) {
        final C result = removeNullElements(collection);
        return isEmpty(result) ? null : result;
    }
}
