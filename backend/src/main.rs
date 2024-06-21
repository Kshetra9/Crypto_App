use actix_cors::Cors;
use actix_web::{web, App, HttpServer}; // Remove Responder from here
use reqwest;
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{interval, Duration}; // Corrected import for tokio::time

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Shared state with Mutex to safely share between threads
    let shared_data = Arc::new(Mutex::new(SharedData::new()));

    // Spawn a background task to update data periodically
    let data_updater = shared_data.clone();
    tokio::spawn(async move {
        update_data_periodically(data_updater).await;
    });

    // Configure Actix Web server
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .app_data(web::Data::new(shared_data.clone()))
            .wrap(cors)
            .service(web::resource("/metrics/mempool_size").route(web::get().to(fetch_mempool_size)))
            .service(web::resource("/metrics/block_height").route(web::get().to(fetch_block_height)))
            .service(web::resource("/metrics/total_circulating_bitcoin").route(web::get().to(fetch_total_circulating_bitcoin)))
            .service(web::resource("/metrics/market_price").route(web::get().to(fetch_market_price)))
            .service(web::resource("/metrics/average_block_size").route(web::get().to(fetch_average_block_size)))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}

// Struct to hold shared data
struct SharedData {
    mempool_size: String,
    block_height: String,
    total_circulating_bitcoin: String,
    market_price: String,
    average_block_size: String,
}

impl SharedData {
    fn new() -> Self {
        Self {
            mempool_size: String::new(),
            block_height: String::new(),
            total_circulating_bitcoin: String::new(),
            market_price: String::new(),
            average_block_size: String::new(),
        }
    }
}

// Function to update data periodically
async fn update_data_periodically(shared_data: Arc<Mutex<SharedData>>) {
    let mut interval = interval(Duration::from_secs(30)); // Update interval every 30 seconds

    loop {
        interval.tick().await;
        
        // Update all data fields
        let mut data = shared_data.lock().await;
        data.mempool_size = fetch_mempool_size().await;
        data.block_height = fetch_block_height().await;
        data.total_circulating_bitcoin = fetch_total_circulating_bitcoin().await;
        data.market_price = fetch_market_price().await;
        data.average_block_size = fetch_average_block_size().await;
    }
}

// Fetch functions remain unchanged, they now return data as a String

async fn fetch_mempool_size() -> String {
    match reqwest::get("https://blockchain.info/q/unconfirmedcount").await {
        Ok(response) => {
            if response.status().is_success() {
                response.text().await.unwrap_or_else(|_| "Error fetching mempool size".to_string())
            } else {
                "Error fetching mempool size".to_string()
            }
        }
        Err(_) => "Unable to fetch data".to_string(),
    }
}

async fn fetch_block_height() -> String {
    match reqwest::get("https://blockchain.info/q/getblockcount").await {
        Ok(response) => {
            if response.status().is_success() {
                response.text().await.unwrap_or_else(|_| "Error fetching block height".to_string())
            } else {
                "Error fetching block height".to_string()
            }
        }
        Err(_) => "Unable to fetch data".to_string(),
    }
}

async fn fetch_total_circulating_bitcoin() -> String {
    match reqwest::get("https://blockchain.info/q/totalbc").await {
        Ok(response) => {
            if response.status().is_success() {
                response.text().await.unwrap_or_else(|_| "Error fetching total circulating bitcoin".to_string())
            } else {
                "Error fetching total circulating bitcoin".to_string()
            }
        }
        Err(_) => "Unable to fetch data".to_string(),
    }
}

async fn fetch_market_price() -> String {
    match reqwest::get("https://blockchain.info/ticker").await {
        Ok(response) => {
            if response.status().is_success() {
                let json: Value = response.json().await.unwrap_or_else(|_| serde_json::json!({}));
                json["USD"]["last"].to_string()
            } else {
                "Error fetching market price".to_string()
            }
        }
        Err(_) => "Unable to fetch data".to_string(),
    }
}

async fn fetch_average_block_size() -> String {
    match reqwest::get("https://blockchain.info/q/24hravgblocksize").await {
        Ok(response) => {
            if response.status().is_success() {
                response.text().await.unwrap_or_else(|_| "Error fetching average block size".to_string())
            } else {
                "Error fetching average block size".to_string()
            }
        }
        Err(_) => "Unable to fetch data".to_string(),
    }
}
