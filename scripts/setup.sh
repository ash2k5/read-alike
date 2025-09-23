#!/bin/bash
echo "Setting up ReadAlike development environment..."
npm install
cp .env.example .env.local
echo "Setup completed! Please configure your .env.local file."