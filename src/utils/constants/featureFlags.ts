// Next inyecta process.env.NEXT_PUBLIC_* en build: hay que referenciarlas con el nombre literal.

export const MAP_V1_ENABLED = process.env.NEXT_PUBLIC_MAP_V1_ENABLED !== "false";

export const MAP_V2_ENABLED = process.env.NEXT_PUBLIC_MAP_V2_ENABLED === "true";
