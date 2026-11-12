use axum::{extract::Path, http::Method, routing::get, Json, Router};
use serde::Serialize;
use tower_http::{cors::{Any, CorsLayer}, trace::TraceLayer};

#[derive(Clone, Serialize)]
struct Sin {
    number: u8,
    name: &'static str,
    letter: &'static str,
    title: &'static str,
    description: &'static str,
    origin: &'static str,
    slug: &'static str,
}

#[derive(Clone, Serialize)]
struct Category {
    numeral: &'static str,
    slug: &'static str,
    title: &'static str,
    subtitle: &'static str,
    range: &'static str,
    emblem: &'static str,
    sins: Vec<Sin>,
}

fn categories() -> Vec<Category> {
    vec![
        Category { numeral: "I", slug: "primordial", title: "The Primordial Sins", subtitle: "Before there were gods, there were symbols.", range: "01 — 06", emblem: "Α", sins: vec![
            Sin { number:1,name:"Alpha",letter:"α",title:"The First Usurper",description:"The primordial tyrant who crowned himself the beginning of all things, cursed to begin every creation yet forbidden to witness its end.",origin:"Alpha denotes beginnings, coefficients, angles, and significance levels.",slug:"alpha" },
            Sin { number:2,name:"Beta",letter:"β",title:"The Second Sovereign",description:"The dethroned heir of Alpha, cursed to measure and scale every king while never being able to possess a throne of his own.",origin:"Beta coefficients measure effects in regression; beta also represents systematic market risk.",slug:"beta" },
            Sin { number:3,name:"Gamma",letter:"γ",title:"The Radiant Heretic",description:"The celestial executioner who abandoned flesh for an ethereal form, cursed to pierce all matter yet never touch a soul.",origin:"Gamma rays are among the most energetic forms of electromagnetic radiation.",slug:"gamma" },
            Sin { number:4,name:"Delta",letter:"δ / Δ",title:"The Ruinbringer",description:"The apostle of change who devours every constant, cursed to transform all he touches until nothing remains of what once was.",origin:"Delta represents change, differences, and variations.",slug:"delta" },
            Sin { number:5,name:"Epsilon",letter:"ε",title:"The Fallen Vinster King",description:"The forgotten monarch of abysmal realms, cursed to be smaller than every mercy, yet greater than the void he longs to be.",origin:"Epsilon represents arbitrarily small positive quantities, error tolerances, and limits.",slug:"epsilon" },
            Sin { number:6,name:"Zeta",letter:"ζ",title:"The Keeper of Forbidden Zeros",description:"The abyssal oracle who knows where the infinite falls to nothingness, cursed to hunt the hidden voids in existence without ever understanding where they do.",origin:"The Riemann zeta function and its mysterious nontrivial zeros.",slug:"zeta" },
        ]},
        Category { numeral: "II", slug: "eternity", title: "The Sins of Eternity and Decay", subtitle: "To create is to surrender a piece of the self.", range: "07 — 12", emblem: "Η", sins: vec![
            Sin { number:7,name:"Eta",letter:"η",title:"The Imperfect Ascendant",description:"The machine-born god who sacrificed countless worlds in pursuit of perfection, cursed to lose a fragment of himself with everything he creates.",origin:"Eta commonly represents efficiency, the ratio of useful output to input.",slug:"eta" },
            Sin { number:8,name:"Theta",letter:"θ",title:"The Architect of False Angles",description:"The blind geometrarch who bends the paths of apostles, cursed to know every direction in creation except the one that leads to his salvation.",origin:"Theta represents angles, rotations, and model parameters.",slug:"theta" },
            Sin { number:9,name:"Iota",letter:"ι",title:"The Imaginary Pretender",description:"The one who yearns to be real but is cursed to dwell beyond reality, an imaginary king whose existence the world refuses to acknowledge.",origin:"Iota resembles i, the imaginary unit in mathematics, though i is a Latin letter rather than a standard use of Greek iota.",slug:"iota" },
            Sin { number:10,name:"Kappa",letter:"κ",title:"The Curvature Tyrant",description:"The crooked sovereign who twists the lines of destinies, cursed to bend every fate toward his throne yet never escape the circle of his own damnation.",origin:"Kappa represents curvature in geometry and condition numbers in numerical mathematics.",slug:"kappa" },
            Sin { number:11,name:"Lambda",letter:"λ",title:"The Spectral Reaper",description:"The wave-bound wraith who commands the colors of creation, cursed to exist in endless entropy, forever returning to the darkness he had escaped.",origin:"Lambda represents wavelength, eigenvalues, and decay rates.",slug:"lambda" },
            Sin { number:12,name:"Mu",letter:"μ",title:"The Emperor of the Ordinary",description:"The merciless arbiter who reduces gods and mortals alike to a single view, cursed to embody the center of all existence while belonging to none of it.",origin:"Mu represents population means, micro-scale quantities, and physical coefficients.",slug:"mu" },
        ]},
        Category { numeral: "III", slug: "chaos", title: "The Sins of Chaos and Judgment", subtitle: "Every possible fate waits to be weighed.", range: "13 — 18", emblem: "Ξ", sins: vec![
            Sin { number:13,name:"Nu",letter:"ν",title:"The Eternal Resonant",description:"The hollow prophet who hears the dissonance of every universe, cursed to listen through eternity without ever finding a moment of silence.",origin:"Nu commonly represents frequency in physics.",slug:"nu" },
            Sin { number:14,name:"Xi",letter:"ξ",title:"The Uncertain Devourer",description:"The faceless gambit who casts the fate of civilizations as dice, cursed to command a thousand possible futures but never know which shall become his.",origin:"Xi is frequently used for random variables and stochastic quantities.",slug:"xi" },
            Sin { number:15,name:"Omicron",letter:"ο",title:"The Hollow Impostor",description:"The nameless usurper who wears the face of Void, cursed to resemble the void without ever possessing its infinite peace.",origin:"Omicron resembles 0 and O; unlike many Greek letters, it has few established mathematical uses.",slug:"omicron" },
            Sin { number:16,name:"Pi",letter:"π",title:"The Irrational Godking",description:"The irrational crowned immortal whose true name can never be spoken, cursed to wander endlessly, never repeating, never ending, never complete.",origin:"Pi is an irrational, transcendental constant representing circumference divided by diameter.",slug:"pi" },
            Sin { number:17,name:"Rho",letter:"ρ",title:"The Burdened Colossus",description:"The iron titan who devoured the mass of fallen stars, cursed to bear the weight of all creation within a body too small to contain it.",origin:"Rho represents density, mass per unit volume.",slug:"rho" },
            Sin { number:18,name:"Sigma",letter:"σ / Σ",title:"The Grand Accumulator",description:"The collector of sins for broken souls, cursed to carry the weight of every sin while his own worth remains forever uncounted.",origin:"Capital Sigma denotes summation; lowercase sigma represents standard deviation.",slug:"sigma" },
        ]},
        Category { numeral: "IV", slug: "finality", title: "The Sins of the Finality", subtitle: "The last page was written before the first.", range: "19 — 24", emblem: "Ω", sins: vec![
            Sin { number:19,name:"Tau",letter:"τ",title:"The Chronophage",description:"The slave of time who enslaved the decay of empires, cursed to measure every passing eternity, uncertain of when he will finally fulfill his purpose.",origin:"Tau represents time constants, decay times, and proper time.",slug:"tau" },
            Sin { number:20,name:"Upsilon",letter:"υ",title:"The Bound Quarklord",description:"The subatomic sovereign who sought dominion over matter itself, cursed to exist as a fleeting union of alternate personalities, bound together only to be eventually annihilated.",origin:"Capital Upsilon (ϒ/Υ) names a particle family of bottomonium states, bound bottom quark–antiquark pairs.",slug:"upsilon" },
            Sin { number:21,name:"Phi",letter:"φ / Φ",title:"The Gilded Deceiver",description:"The golden archfiend who seduced creation with perfection, cursed to discover that even divine beauty cannot conceal the darkness of this wretched realm.",origin:"Phi represents the golden ratio, angles, phases, and physical potentials.",slug:"phi" },
            Sin { number:22,name:"Chi",letter:"χ",title:"The Judge of Deviance",description:"The merciless inquisitor who weighs the sins of reality against the divine prophecy, cursed to condemn deviation while never knowing whether the one who passes judgment is Divine or Blasphemous.",origin:"Chi-squared statistics measure discrepancies between observed and expected values.",slug:"chi" },
            Sin { number:23,name:"Psi",letter:"ψ",title:"The Phantom of All Realities",description:"The quantum necromancer who inhabits every possible fate at once, cursed to become one when the eyes of the Silence Before Genesis finally turn upon him.",origin:"Psi represents quantum wavefunctions, whose measurement outcomes follow probabilistic rules.",slug:"psi" },
            Sin { number:24,name:"Omega",letter:"ω / Ω",title:"The End",description:"The final archangel who waits beyond the death of infinity and all, cursed to be the end, yet never granted an ending of his own.",origin:"Omega is the last Greek letter; ω represents angular frequency and Ω appears in mathematics as an infinite ordinal.",slug:"omega" },
        ]},
    ]
}

async fn health() -> Json<serde_json::Value> { Json(serde_json::json!({"status":"ok","service":"twenty-four-sins-api"})) }
async fn list_categories() -> Json<Vec<Category>> { Json(categories()) }
async fn category(Path(slug): Path<String>) -> Result<Json<Category>, axum::http::StatusCode> {
    categories().into_iter().find(|item| item.slug == slug).map(Json).ok_or(axum::http::StatusCode::NOT_FOUND)
}
async fn sin(Path(slug): Path<String>) -> Result<Json<Sin>, axum::http::StatusCode> {
    categories().into_iter().flat_map(|item| item.sins).find(|item| item.slug == slug).map(Json).ok_or(axum::http::StatusCode::NOT_FOUND)
}

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new().allow_origin(Any).allow_methods([Method::GET]).allow_headers(Any);
    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/categories", get(list_categories))
        .route("/api/categories/{slug}", get(category))
        .route("/api/sins/{slug}", get(sin))
        .layer(cors)
        .layer(TraceLayer::new_for_http());
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.expect("bind backend on port 3000");
    println!("Twenty Four Sins API listening on http://localhost:3000");
    axum::serve(listener, app).await.expect("serve API");
}
