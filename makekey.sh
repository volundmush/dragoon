#!/usr/bin/env bash
set -euo pipefail

dir="${TLS_DIR:-.certs}"
host="${TLS_HOSTNAME:-localhost}"
key="${TLS_KEY_PATH:-$dir/localhost.key}"
cert="${TLS_CERT_PATH:-$dir/localhost.crt}"

mkdir -p "$dir"

openssl req \
  -x509 \
  -newkey rsa:4096 \
  -sha256 \
  -days 365 \
  -nodes \
  -keyout "$key" \
  -out "$cert" \
  -subj "/CN=$host" \
  -addext "subjectAltName=DNS:$host,DNS:localhost,IP:127.0.0.1,IP:::1"

chmod 600 "$key"

printf 'Generated local TLS key: %s\n' "$key"
printf 'Generated local TLS cert: %s\n' "$cert"
