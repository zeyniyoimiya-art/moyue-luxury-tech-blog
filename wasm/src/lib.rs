//! moyue-wasm — utilidades numéricas compiladas a WebAssembly.
//! Compilar: `wasm-pack build --target web --release`
//! Autora: Lin Yue 林玥

use wasm_bindgen::prelude::*;

/// Clasifica una lista de contribuciones diarias en niveles del jardín:
/// 0 = tierra, 1 = brote de bambú (1-3), 2 = bambú alto (4-7), 3 = ciruelo en flor (8+).
#[wasm_bindgen]
pub fn garden_levels(counts: &[u32]) -> Vec<u8> {
    counts
        .iter()
        .map(|&c| match c {
            0 => 0,
            1..=3 => 1,
            4..=7 => 2,
            _ => 3,
        })
        .collect()
}

/// Distancia ortodrómica (haversine) en km entre dos puntos — usada para medir
/// los tramos de la Ruta de la Seda histórica y digital.
#[wasm_bindgen]
pub fn haversine_km(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    const R: f64 = 6371.0;
    let (p1, p2) = (lat1.to_radians(), lat2.to_radians());
    let dp = (lat2 - lat1).to_radians();
    let dl = (lon2 - lon1).to_radians();
    let a = (dp / 2.0).sin().powi(2) + p1.cos() * p2.cos() * (dl / 2.0).sin().powi(2);
    2.0 * R * a.sqrt().asin()
}

/// Longitud total de una ruta dada como pares [lat, lon, lat, lon, ...].
#[wasm_bindgen]
pub fn route_length_km(coords: &[f64]) -> f64 {
    coords
        .chunks_exact(2)
        .collect::<Vec<_>>()
        .windows(2)
        .map(|w| haversine_km(w[0][0], w[0][1], w[1][0], w[1][1]))
        .sum()
}

/// Crecimiento anual compuesto (CAGR) — p. ej. estaciones base 5G entre dos años.
#[wasm_bindgen]
pub fn cagr(start: f64, end: f64, years: f64) -> f64 {
    if start <= 0.0 || years <= 0.0 {
        return 0.0;
    }
    (end / start).powf(1.0 / years) - 1.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn niveles_del_jardin() {
        assert_eq!(garden_levels(&[0, 2, 5, 12]), vec![0, 1, 2, 3]);
    }

    #[test]
    fn xian_samarcanda() {
        // Xi'an → Samarcanda ≈ 3.500 km en línea recta
        let d = haversine_km(34.34, 108.94, 39.65, 66.96);
        assert!(d > 3400.0 && d < 3700.0);
    }
}
