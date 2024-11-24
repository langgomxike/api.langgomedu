export const parseQueryNumber = (queryParam: any, defaultValue?: number): number | undefined => {
    return queryParam !== undefined && queryParam !== "" ? Number(queryParam) : defaultValue;
  };
  
  export const parseQueryString = (queryParam: any, defaultValue?: string): string | undefined => {
    return queryParam !== undefined && queryParam !== "" ? String(queryParam) : defaultValue;
  };
  
  export const parseQueryBoolean = (queryParam: any): boolean | undefined => {
    return queryParam !== undefined && queryParam !== "" ? Boolean(queryParam) : undefined;
  };

  export const parseNumericFilter = (value: string | undefined): number[]  => {
    if (!value || value.trim() === "") return [];
    return value.split(",").map((v) => Number(v.trim())).filter((v) => !isNaN(v));
  }