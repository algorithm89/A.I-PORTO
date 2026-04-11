#!/bin/bash
# ============================================================
# BublikStudios — Vault Unseal Script
# Run this EVERY TIME the server restarts.
# Vault is always sealed after restart — this unseals it.
# You need 3 of your 5 unseal keys (saved in your password manager).
# ============================================================

read -sp "Enter Key 1: " KEY1; echo
read -sp "Enter Key 2: " KEY2; echo
read -sp "Enter Key 3: " KEY3; echo

docker exec -it bublik-vault vault operator unseal $KEY1
docker exec -it bublik-vault vault operator unseal $KEY2
docker exec -it bublik-vault vault operator unseal $KEY3

docker exec -it bublik-vault vault status
