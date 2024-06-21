# Use the official Rust image as a base image
FROM rust:latest

# Create a new directory for the app
WORKDIR /usr/src/app

# Copy the current directory contents into the container
COPY . .

# Build the Rust application
RUN cargo build --release

# Set the startup command to run the application
CMD ["./target/release/bitcoin_metrics"]
