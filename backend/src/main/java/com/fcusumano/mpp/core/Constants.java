package com.fcusumano.mpp.core;

/** Costanti di gioco. */
public final class Constants {

    /** Incremento della caratteristica base per ogni livello: livello N = +4N. */
    public static final int BASE_STAT_PER_LEVEL = 4;
    /** Pezzi che compongono un set di armatura (uno per slot). */
    public static final int ARMOR_SET_PIECES = 5;
    /** Pezzi dello stesso set da indossare per attivarne il bonus. */
    public static final int ARMOR_SET_BONUS_THRESHOLD = 4;
    public static final int MAX_ITEM_NAME_LENGTH = 100;
    public static final int MAX_ITEM_DESCRIPTION_LENGTH = 1000;
    public static final int MAX_BONUS_DESCRIPTION_LENGTH = 500;
    public static final int MAX_CUSTOM_SET_NAME_LENGTH = 100;
    /** Proposte restituite da Best now e Best potential. */
    public static final int BEST_SET_PROPOSALS = 3;


    private Constants() {}
}
