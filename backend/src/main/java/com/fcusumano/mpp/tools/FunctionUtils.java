package com.fcusumano.mpp.tools;

import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.function.UnaryOperator;

/** Composizione di funzioni e predicati, e fabbriche di comportamenti riusabili. */
public final class FunctionUtils {

    private FunctionUtils() {}

    /** AND di tutti i predicati non null; null se la lista è vuota (= "nessun filtro"). */
    public static <T> Predicate<T> allOf(List<Predicate<T>> predicates) {
        if (predicates == null) return null;
        return predicates.stream().filter(Objects::nonNull).reduce(Predicate::and).orElse(null);
    }

    /** OR di tutti i predicati non null; null se la lista è vuota. */
    public static <T> Predicate<T> anyOf(List<Predicate<T>> predicates) {
        if (predicates == null) return null;
        return predicates.stream().filter(Objects::nonNull).reduce(Predicate::or).orElse(null);
    }

    /** Applica in sequenza le trasformazioni non null; identità se non ce ne sono. */
    @SafeVarargs
    public static <T> UnaryOperator<T> chain(UnaryOperator<T>... operators) {
        UnaryOperator<T> result = UnaryOperator.identity();
        for (UnaryOperator<T> op : operators) {
            if (op == null) continue;
            final UnaryOperator<T> previous = result;
            result = t -> op.apply(previous.apply(t));
        }
        return result;
    }

    /** Applica la funzione solo se l'input non è null. */
    public static <T, R> Function<T, R> nullSafe(Function<T, R> function) {
        return t -> t == null ? null : function.apply(t);
    }

    /** Fornitore di eccezione da passare a {@code orElseThrow}: {@code orElseThrow(exception(NotFound::new, "id '%s'", id))}. */
    public static <X extends RuntimeException> Supplier<X> exception(Function<String, X> constructor, String pattern, Object... args) {
        return () -> constructor.apply(String.format(pattern, args));
    }

    /** Consumer che lancia sempre: utile con {@code ifPresent} per vietare un elemento già esistente. */
    public static <T, X extends RuntimeException> Consumer<T> throwing(Supplier<X> exception) {
        return found -> {
            throw exception.get();
        };
    }
}
