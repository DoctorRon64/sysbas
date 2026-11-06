export type Sneltoets = {
    toetsen: string[];
    naam?: string;
    beschrijving: string;
    // een teruggegeven tekst vervangt de beschrijving in de feedback
    actie: () => string | void;
};