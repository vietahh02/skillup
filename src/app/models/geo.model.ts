export interface GeoPageResponse<T> {}


export interface GeoCity {
    id: number | string;
    name: string;
    code: string;
}

export interface GeoTownship {
    id: number | string;
    name: string;
    code: string;
    cityId: number | string;
}